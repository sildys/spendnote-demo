import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

type CheckoutBody = {
  plan?: string;
  billingCycle?: string;
  successUrl?: string;
  cancelUrl?: string;
  quantity?: number;
  extraSeats?: number;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizePlan = (value: unknown): "standard" | "pro" | "" => {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "standard" || raw === "pro" ? raw : "";
};

const normalizeCycle = (value: unknown): "monthly" | "yearly" | "" => {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "monthly" || raw === "yearly" ? raw : "";
};

const normalizeQuantity = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(100, Math.floor(n));
};

const normalizeExtraSeats = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(97, Math.floor(n));
};

const normalizeReturnUrl = (value: unknown, fallback: string, appBaseUrl: string): string => {
  const candidate = String(value || "").trim();
  if (!candidate) return fallback;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return fallback;

    if (appBaseUrl) {
      const appBase = new URL(appBaseUrl);
      if (parsed.origin !== appBase.origin) return fallback;
    }

    return parsed.toString();
  } catch (_) {
    return fallback;
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "";

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceMap = {
      standard: {
        monthly: Deno.env.get("STRIPE_STANDARD_MONTHLY_PRICE_ID") || "",
        yearly: Deno.env.get("STRIPE_STANDARD_YEARLY_PRICE_ID") || "",
      },
      pro: {
        monthly: Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID") || "",
        yearly: Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID") || "",
      },
    } as const;

    const authHeader = req.headers.get("Authorization") || "";

    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as CheckoutBody;
    const plan = normalizePlan(body?.plan);
    const billingCycle = normalizeCycle(body?.billingCycle);
    const quantity = normalizeQuantity(body?.quantity);
    const extraSeats = plan === "pro" ? normalizeExtraSeats(body?.extraSeats) : 0;
    const extraSeatPriceId = Deno.env.get("STRIPE_PRO_EXTRA_SEAT_PRICE_ID") || "";

    if (!plan || !billingCycle) {
      return new Response(JSON.stringify({ error: "Invalid plan or billingCycle" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceId = priceMap[plan][billingCycle];
    if (!priceId) {
      return new Response(JSON.stringify({ error: `Price ID not configured for ${plan}/${billingCycle}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const defaultSuccess = appBaseUrl ? `${appBaseUrl.replace(/\/$/, "")}/?billing=success` : "https://spendnote.app/?billing=success";
    const defaultCancel = appBaseUrl ? `${appBaseUrl.replace(/\/$/, "")}/?billing=cancel` : "https://spendnote.app/?billing=cancel";
    const successUrl = normalizeReturnUrl(body?.successUrl, defaultSuccess, appBaseUrl);
    const cancelUrl = normalizeReturnUrl(body?.cancelUrl, defaultCancel, appBaseUrl);

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: `Failed to load profile: ${profileError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    let stripeCustomerId = String(profile?.stripe_customer_id || "").trim();

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: String(profile?.email || user.email || "").trim() || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      stripeCustomerId = String(customer.id || "").trim();

      if (stripeCustomerId) {
        await supabaseAdmin
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", user.id);
      }
    }

    const lineItems: Array<{ price: string; quantity: number }> = [
      { price: priceId, quantity },
    ];

    if (plan === "pro" && extraSeats > 0 && extraSeatPriceId) {
      lineItems.push({ price: extraSeatPriceId, quantity: extraSeats });
    }

    const totalSeats = plan === "pro" ? 3 + extraSeats : 1;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      billing_address_collection: "required",
      customer_update: { address: "auto", name: "auto" },
      metadata: {
        user_id: user.id,
        plan,
        billing_cycle: billingCycle,
        seat_count: String(totalSeats),
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
          billing_cycle: billingCycle,
          seat_count: String(totalSeats),
        },
      },
    });

    return new Response(
      JSON.stringify({ success: true, url: session.url, sessionId: session.id }),
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
