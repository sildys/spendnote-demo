import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { renderSubscriptionDowngradedTemplate, renderTeamMemberRemovedTemplate } from "../_shared/email-templates.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const resolveTierFromPrice = (priceId: string): "standard" | "pro" | "" => {
  const raw = String(priceId || "").trim();
  const standardMonthly = Deno.env.get("STRIPE_STANDARD_MONTHLY_PRICE_ID") || "";
  const standardYearly = Deno.env.get("STRIPE_STANDARD_YEARLY_PRICE_ID") || "";
  const proMonthly = Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID") || "";
  const proYearly = Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID") || "";

  if (!raw) return "";
  if (raw === standardMonthly || raw === standardYearly) return "standard";
  if (raw === proMonthly || raw === proYearly) return "pro";
  return "";
};

const resolveCycleFromPrice = (priceId: string): "monthly" | "yearly" | "" => {
  const raw = String(priceId || "").trim();
  const standardMonthly = Deno.env.get("STRIPE_STANDARD_MONTHLY_PRICE_ID") || "";
  const standardYearly = Deno.env.get("STRIPE_STANDARD_YEARLY_PRICE_ID") || "";
  const proMonthly = Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID") || "";
  const proYearly = Deno.env.get("STRIPE_PRO_YEARLY_PRICE_ID") || "";

  if (!raw) return "";
  if (raw === standardMonthly || raw === proMonthly) return "monthly";
  if (raw === standardYearly || raw === proYearly) return "yearly";
  return "";
};

const billingStatusFromStripe = (status: string): string => {
  const raw = String(status || "").trim().toLowerCase();
  const allowed = new Set([
    "trialing",
    "active",
    "past_due",
    "canceled",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "paused",
  ]);
  return allowed.has(raw) ? raw : "active";
};

const findUserIdFromSubscription = async (supabaseAdmin: ReturnType<typeof createClient>, sub: Stripe.Subscription) => {
  const metadataUserId = String(sub.metadata?.user_id || "").trim();
  if (metadataUserId) return metadataUserId;

  const customerId = String(sub.customer || "").trim();
  if (!customerId) return "";

  const { data: profileByCustomer } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return String(profileByCustomer?.id || "").trim();
};

const resolveBasePriceItem = (sub: Stripe.Subscription) => {
  const items = sub.items?.data || [];
  for (const item of items) {
    const pid = String(item.price?.id || "").trim();
    if (resolveTierFromPrice(pid)) return item;
  }
  return items[0] || null;
};

const resolveSeatCount = (sub: Stripe.Subscription): number => {
  // 1. Check metadata first (set by our Edge Functions)
  const metaSeats = Number(sub.metadata?.seat_count || 0);
  if (Number.isFinite(metaSeats) && metaSeats > 0) return metaSeats;

  // 2. Derive from line items: find extra seat item and compute
  const extraSeatPriceId = Deno.env.get("STRIPE_PRO_EXTRA_SEAT_PRICE_ID") || "";
  if (!extraSeatPriceId) return 0;

  const items = sub.items?.data || [];
  const seatItem = items.find((item) => String(item.price?.id || "") === extraSeatPriceId);
  if (seatItem) {
    const extraSeats = Number(seatItem.quantity || 0);
    return 3 + extraSeats; // Pro base = 3 included
  }

  // 3. If Pro plan without extra seats → 3
  const baseItem = resolveBasePriceItem(sub);
  const basePriceId = String(baseItem?.price?.id || "").trim();
  const tier = resolveTierFromPrice(basePriceId);
  if (tier === "pro") return 3;
  if (tier === "standard") return 1;

  return 0;
};

const upsertProfileSubscription = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  sub: Stripe.Subscription,
) => {
  const baseItem = resolveBasePriceItem(sub);
  const stripePriceId = String(baseItem?.price?.id || "").trim();
  const tier = resolveTierFromPrice(stripePriceId);
  const billingCycle = resolveCycleFromPrice(stripePriceId);
  const seatCount = resolveSeatCount(sub);

  const payload: Record<string, unknown> = {
    stripe_customer_id: String(sub.customer || "").trim() || null,
    stripe_subscription_id: String(sub.id || "").trim() || null,
    stripe_price_id: stripePriceId || null,
    billing_status: billingStatusFromStripe(String(sub.status || "")),
    billing_cycle: billingCycle || null,
    stripe_cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    subscription_current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    seat_count: seatCount,
  };

  if (tier) {
    payload.subscription_tier = tier;
  }

  await supabaseAdmin
    .from("profiles")
    .update(payload)
    .eq("id", userId);
};

