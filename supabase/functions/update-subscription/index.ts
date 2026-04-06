import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

type UpdateBody = {
  newPlan?: string;
  newBillingCycle?: string;
  extraSeats?: number;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tierRank = (t: string): number => {
  const x = String(t || "").trim().toLowerCase();
  if (x === "free" || x === "preview") return 0;
  if (x === "standard") return 1;
  if (x === "pro") return 2;
  return 0;
};

const normalizePlan = (value: unknown): "standard" | "pro" | "" => {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "standard" || raw === "pro" ? raw : "";
};

const normalizeCycle = (value: unknown): "monthly" | "yearly" | "" => {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "monthly" || raw === "yearly" ? raw : "";
};

const normalizeExtraSeats = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(97, Math.floor(n));
};

const jsonError = (msg: string, status: number) =>
  new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonError("Missing Supabase secrets", 500);
    }
    if (!stripeSecretKey) {
      return jsonError("Missing STRIPE_SECRET_KEY", 500);
    }

    const priceMap: Record<string, Record<string, string>> = {
      standard: {
        monthly: Deno.env.get("STRIPE_STANDARD_MONTHLY_PRICE_ID") || "",
        yearly: Deno.env.get("STRIPE_STANDARD_YEARLY_PRICE_ID") || "",
      },
      pro: {
        monthly: Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID") || "",
        yearly: Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID") || "",
      },
    };
    const extraSeatPriceId = Deno.env.get("STRIPE_PRO_EXTRA_SEAT_PRICE_ID") || "";

    // Auth
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return jsonError("Not authenticated", 401);
    }

    // Parse body
    const body = (await req.json()) as UpdateBody;
    const newPlan = normalizePlan(body?.newPlan);
    const newBillingCycle = normalizeCycle(body?.newBillingCycle);
    const extraSeats = newPlan === "pro" ? normalizeExtraSeats(body?.extraSeats) : 0;

    if (!newPlan || !newBillingCycle) {
      return jsonError("Invalid newPlan or newBillingCycle", 400);
    }

    const newPriceId = priceMap[newPlan]?.[newBillingCycle] || "";
    if (!newPriceId) {
      return jsonError(`Price ID not configured for ${newPlan}/${newBillingCycle}`, 500);
    }

    // Load profile
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id, subscription_tier")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return jsonError(`Failed to load profile: ${profileError.message}`, 500);
    }

    const subscriptionId = String(profile?.stripe_subscription_id || "").trim();
    if (!subscriptionId) {
      return jsonError("No active subscription found. Use checkout to subscribe.", 400);
    }

    // Retrieve current subscription from Stripe
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || subscription.status === "canceled") {
      return jsonError("Subscription is canceled. Use checkout to start a new one.", 400);
    }

    // Find the main plan item (not extra seat item)
    const mainItem = subscription.items.data.find((item) => {
      const pid = String(item.price?.id || "");
      // It's the main item if it matches any base plan price
      for (const plan of Object.values(priceMap)) {
        for (const priceId of Object.values(plan)) {
          if (priceId && pid === priceId) return true;
        }
      }
      return false;
    });

    if (!mainItem) {
      return jsonError("Could not identify the main subscription item.", 500);
    }

    // Find existing extra seat item (if any)
    const existingSeatItem = extraSeatPriceId
      ? subscription.items.data.find((item) => String(item.price?.id || "") === extraSeatPriceId)
      : null;

    // Build update items array
    // Schedule change at period end: proration_behavior = 'none'
    const items: Array<{ id?: string; price?: string; quantity?: number; deleted?: boolean }> = [];

    // Update main plan item
    items.push({
      id: mainItem.id,
      price: newPriceId,
      quantity: 1,
    });

    // Handle extra seats
    if (newPlan === "pro" && extraSeats > 0 && extraSeatPriceId) {
      if (existingSeatItem) {
        // Update existing seat item quantity
        items.push({
          id: existingSeatItem.id,
          price: extraSeatPriceId,
          quantity: extraSeats,
        });
      } else {
        // Add new seat line item
        items.push({
          price: extraSeatPriceId,
          quantity: extraSeats,
        });
      }
    } else if (existingSeatItem) {
      // Switching away from Pro or no extra seats needed — remove seat item
      items.push({
        id: existingSeatItem.id,
        deleted: true,
      });
    }

    const totalSeats = newPlan === "pro" ? 3 + extraSeats : 1;
    const currentTier = String(profile?.subscription_tier || "free").toLowerCase();
    const isDowngrade = tierRank(newPlan) < tierRank(currentTier);

    if (isDowngrade) {
      const effectiveDate = new Date(subscription.current_period_end * 1000).toISOString();
      await supabaseAdmin
        .from("profiles")
        .update({
          pending_subscription_tier: newPlan,
          pending_tier_effective_date: effectiveDate,
        })
        .eq("id", user.id);
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items,
      proration_behavior: isDowngrade ? "none" : "always_invoice",
      metadata: {
        user_id: user.id,
        plan: newPlan,
        billing_cycle: newBillingCycle,
        seat_count: String(totalSeats),
      },
    });

    if (!isDowngrade) {
      await supabaseAdmin
        .from("profiles")
        .update({
          pending_subscription_tier: null,
          pending_tier_effective_date: null,
        })
        .eq("id", user.id);
    }

    const periodEndIso = updated.current_period_end
      ? new Date(updated.current_period_end * 1000).toISOString()
      : null;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          subscriptionId: updated.id,
          plan: newPlan,
          billingCycle: newBillingCycle,
          seatCount: totalSeats,
          currentPeriodEnd: periodEndIso,
          deferred: isDowngrade,
          effectiveDate: isDowngrade ? periodEndIso : null,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
