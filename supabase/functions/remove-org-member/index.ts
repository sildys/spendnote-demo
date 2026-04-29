import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderTeamMemberRemovedTemplate } from "../_shared/email-templates.ts";

type Body = {
  orgId?: string;
  targetUserId?: string;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: actor },
      error: actorErr,
    } = await supabaseUser.auth.getUser();

    if (actorErr || !actor) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const orgId = String(body?.orgId || "").trim();
    const targetUserId = String(body?.targetUserId || "").trim();

    if (!orgId || !targetUserId) {
      return new Response(JSON.stringify({ error: "Missing orgId or targetUserId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: actorMem, error: actorMemErr } = await supabaseAdmin
      .from("org_memberships")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", actor.id)
      .maybeSingle();

    if (actorMemErr || !actorMem) {
      return new Response(JSON.stringify({ error: "Not a member of this team" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const actorRole = String(actorMem.role || "").toLowerCase();
    if (actorRole !== "owner" && actorRole !== "admin") {
      return new Response(JSON.stringify({ error: "Only owners and admins can remove members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: orgRow, error: orgErr } = await supabaseAdmin
      .from("orgs")
      .select("owner_user_id, name")
      .eq("id", orgId)
      .maybeSingle();

    if (orgErr || !orgRow) {
      return new Response(JSON.stringify({ error: "Team not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ownerUserId = String(orgRow.owner_user_id || "").trim();
    if (targetUserId === ownerUserId) {
      return new Response(JSON.stringify({ error: "Cannot remove the team owner" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: targetMem, error: targetMemErr } = await supabaseAdmin
      .from("org_memberships")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (targetMemErr || !targetMem) {
      return new Response(JSON.stringify({ error: "Member not found on this team" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetRole = String(targetMem.role || "").toLowerCase();
    if (targetRole === "owner") {
      return new Response(JSON.stringify({ error: "Cannot remove an owner membership" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: orgCashBoxes, error: cbListErr } = await supabaseAdmin
      .from("cash_boxes")
      .select("id")
      .eq("org_id", orgId);

    if (cbListErr) {
      return new Response(JSON.stringify({ error: "Failed to resolve team Cash Boxes" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orgBoxIds = (orgCashBoxes || []).map((r) => String((r as { id?: string }).id || "")).filter(Boolean);

    if (orgBoxIds.length) {
      const { error: cbmErr } = await supabaseAdmin
        .from("cash_box_memberships")
        .delete()
        .eq("user_id", targetUserId)
        .in("cash_box_id", orgBoxIds);

      if (cbmErr) {
        return new Response(JSON.stringify({ error: "Failed to revoke Cash Box access: " + cbmErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { error: delMemErr, data: delRows } = await supabaseAdmin
      .from("org_memberships")
      .delete()
      .eq("org_id", orgId)
      .eq("user_id", targetUserId)
      .select("user_id");

    if (delMemErr) {
      return new Response(JSON.stringify({ error: "Failed to remove member: " + delMemErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(delRows) || !delRows.length) {
      return new Response(JSON.stringify({ error: "Member was not removed (no row deleted)" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: soloBoxes, error: soloErr } = await supabaseAdmin
      .from("cash_boxes")
      .select("id, current_balance")
      .eq("user_id", targetUserId)
      .is("org_id", null);

    if (!soloErr && Array.isArray(soloBoxes)) {
      for (const row of soloBoxes) {
        const bid = String((row as { id?: string }).id || "");
        if (!bid) continue;
        const bal = Number((row as { current_balance?: number }).current_balance ?? 0);
        if (bal !== 0) continue;

        // Only treat non-system rows as "activity" (matches currency-immutability checks elsewhere).
        const { count, error: cntErr } = await supabaseAdmin
          .from("transactions")
          .select("id", { count: "exact", head: true })
          .eq("cash_box_id", bid)
          .neq("is_system", true);

        if (cntErr) continue;
        if ((count ?? 0) > 0) continue;

        await supabaseAdmin.from("cash_boxes").delete().eq("id", bid);
      }
    }

    let emailSent = false;
    let emailError: string | null = null;

    if (resendApiKey) {
      const { data: targetProfile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email")
        .eq("id", targetUserId)
        .maybeSingle();

      let targetEmail = String(targetProfile?.email || "").trim().toLowerCase();
      if (!targetEmail) {
        try {
          const { data: authData, error: authUserErr } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
          if (!authUserErr && authData?.user?.email) {
            targetEmail = String(authData.user.email).trim().toLowerCase();
          }
        } catch {
          // ignore
        }
      }

      if (targetEmail) {
        const orgName = String(orgRow.name || "your team").trim() || "your team";
        const fullName = String(targetProfile?.full_name || "").trim();
        const rendered = renderTeamMemberRemovedTemplate({
          fullName: fullName || undefined,
          orgName,
          dashboardUrl: "https://spendnote.app/",
        });

        try {
          const resendResp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from,
              to: [targetEmail],
              subject: rendered.subject,
              html: rendered.html,
              text: rendered.text,
            }),
          });
          if (resendResp.ok) {
            emailSent = true;
          } else {
            emailError = await resendResp.text();
          }
        } catch (e) {
          emailError = String((e as Error)?.message || e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent,
        emailError: emailError || undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