/** Paid tiers only (preview is not sold via Stripe). */
const subscriptionTierRank = (t: string): number => {
  const x = String(t || "").trim().toLowerCase();
  if (x === "free") return 0;
  if (x === "standard") return 1;
  if (x === "pro") return 2;
  if (x === "preview") return 3;
  return 0;
};

const maxCashBoxesForTier = (tier: string): number => {
  const t = String(tier || "").trim().toLowerCase();
  if (t === "free") return 1;
  if (t === "standard") return 2;
  return Number.POSITIVE_INFINITY;
};

const collectCashBoxIdsForBillingUser = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
): Promise<string[]> => {
  const ids = new Set<string>();
  const { data: ownedOrgs } = await supabaseAdmin.from("orgs").select("id").eq("owner_user_id", userId);
  const orgIds = (ownedOrgs || []).map((r) => String(r.id || "").trim()).filter(Boolean);
  if (orgIds.length) {
    const { data: orgBoxes } = await supabaseAdmin.from("cash_boxes").select("id").in("org_id", orgIds);
    (orgBoxes || []).forEach((r) => {
      const id = String(r?.id || "").trim();
      if (id) ids.add(id);
    });
  }
  const { data: soloBoxes } = await supabaseAdmin
    .from("cash_boxes")
    .select("id")
    .eq("user_id", userId)
    .is("org_id", null);
  (soloBoxes || []).forEach((r) => {
    const id = String(r?.id || "").trim();
    if (id) ids.add(id);
  });
  return Array.from(ids);
};

const clearCashBoxTierLocks = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string) => {
  const ids = await collectCashBoxIdsForBillingUser(supabaseAdmin, userId);
  if (ids.length) {
    await supabaseAdmin.from("cash_boxes").update({ transactions_blocked: false }).in("id", ids);
  }
  await supabaseAdmin.from("profiles").update({ tier_cash_boxes_pending: false }).eq("id", userId);
};

const applyCashBoxTierDowngrade = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  newTier: string,
) => {
  const max = maxCashBoxesForTier(newTier);
  if (!Number.isFinite(max)) {
    await clearCashBoxTierLocks(supabaseAdmin, userId);
    return;
  }
  const ids = await collectCashBoxIdsForBillingUser(supabaseAdmin, userId);
  if (ids.length <= max) {
    await supabaseAdmin.from("profiles").update({ tier_cash_boxes_pending: false }).eq("id", userId);
    if (ids.length) {
      await supabaseAdmin.from("cash_boxes").update({ transactions_blocked: false }).in("id", ids);
    }
    return;
  }
  await supabaseAdmin.from("profiles").update({ tier_cash_boxes_pending: true }).eq("id", userId);
  if (ids.length) {
    await supabaseAdmin.from("cash_boxes").update({ transactions_blocked: true }).in("id", ids);
  }
};

const sendDowngradeEmail = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  oldTier: string,
  newTier: string,
) => {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const from = Deno.env.get("SPENDNOTE_EMAIL_FROM") || "SpendNote <no-reply@spendnote.app>";
    if (!resendApiKey) return;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = String(authUser?.user?.email || "").trim();
    if (!email) return;

    const ids = await collectCashBoxIdsForBillingUser(supabaseAdmin, userId);
    const max = maxCashBoxesForTier(newTier);

    let teamMemberCount = 0;
    if (oldTier.toLowerCase() === "pro") {
      try {
        const { data: ownedOrgs } = await supabaseAdmin.from("orgs").select("id").eq("owner_user_id", userId);
        const orgIds = (ownedOrgs || []).map((r: { id: string }) => String(r.id || "")).filter(Boolean);
        if (orgIds.length) {
          const { count } = await supabaseAdmin
            .from("org_memberships")
            .select("id", { count: "exact", head: true })
            .in("org_id", orgIds)
            .neq("user_id", userId);
          teamMemberCount = Number(count) || 0;
        }
      } catch (_) {}
    }

    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    const tpl = renderSubscriptionDowngradedTemplate({
      fullName: profile?.full_name || "",
      oldPlan: capitalize(oldTier),
      newPlan: capitalize(newTier),
      maxCashBoxes: Number.isFinite(max) ? max : 999,
      totalCashBoxes: ids.length,
      teamMemberCount,
      dashboardUrl: "https://spendnote.app/dashboard.html",
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject: tpl.subject, html: tpl.html, text: tpl.text }),
    });
  } catch (_) {
    // non-critical; don't fail the webhook
  }
};

