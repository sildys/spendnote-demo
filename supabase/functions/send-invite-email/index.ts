import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderInviteEmailTemplate } from "../_shared/email-templates.ts";

type InviteEmailBody = {
  invitedEmail: string;
  inviteLink: string;
  role?: string;
  inviteToken?: string;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const INVITE_RATE_LIMIT_WINDOW_SECONDS = 600;
const INVITE_RATE_LIMIT_PER_TARGET = 3;
const INVITE_RATE_LIMIT_PER_CALLER = 12;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const body = (await req.json()) as InviteEmailBody;
    const invitedEmail = String(body?.invitedEmail || "").trim().toLowerCase();
    const inviteLink = String(body?.inviteLink || "").trim();
    const inviteToken = String(body?.inviteToken || "").trim();
    const role = String(body?.role || "user").trim().toLowerCase();

    if (!invitedEmail || !inviteLink || !inviteToken) {
      return new Response(JSON.stringify({ error: "Missing invitedEmail / inviteLink / inviteToken" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Hash the plaintext token to match token_hash stored in DB
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(inviteToken));
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    let inviteRow: {
      id: string;
      org_id: string;
      invited_email: string;
      role: string;
      status: string;
    } | null = null;

    const byHash = await supabaseAdmin
      .from("invites")
      .select("id, org_id, invited_email, role, status")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (!byHash.error && byHash.data) {
      inviteRow = byHash.data as typeof inviteRow;
    } else {
      // Legacy rows: token set but token_hash NULL (RPC did not populate hash)
      const byToken = await supabaseAdmin
        .from("invites")
        .select("id, org_id, invited_email, role, status")
        .eq("token", inviteToken)
        .maybeSingle();
      if (!byToken.error && byToken.data) {
        inviteRow = byToken.data as typeof inviteRow;
      }
    }

    if (!inviteRow) {
      return new Response(JSON.stringify({ error: "Invite not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (String(inviteRow.status || "").toLowerCase() !== "pending") {
      return new Response(JSON.stringify({ error: "Invite is not pending" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (String(inviteRow.invited_email || "").toLowerCase() !== invitedEmail) {
      return new Response(JSON.stringify({ error: "Invite email mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orgId = String(inviteRow.org_id || "").trim();
    if (!orgId) {
      return new Response(JSON.stringify({ error: "Invite missing org_id" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("org_memberships")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    const callerRole = String(membership?.role || "").toLowerCase();
    const isAdmin = callerRole === "owner" || callerRole === "admin";

    if (membershipError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const consumeRateLimit = async (key: string, limit: number) => {
      const res = await supabaseAdmin.rpc("spendnote_consume_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: INVITE_RATE_LIMIT_WINDOW_SECONDS,
      });

      if (res.error) {
        const msg = String(res.error.message || "").toLowerCase();
        const missing = msg.includes("does not exist") || String(res.error.code || "") === "42883";
        if (!missing) {
          console.error("send-invite-email rate-limit RPC error:", res.error);
        }
        // Compatibility: if migration is not deployed yet, do not block invite sending.
        return { allowed: true, retry_after_seconds: 0, remaining: null };
      }

      const payload = Array.isArray(res.data) ? res.data[0] : res.data;
      return {
        allowed: Boolean(payload?.allowed),
        retry_after_seconds: Math.max(Number(payload?.retry_after_seconds) || 0, 0),
        remaining: Number.isFinite(Number(payload?.remaining)) ? Number(payload?.remaining) : null,
      };
    };

    const callerKey = `invite-email:caller:${orgId}:${user.id}`;
    const callerBucket = await consumeRateLimit(callerKey, INVITE_RATE_LIMIT_PER_CALLER);
    if (!callerBucket.allowed) {
      const retryAfter = Math.max(callerBucket.retry_after_seconds || 0, 1);
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        detail: "Too many invite email requests. Please retry later.",
        retry_after_seconds: retryAfter,
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      });
    }

    const targetKey = `invite-email:target:${orgId}:${user.id}:${invitedEmail}`;
    const targetBucket = await consumeRateLimit(targetKey, INVITE_RATE_LIMIT_PER_TARGET);
    if (!targetBucket.allowed) {
      const retryAfter = Math.max(targetBucket.retry_after_seconds || 0, 1);
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        detail: "Too many invite retries for this email. Please retry later.",
        retry_after_seconds: retryAfter,
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      });
    }

    const from = "SpendNote <no-reply@spendnote.app>";
    const appUrl = Deno.env.get("SPENDNOTE_APP_URL") || "";
    const subject = Deno.env.get("SPENDNOTE_INVITE_SUBJECT") || "You have been invited to SpendNote";

    const safeRole = role === "admin" ? "Admin" : "User";

    let inviterName = "";
    let inviterEmail = "";
    try {
      const { data: inviterProfile } = await supabaseAdmin
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .single();
      inviterName = String(inviterProfile?.full_name || "").trim();
      inviterEmail = String(inviterProfile?.email || "").trim();
    } catch (_) {
      // ignore
    }

    const PLACEHOLDER_NAMES = [
      "spendnote user", "user", "test", "admin", "owner",
      "test user", "demo", "demo user",
    ];
    const isPlaceholderName = PLACEHOLDER_NAMES.includes(
      inviterName.toLowerCase(),
    ) || inviterName.toLowerCase() === inviterEmail.split("@")[0]?.toLowerCase();

    const displayName = (inviterName && !isPlaceholderName) ? inviterName : "";

    const normalizedAppUrl = String(appUrl || "").trim().replace(/\/+$/, "");
    let baseOrigin = normalizedAppUrl;
    if (!baseOrigin) {
      try {
        baseOrigin = new URL(inviteLink).origin;
      } catch (_) {
        baseOrigin = "";
      }
    }
    const inviteShortUrl = baseOrigin
      ? `${baseOrigin.replace(/\/+$/, "")}/i/${encodeURIComponent(inviteToken)}`
      : `https://spendnote.app/i/${encodeURIComponent(inviteToken)}`;

    const rendered = renderInviteEmailTemplate({
      inviterDisplayName: displayName,
      role: safeRole === "Admin" ? "Admin" : "User",
      inviteShortUrl,
    });

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [invitedEmail],
        reply_to: inviterEmail || undefined,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        headers: {
          "X-Entity-Ref-ID": inviteRow.id || "",
        },
      }),
    });

    if (!resendResp.ok) {
      const detail = await resendResp.text();
      return new Response(JSON.stringify({ error: "Failed to send", detail }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendData = await resendResp.json();

    return new Response(JSON.stringify({ success: true, data: resendData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
