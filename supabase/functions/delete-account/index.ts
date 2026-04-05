import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type DeleteAccountBody = {
  mode?: "preview" | "delete";
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
    const from = "SpendNote <no-reply@spendnote.app>";

    let body: DeleteAccountBody = {};
    try {
      body = (await req.json()) as DeleteAccountBody;
    } catch (_) {
      body = {};
    }
    const mode = String(body?.mode || "delete").trim().toLowerCase() === "preview" ? "preview" : "delete";

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

    // Verify the caller's JWT
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

    const userId = user.id;

    // Service-role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name,email")
      .eq("id", userId)
      .maybeSingle();

    const userEmail = String(profile?.email || user.email || "").trim().toLowerCase();
    const userName = String(profile?.full_name || user.user_metadata?.full_name || "there").trim() || "there";

    const countByEq = async (table: string, column: string, value: string): Promise<number> => {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq(column, value);
      if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
      return Number(count || 0);
    };

    const countByIn = async (table: string, column: string, values: string[]): Promise<number> => {
      if (!values || values.length === 0) return 0;
      const { count, error } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true })
        .in(column, values);
      if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
      return Number(count || 0);
    };

    // Check if user owns any org (canonical source: orgs.owner_user_id).
    // Fallback: legacy owner membership role if needed.
    const { data: ownedOrgsByOwnerId, error: ownerIdError } = await supabaseAdmin
      .from("orgs")
      .select("id")
      .eq("owner_user_id", userId);

    if (ownerIdError) {
      return new Response(JSON.stringify({ error: "Failed to check owned organizations: " + ownerIdError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let ownedOrgIds = (ownedOrgsByOwnerId || [])
      .map((o: { id: string }) => String(o.id || "").trim())
      .filter(Boolean);

    if (ownedOrgIds.length === 0) {
      const { data: ownedByMembership, error: membershipOwnerError } = await supabaseAdmin
        .from("org_memberships")
        .select("org_id")
        .eq("user_id", userId)
        .ilike("role", "owner");

      if (membershipOwnerError) {
        return new Response(JSON.stringify({ error: "Failed to check org memberships: " + membershipOwnerError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      ownedOrgIds = (ownedByMembership || [])
        .map((m: { org_id: string }) => String(m.org_id || "").trim())
        .filter(Boolean);
    }

    // Non-owner: block deletion if user still has cash box access
    const isOwner = ownedOrgIds.length > 0;
    if (!isOwner) {
      const { count: cbAccessCount } = await supabaseAdmin
        .from("cash_box_memberships")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (Number(cbAccessCount || 0) > 0) {
        return new Response(JSON.stringify({
          error: "You still have Cash Box access. Ask your team owner or admin to remove your access first, then try again.",
          code: "HAS_CASH_BOX_ACCESS",
          cashBoxAccessCount: Number(cbAccessCount || 0),
        }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (mode === "preview") {
      try {
        const memberOrgRows = isOwner
          ? []
          : (await supabaseAdmin
              .from("org_memberships")
              .select("org_id")
              .eq("user_id", userId)).data || [];
        const memberOrgIds = (memberOrgRows || [])
          .map((m: { org_id: string }) => String(m.org_id || "").trim())
          .filter(Boolean);

        const summary = isOwner
          ? {
              isOwner,
              ownedOrgCount: ownedOrgIds.length,
              teamMembershipCount: await countByIn("org_memberships", "org_id", ownedOrgIds),
              pendingInviteCount: await countByIn("invites", "org_id", ownedOrgIds),
              cashBoxCount: await countByIn("cash_boxes", "org_id", ownedOrgIds),
              contactCount: await countByIn("contacts", "org_id", ownedOrgIds),
              transactionCount: await countByIn("transactions", "org_id", ownedOrgIds),
            }
          : {
              isOwner,
              ownedOrgCount: 0,
              teamMembershipCount: await countByEq("org_memberships", "user_id", userId),
              pendingInviteCount: 0,
              personalCashBoxCount: await countByEq("cash_boxes", "user_id", userId),
              personalContactCount: await countByEq("contacts", "user_id", userId),
              personalTransactionCount: await countByEq("transactions", "user_id", userId),
              sharedOrgCount: memberOrgIds.length,
            };

        return new Response(JSON.stringify({ success: true, mode: "preview", summary }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (previewErr) {
        const msg = previewErr instanceof Error ? previewErr.message : "Failed to build delete preview";
        return new Response(JSON.stringify({ error: msg }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "User email is missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If user is owner of any org(s), delete those orgs first
    // This cascades to org_memberships, removing all team members' access
    if (ownedOrgIds.length > 0) {
      const orgIds = ownedOrgIds;

      const { error: deleteOrgsError } = await supabaseAdmin
        .from("orgs")
        .delete()
        .in("id", orgIds);

      if (deleteOrgsError) {
        const rawMessage = String(deleteOrgsError.message || "");
        if (rawMessage.toLowerCase().includes("audit_log is immutable")) {
          return new Response(JSON.stringify({
            error: "Database schema mismatch: legacy immutable trigger on audit_log blocks organization deletion. Apply migration 035_audit_log_immutable_trigger_compat.sql and retry account deletion.",
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (rawMessage.toLowerCase().includes("audit_log_org_id_fkey") || rawMessage.toLowerCase().includes("violates foreign key constraint")) {
          return new Response(JSON.stringify({
            error: "Database schema mismatch: legacy org_membership audit trigger writes rows after org deletion cascade. Apply migration 036_audit_log_membership_trigger_org_fk_compat.sql and retry account deletion.",
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "Failed to delete organization(s): " + deleteOrgsError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Best-effort cleanup for legacy/direct references that can block auth deletion.
    // 1) Null-out audit actor refs (safe even if FK already SET NULL).
    try {
      await supabaseAdmin
        .from("audit_log")
        .update({ actor_id: null })
        .eq("actor_id", userId);
    } catch (_) {
      // ignore
    }

    // 2) Delete storage objects owned by this user (if storage schema/column is present).
    // Some projects can have restrictive FKs around storage ownership.
    try {
      const q1 = await supabaseAdmin
        .schema("storage")
        .from("objects")
        .delete()
        .eq("owner", userId);

      if (q1.error && String(q1.error.message || "").toLowerCase().includes("owner_id")) {
        await supabaseAdmin
          .schema("storage")
          .from("objects")
          .delete()
          .eq("owner_id", userId);
      }
    } catch (_) {
      // ignore
    }

    // 3) Explicitly delete profile first so profile-rooted cascades are executed
    // before deleting auth.users (helps avoid legacy FK blockers).
    const isMissingAuditLogColumnError = (message: string): boolean => {
      const m = String(message || "");
      return /column\s+"[^"]+"\s+of\s+relation\s+"audit_log"\s+does\s+not\s+exist/i.test(m);
    };

    const buildAuditLogSchemaMismatchResponse = () => {
      return new Response(JSON.stringify({
        error: "Database schema mismatch: audit_log is missing expected columns. Apply latest migrations (including 033_audit_log_actor_id_compat.sql and 034_audit_log_meta_compat.sql) and retry account deletion.",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    };

    try {
      const { error: profileDeleteError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileDeleteError) {
        const rawMessage = String(profileDeleteError.message || "");
        if (isMissingAuditLogColumnError(rawMessage)) {
          return buildAuditLogSchemaMismatchResponse();
        }
        return new Response(JSON.stringify({ error: "Failed to delete profile: " + profileDeleteError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (profileErr) {
      const msg = profileErr instanceof Error ? profileErr.message : "Unknown profile deletion error";
      if (isMissingAuditLogColumnError(String(msg))) {
        return buildAuditLogSchemaMismatchResponse();
      }
      return new Response(JSON.stringify({ error: "Failed to delete profile: " + msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete the auth user.
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      return new Response(JSON.stringify({
        error: "Failed to delete user: " + deleteUserError.message,
        code: (deleteUserError as { code?: string }).code || null,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let emailSent = false;
    let emailError: string | null = null;
    try {
      const subject = "Your SpendNote account has been deleted";
      const html = `
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111;background:#f8fafc;padding:24px;">
          <div style="max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;background:#ffffff;">
            <div style="background:#ffffff;padding:8px 20px 6px;">
              <img src="https://spendnote.app/assets/images/spendnote-logo-horizontal-1024.png?v=20260301-1839" alt="SpendNote" width="156" style="display:block;height:auto;border:0;outline:none;text-decoration:none;"/>
            </div>
            <div style="background:linear-gradient(135deg,#059669,#10b981);padding:14px 20px;color:#fff;">
              <div style="font-size:20px;font-weight:900;">Account deleted</div>
              <div style="font-size:13px;opacity:0.95;margin-top:4px;">Your SpendNote account has been permanently removed</div>
            </div>
            <div style="padding:18px 20px;">
              <p style="margin:0 0 10px;">Hi ${userName}, this is a confirmation that your SpendNote account was deleted successfully.</p>
              <p style="margin:0 0 14px;">This email is for confirmation only. This mailbox is not monitored.</p>
              <p style="margin:0;color:#6b7280;">If you need help, contact support at <a href="mailto:support@spendnote.app" style="color:#1d4ed8;">support@spendnote.app</a>.</p>
            </div>
            <div style="padding:14px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
              Cash handoff documentation only. Not a tax or accounting tool.<br>
              © SpendNote • spendnote.app
            </div>
          </div>
        </div>
      `;
      const text = `Your SpendNote account has been deleted\n\nHi ${userName}, this is a confirmation that your SpendNote account was deleted successfully.\nThis email is for confirmation only and is not monitored.\nIf you need help, contact support@spendnote.app.`;

      const resendResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [userEmail],
          subject,
          html,
          text,
        }),
      });

      if (!resendResp.ok) {
        const detail = await resendResp.text();
        throw new Error(detail || "Resend returned non-OK response");
      }
      emailSent = true;
    } catch (err) {
      emailSent = false;
      emailError = err instanceof Error ? err.message : "Failed to send post-delete email";
    }

    return new Response(JSON.stringify({ success: true, emailSent, emailError }), {
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