const revokeTeamOnDowngrade = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
) => {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const from = Deno.env.get("SPENDNOTE_EMAIL_FROM") || "SpendNote <no-reply@spendnote.app>";

    const { data: ownedOrgs } = await supabaseAdmin
      .from("orgs")
      .select("id, name")
      .eq("owner_user_id", userId);
    if (!ownedOrgs?.length) return;

    for (const org of ownedOrgs) {
      const orgId = String(org.id || "").trim();
      const orgName = String(org.name || "your team").trim() || "your team";
      if (!orgId) continue;

      const { data: members } = await supabaseAdmin
        .from("org_memberships")
        .select("user_id, role")
        .eq("org_id", orgId)
        .neq("user_id", userId);
      if (!members?.length) continue;

      const { data: orgBoxes } = await supabaseAdmin
        .from("cash_boxes")
        .select("id")
        .eq("org_id", orgId);
      const orgBoxIds = (orgBoxes || []).map((r) => String(r?.id || "")).filter(Boolean);

      for (const mem of members) {
        const memUserId = String(mem.user_id || "").trim();
        if (!memUserId) continue;

        if (orgBoxIds.length) {
          await supabaseAdmin
            .from("cash_box_memberships")
            .delete()
            .eq("user_id", memUserId)
            .in("cash_box_id", orgBoxIds);
        }

        await supabaseAdmin
          .from("org_memberships")
          .delete()
          .eq("org_id", orgId)
          .eq("user_id", memUserId);

        if (!resendApiKey) continue;
        try {
          const { data: memProfile } = await supabaseAdmin
            .from("profiles")
            .select("full_name")
            .eq("id", memUserId)
            .maybeSingle();
          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(memUserId);
          const memEmail = String(authData?.user?.email || "").trim();
          if (!memEmail) continue;

          const tpl = renderTeamMemberRemovedTemplate({
            fullName: memProfile?.full_name || undefined,
            orgName,
            dashboardUrl: "https://spendnote.app/dashboard.html",
          });
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from, to: [memEmail], subject: tpl.subject, html: tpl.html, text: tpl.text }),
          });
        } catch (_) {}
      }
    }
  } catch (_) {
    // non-critical
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!stripeSecretKey || !stripeWebhookSecret) {
      return new Response(JSON.stringify({ error: "Missing Stripe webhook secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeSignature = req.headers.get("stripe-signature") || "";
    if (!stripeSignature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, stripeSignature, stripeWebhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid webhook signature";
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = String(session.metadata?.user_id || "").trim();
        const customerId = String(session.customer || "").trim();
        const subscriptionId = String(session.subscription || "").trim();

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId || null,
              billing_status: "active",
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await findUserIdFromSubscription(supabaseAdmin, sub);
        if (!userId) break;
        const { data: prevRow } = await supabaseAdmin
          .from("profiles")
          .select("subscription_tier")
          .eq("id", userId)
          .maybeSingle();
        const oldTier = String(prevRow?.subscription_tier || "free").toLowerCase();
        await upsertProfileSubscription(supabaseAdmin, userId, sub);
        const { data: nextRow } = await supabaseAdmin
          .from("profiles")
          .select("subscription_tier")
          .eq("id", userId)
          .maybeSingle();
        const newTier = String(nextRow?.subscription_tier || oldTier).toLowerCase();
        if (subscriptionTierRank(newTier) < subscriptionTierRank(oldTier)) {
          await applyCashBoxTierDowngrade(supabaseAdmin, userId, newTier);
          if (oldTier === "pro" && newTier !== "pro") {
            await revokeTeamOnDowngrade(supabaseAdmin, userId);
          }
          await sendDowngradeEmail(supabaseAdmin, userId, oldTier, newTier);
        } else if (subscriptionTierRank(newTier) > subscriptionTierRank(oldTier)) {
          await clearCashBoxTierLocks(supabaseAdmin, userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await findUserIdFromSubscription(supabaseAdmin, sub);
        if (userId) {
          const { data: delPrevRow } = await supabaseAdmin
            .from("profiles")
            .select("subscription_tier")
            .eq("id", userId)
            .maybeSingle();
          const deletedOldTier = String(delPrevRow?.subscription_tier || "standard").toLowerCase();
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_tier: "free",
              billing_status: "canceled",
              stripe_subscription_id: null,
              stripe_price_id: null,
              stripe_cancel_at_period_end: false,
              billing_cycle: null,
              seat_count: 0,
            })
            .eq("id", userId);
          await applyCashBoxTierDowngrade(supabaseAdmin, userId, "free");
          if (deletedOldTier === "pro") {
            await revokeTeamOnDowngrade(supabaseAdmin, userId);
          }
          await sendDowngradeEmail(supabaseAdmin, userId, deletedOldTier, "free");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = String(invoice.customer || "").trim();
        if (customerId) {
          await supabaseAdmin
            .from("profiles")
            .update({ billing_status: "past_due" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = String(invoice.customer || "").trim();
        if (customerId) {
          await supabaseAdmin
            .from("profiles")
            .update({ billing_status: "active" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
