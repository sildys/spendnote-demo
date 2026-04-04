import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["sildsys@gmail.com"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    // Auth check — get caller identity
    const authHeader = req.headers.get("authorization") || "";
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ADMIN_EMAILS.includes(String(user.email || "").toLowerCase())) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for full read access
    const db = createClient(supabaseUrl, serviceRoleKey);

    // --- PROFILES ---
    const { data: profiles } = await db.from("profiles").select("id, email, full_name, subscription_tier, billing_status, billing_cycle, created_at, seat_count, stripe_customer_id");
    const allProfiles = profiles || [];
    const totalUsers = allProfiles.length;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const usersToday = allProfiles.filter(p => p.created_at >= todayStart).length;
    const usersThisWeek = allProfiles.filter(p => p.created_at >= weekAgo).length;
    const usersThisMonth = allProfiles.filter(p => p.created_at >= monthAgo).length;

    // Tier breakdown
    const tierCounts: Record<string, number> = {};
    for (const p of allProfiles) {
      const t = p.subscription_tier || "unknown";
      tierCounts[t] = (tierCounts[t] || 0) + 1;
    }

    // Billing status breakdown
    const billingCounts: Record<string, number> = {};
    for (const p of allProfiles) {
      const b = p.billing_status || "unknown";
      billingCounts[b] = (billingCounts[b] || 0) + 1;
    }

    // Paying users (active billing status only)
    const payingUsers = allProfiles.filter(p => p.billing_status === 'active').length;

    // Registration trend (last 30 days, per day)
    const registrationTrend: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      registrationTrend[key] = 0;
    }
    for (const p of allProfiles) {
      const key = (p.created_at || "").slice(0, 10);
      if (key in registrationTrend) registrationTrend[key]++;
    }

    // --- TRANSACTIONS ---
    const { count: totalTransactions } = await db.from("transactions").select("id", { count: "exact", head: true });
    const { count: txToday } = await db.from("transactions").select("id", { count: "exact", head: true }).gte("created_at", todayStart);
    const { count: txThisWeek } = await db.from("transactions").select("id", { count: "exact", head: true }).gte("created_at", weekAgo);
    const { count: txThisMonth } = await db.from("transactions").select("id", { count: "exact", head: true }).gte("created_at", monthAgo);

    // Tx trend (last 30 days)
    const { data: recentTx } = await db.from("transactions").select("created_at").gte("created_at", monthAgo);
    const txTrend: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      txTrend[d.toISOString().slice(0, 10)] = 0;
    }
    for (const t of (recentTx || [])) {
      const key = (t.created_at || "").slice(0, 10);
      if (key in txTrend) txTrend[key]++;
    }

    // --- CASH BOXES ---
    const { count: totalCashBoxes } = await db.from("cash_boxes").select("id", { count: "exact", head: true });

    // Currency breakdown
    const { data: cashBoxes } = await db.from("cash_boxes").select("currency");
    const currencyCounts: Record<string, number> = {};
    for (const cb of (cashBoxes || [])) {
      const c = cb.currency || "unknown";
      currencyCounts[c] = (currencyCounts[c] || 0) + 1;
    }

    // --- ORGS ---
    const { count: totalOrgs } = await db.from("orgs").select("id", { count: "exact", head: true });

    // --- INVITES ---
    const { count: pendingInvites } = await db.from("invites").select("id", { count: "exact", head: true }).eq("status", "pending");
    const { count: acceptedInvites } = await db.from("invites").select("id", { count: "exact", head: true }).eq("status", "accepted");

    // --- CONTACTS ---
    const { count: totalContacts } = await db.from("contacts").select("id", { count: "exact", head: true });

    // --- PER-USER DETAILS ---
    const { data: allCashBoxes } = await db.from("cash_boxes").select("id, user_id, currency");
    const { data: allTx } = await db.from("transactions").select("id, user_id");

    const cbByUser: Record<string, { count: number; currencies: string[] }> = {};
    for (const cb of (allCashBoxes || [])) {
      if (!cb.user_id) continue;
      if (!cbByUser[cb.user_id]) cbByUser[cb.user_id] = { count: 0, currencies: [] };
      cbByUser[cb.user_id].count++;
      if (cb.currency && !cbByUser[cb.user_id].currencies.includes(cb.currency)) {
        cbByUser[cb.user_id].currencies.push(cb.currency);
      }
    }

    const txByUser: Record<string, number> = {};
    for (const t of (allTx || [])) {
      if (!t.user_id) continue;
      txByUser[t.user_id] = (txByUser[t.user_id] || 0) + 1;
    }

    // --- UNCONFIRMED AUTH USERS ---
    const { data: authUsers } = await db.auth.admin.listUsers({ perPage: 1000 });
    const unconfirmedUsers = (authUsers?.users || []).filter(
      (u: any) => !u.email_confirmed_at && u.email
    ).map((u: any) => ({
      email: u.email,
      created: u.created_at,
    }));

    // --- ALL SIGNUPS (enriched) ---
    const recentSignups = allProfiles
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .map(p => ({
        email: p.email,
        name: p.full_name,
        tier: p.subscription_tier,
        billing: p.billing_status,
        created: p.created_at,
        cashBoxes: cbByUser[p.id]?.count || 0,
        currencies: cbByUser[p.id]?.currencies || [],
        transactions: txByUser[p.id] || 0,
      }));

    const result = {
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: usersThisWeek,
        thisMonth: usersThisMonth,
        paying: payingUsers,
        tiers: tierCounts,
        billingStatuses: billingCounts,
        registrationTrend,
        recentSignups,
      },
      transactions: {
        total: totalTransactions || 0,
        today: txToday || 0,
        thisWeek: txThisWeek || 0,
        thisMonth: txThisMonth || 0,
        trend: txTrend,
      },
      cashBoxes: {
        total: totalCashBoxes || 0,
        currencies: currencyCounts,
      },
      teams: {
        totalOrgs: totalOrgs || 0,
        pendingInvites: pendingInvites || 0,
        acceptedInvites: acceptedInvites || 0,
      },
      contacts: {
        total: totalContacts || 0,
      },
      unconfirmed: unconfirmedUsers,
      generatedAt: now.toISOString(),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
