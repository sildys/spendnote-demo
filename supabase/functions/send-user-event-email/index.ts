import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  renderInviteAcceptedAdminTemplate,
  renderPasswordChangedTemplate,
  renderWelcomeAccountCreatedTemplate,
} from "../_shared/email-templates.ts";

type EventBody = {
  eventType: "welcome_account_created" | "password_changed" | "invite_accepted_admin";
  inviteToken?: string;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const from = Deno.env.get("SPENDNOTE_EMAIL_FROM") || "SpendNote <no-reply@spendnote.app>";

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing required secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as EventBody;
    const eventType = String(body?.eventType || "").trim().toLowerCase();
    const inviteToken = String(body?.inviteToken || "").trim();

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name,email")
      .eq("id", user.id)
      .single();

    const userName = String(profile?.full_name || user.user_metadata?.full_name || "").trim();
    const userEmail = String(profile?.email || user.email || "").trim().toLowerCase();

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "User email is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sendViaResend = async (to: string[], subject: string, html: string, text: string) => {
      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html, text }),
      });

      if (!resendResp.ok) {
        const detail = await resendResp.text();
        throw new Error(`Resend failed: ${detail}`);
      }

      return await resendResp.json();
    };

    if (eventType === "welcome_account_created") {
      const rendered = renderWelcomeAccountCreatedTemplate({
        fullName: userName,
        loginUrl: "https://spendnote.app/spendnote-login.html",
      });
      const data = await sendViaResend([userEmail], rendered.subject, rendered.html, rendered.text);
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (eventType === "password_changed") {
      const rendered = renderPasswordChangedTemplate();
      const data = await sendViaResend([userEmail], rendered.subject, rendered.html, rendered.text);
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (eventType === "invite_accepted_admin") {
      if (!inviteToken) {
        return new Response(JSON.stringify({ error: "Missing inviteToken" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenHash = await hashToken(inviteToken);
      const { data: inviteRow, error: inviteErr } = await supabaseAdmin
        .from("invites")
        .select("id, org_id, invited_email, accepted_by, status, role, created_at")
        .eq("token_hash", tokenHash)
        .single();

      if (inviteErr || !inviteRow) {
        return new Response(JSON.stringify({ error: "Invite not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const acceptedBy = String(inviteRow.accepted_by || "").trim();
      const inviteStatus = String(inviteRow.status || "").toLowerCase();
      if (acceptedBy !== user.id || (inviteStatus !== "active" && inviteStatus !== "accepted")) {
        return new Response(JSON.stringify({ error: "Invite not accepted by current user" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (inviteStatus === "accepted") {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: "Already notified" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orgId = String(inviteRow.org_id || "").trim();
      const { data: orgRow } = await supabaseAdmin.from("orgs").select("name").eq("id", orgId).single();
      const orgName = String(orgRow?.name || "your team").trim() || "your team";

      const { data: adminMemberships, error: membersErr } = await supabaseAdmin
        .from("org_memberships")
        .select("user_id, role")
        .eq("org_id", orgId)
        .in("role", ["owner", "admin"]);

      if (membersErr || !Array.isArray(adminMemberships) || adminMemberships.length === 0) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: "No admin recipients" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const adminIds = adminMemberships
        .map((m) => String(m?.user_id || "").trim())
        .filter((id) => id && id !== user.id);

      if (!adminIds.length) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: "No other admin recipients" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: adminProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id,full_name,email")
        .in("id", adminIds);

      const recipients = Array.isArray(adminProfiles)
        ? adminProfiles
            .map((p) => ({
              id: String(p?.id || "").trim(),
              fullName: String(p?.full_name || "").trim(),
              email: String(p?.email || "").trim().toLowerCase(),
            }))
            .filter((p) => p.email)
        : [];

      if (!recipients.length) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: "No admin emails found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sends = [] as Array<unknown>;
      for (const recipient of recipients) {
        const rendered = renderInviteAcceptedAdminTemplate({
          adminName: recipient.fullName || "there",
          acceptedUserName: userName || "A user",
          acceptedUserEmail: userEmail,
          orgName,
          teamUrl: "https://spendnote.app/spendnote-team.html",
        });
        const sent = await sendViaResend([recipient.email], rendered.subject, rendered.html, rendered.text);
        sends.push(sent);
      }

      try {
        await supabaseAdmin
          .from("invites")
          .update({ status: "accepted" })
          .eq("id", inviteRow.id)
          .eq("accepted_by", user.id);
      } catch (_) {
        // ignore status update best-effort
      }

      return new Response(JSON.stringify({ success: true, sent: recipients.length, data: sends }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unsupported eventType" }), {
      status: 400,
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
