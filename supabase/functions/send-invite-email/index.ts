import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { data: inviteRow, error: inviteError } = await supabaseAdmin
      .from("invites")
      .select("id, org_id, invited_email, role, status")
      .eq("token_hash", tokenHash)
      .single();

    if (inviteError || !inviteRow) {
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

    const from = Deno.env.get("SPENDNOTE_EMAIL_FROM") || "SpendNote <no-reply@spendnote.app>";
    const appUrl = Deno.env.get("SPENDNOTE_APP_URL") || "";
    const subject = Deno.env.get("SPENDNOTE_INVITE_SUBJECT") || "You have been invited to SpendNote";

    const safeRole = role === "admin" ? "Admin" : "User";
    const effectiveLink = appUrl ? inviteLink.replace(/^https?:\/\/[^/]+/i, appUrl) : inviteLink;

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

    const inviterLine = inviterName
      ? `${inviterName}${inviterEmail ? ` (${inviterEmail})` : ""}`
      : (inviterEmail || "A team member");

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111;background:#ffffff;padding:24px;">
        <div style="max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#059669,#10b981);padding:18px 20px;color:#fff;">
            <div style="font-size:16px;font-weight:800;letter-spacing:0.2px;">SpendNote</div>
            <div style="font-size:20px;font-weight:900;margin-top:4px;">You’ve been invited</div>
          </div>
          <div style="padding:18px 20px;">
            <p style="margin:0 0 10px;">${inviterLine} invited you to join their SpendNote team.</p>
            <p style="margin:0 0 14px;">Role: <strong>${safeRole}</strong></p>
            <div style="margin:18px 0 16px;">
              <a href="${effectiveLink}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:800;">Accept invitation</a>
            </div>
            <p style="margin:0 0 10px;color:#374151;">If the button doesn’t work, copy and paste this link into your browser:</p>
            <p style="margin:0 0 16px;"><a href="${effectiveLink}" style="color:#1d4ed8;word-break:break-all;">${effectiveLink}</a></p>
            <p style="margin:0;color:#6b7280;">If you didn’t expect this invite, you can ignore this email.</p>
          </div>
        </div>
      </div>
    `;

    const text = `SpendNote invitation\n\n${inviterLine} invited you to join SpendNote as ${safeRole}.\n\nAccept invitation:\n${effectiveLink}\n\nIf you didn’t expect this invite, you can ignore this email.`;

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [invitedEmail],
        subject,
        html,
        text,
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
