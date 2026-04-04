type BaseEmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const esc = (value: string): string => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

const LOGO_HTML = `<span style="display:block;line-height:0;"><img src="https://spendnote.app/assets/images/spendnote-logo-horizontal-1024.png?v=20260301-1839" alt="SpendNote" width="156" style="display:block;height:auto;border:0;outline:none;text-decoration:none;"/></span>`;

const appCard = (title: string, subtitle: string, bodyHtml: string): string => `
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;background:#ffffff;">
      <div style="background:#ffffff;padding:8px 20px 6px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="vertical-align:middle;line-height:0;">${LOGO_HTML}</td>
          </tr>
        </table>
      </div>
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:14px 20px;color:#fff;">
        <div style="font-size:20px;font-weight:900;">${title}</div>
        <div style="font-size:13px;opacity:0.95;margin-top:4px;">${subtitle}</div>
      </div>
      <div style="padding:18px 20px;">${bodyHtml}</div>
      <div style="padding:14px 20px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
        Cash handoff documentation only. Not a tax or accounting tool.<br>
        &copy; SpendNote &bull; <a href="https://spendnote.app" style="color:#6b7280;">spendnote.app</a>
      </div>
    </div>
  </div>
`;

const CTA_STYLE = "display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:800;font-size:15px;";

const PAIN_LINE = "If cash moves and you don't record it, you lose track.";

// ─── Invite email ───────────────────────────────────────────────────────────────

export const renderInviteEmailTemplate = (args: {
  /** Display name only (no email); empty → anonymous fallback */
  inviterDisplayName?: string;
  role: "Admin" | "User";
  /** Short URL, e.g. https://spendnote.app/i/{token} */
  inviteShortUrl: string;
}): BaseEmailTemplate => {
  const nameRaw = String(args.inviterDisplayName || "").trim();
  const role = args.role === "Admin" ? "an Admin" : "a team member";
  const roleShort = args.role === "Admin" ? "Admin" : "User";
  const shortUrl = esc(String(args.inviteShortUrl || "").trim());

  const subject = nameRaw
    ? `${nameRaw} invited you to SpendNote`
    : `You've been invited to SpendNote`;

  const whoLine = nameRaw
    ? `<strong>${esc(nameRaw)}</strong> invited you to join as ${role}.`
    : `Someone from your team invited you to join as ${role}.`;

  const whoText = nameRaw
    ? `${nameRaw} invited you to join as ${role}.`
    : `Someone from your team invited you to join as ${role}.`;

  const html = appCard(
    "You're invited",
    "Join your team \u2014 see who has the cash, right now.",
    `
      <p style="margin:0 0 10px;">${whoLine}</p>
      <p style="margin:0 0 14px;">SpendNote records every cash handoff &mdash; who took it, when, and how much &mdash; so nothing goes unaccounted for.</p>
      <div style="margin:18px 0 16px;">
        <a href="${shortUrl}" style="${CTA_STYLE}">Accept invitation &rarr;</a>
      </div>
      <p style="margin:0 0 10px;color:#374151;font-size:13px;">If the button doesn't work, open this link:</p>
      <p style="margin:0 0 16px;"><a href="${shortUrl}" style="color:#1d4ed8;font-size:14px;font-weight:600;">${shortUrl}</a></p>
      <p style="margin:0;color:#6b7280;font-size:12px;">If you didn't expect this, you can safely ignore this email.</p>
    `,
  );

  const text =
    `${subject}\n\nJoin your team \u2014 see who has the cash, right now.\n\n${whoText}\n\nAccept invitation (one tap):\n${args.inviteShortUrl}\n\nIf you didn't expect this invite, ignore this email.`;

  return { subject, html, text };
};

// ─── Welcome (account created) ──────────────────────────────────────────────────

export const renderWelcomeAccountCreatedTemplate = (args: {
  fullName?: string;
  loginUrl: string;
}): BaseEmailTemplate => {
  const name = esc(String(args.fullName || "there").trim() || "there");
  const loginUrl = esc(args.loginUrl || "https://spendnote.app/spendnote-login.html");
  const subject = `You're in — now track your first cash movement`;

  const html = appCard(
    "You're in.",
    "One step left: start tracking your cash.",
    `
      <p style="margin:0 0 10px;">Hi ${name},</p>
      <p style="margin:0 0 10px;">Every unrecorded cash handoff is money you can't account for later. SpendNote fixes that.</p>
      <p style="margin:0 0 10px;font-weight:700;">Right now, you have no record of your cash.</p>
      <p style="margin:0 0 14px;">Start now. It takes 30 seconds.</p>
      <div style="margin:18px 0 16px;">
        <a href="${loginUrl}" style="${CTA_STYLE}">Start tracking your cash (30 sec) &rarr;</a>
      </div>
      <p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>What happens next:</strong></p>
      <ul style="margin:0 0 14px;padding-left:18px;color:#374151;font-size:13px;">
        <li>Record your first cash movement &mdash; 30 seconds</li>
        <li>Get an instant receipt you can print or share</li>
        <li>Every handoff is logged with who, when, and how much</li>
      </ul>
      <p style="margin:0;color:#6b7280;font-size:12px;">Need help? Visit our <a href="https://spendnote.app/spendnote-faq.html" style="color:#1d4ed8;">FAQ</a> or contact <a href="mailto:support@spendnote.app" style="color:#1d4ed8;">support@spendnote.app</a>.</p>
    `,
  );

  const text = `You're in — now track your first cash movement\n\nHi ${args.fullName || "there"},\n\nEvery unrecorded cash handoff is money you can't account for later.\n\nRight now, you have no record of your cash.\n\nStart now. It takes 30 seconds.\n\nOpen SpendNote: ${args.loginUrl}\n\nNeed help? https://spendnote.app/spendnote-faq.html or support@spendnote.app`;
  return { subject, html, text };
};

// ─── Email confirmation ─────────────────────────────────────────────────────────

export const renderEmailConfirmationTemplate = (args: {
  fullName?: string;
  confirmUrl: string;
}): BaseEmailTemplate => {
  const name = esc(String(args.fullName || "there").trim() || "there");
  const confirmUrl = esc(args.confirmUrl || "");
  const subject = "Confirm your email \u2014 start tracking your cash";

  const html = appCard(
    "One quick step",
    "Confirm your email to activate your account.",
    `
      <p style="margin:0 0 10px;">Hi ${name}, confirm your email address and you can start recording cash handoffs immediately.</p>
      <div style="margin:18px 0 16px;">
        <a href="${confirmUrl}" style="${CTA_STYLE}">Confirm email &rarr;</a>
      </div>
      <p style="margin:0 0 10px;color:#374151;font-size:13px;">If the button doesn't work, use this link:</p>
      <p style="margin:0 0 16px;"><a href="${confirmUrl}" style="color:#1d4ed8;word-break:break-all;font-size:13px;">${confirmUrl}</a></p>
      <p style="margin:0 0 10px;color:#374151;font-size:13px;font-style:italic;">${PAIN_LINE}</p>
      <p style="margin:0;color:#6b7280;font-size:12px;">If you didn't create this account, you can safely ignore this email.</p>
    `,
  );

  const text = `Confirm your email \u2014 start tracking your cash\n\nHi ${args.fullName || "there"}, confirm your account:\n${args.confirmUrl}\n\n${PAIN_LINE}`;
  return { subject, html, text };
};

// ─── Invite accepted (admin notification) ────────────────────────────────────────

export const renderInviteAcceptedAdminTemplate = (args: {
  adminName?: string;
  acceptedUserName?: string;
  acceptedUserEmail: string;
  orgName?: string;
  teamUrl: string;
}): BaseEmailTemplate => {
  const adminName = esc(String(args.adminName || "there").trim() || "there");
  const acceptedUser = esc(String(args.acceptedUserName || "A user").trim() || "A user");
  const acceptedUserEmail = esc(args.acceptedUserEmail || "");
  const orgName = esc(String(args.orgName || "your team").trim() || "your team");
  const teamUrl = esc(args.teamUrl || "https://spendnote.app/spendnote-team.html");
  const subject = `${args.acceptedUserName || args.acceptedUserEmail || "A user"} joined your team`;

  const html = appCard(
    "New team member",
    `${args.acceptedUserName || args.acceptedUserEmail || "Someone"} is now on your team.`,
    `
      <p style="margin:0 0 10px;">Hi ${adminName},</p>
      <p style="margin:0 0 10px;"><strong>${acceptedUser}</strong> (${acceptedUserEmail}) accepted your invitation and joined ${orgName}.</p>
      <p style="margin:0 0 14px;font-size:13px;color:#374151;">You can now assign Cash Box access from Team settings.</p>
      <div style="margin:18px 0 16px;">
        <a href="${teamUrl}" style="${CTA_STYLE}">Manage team &rarr;</a>
      </div>
    `,
  );

  const text = `New team member\n\nHi ${args.adminName || "there"}, ${args.acceptedUserName || args.acceptedUserEmail} accepted your invitation and joined ${args.orgName || "your team"}.\nManage team: ${args.teamUrl}`;
  return { subject, html, text };
};

// ─── Password reset ─────────────────────────────────────────────────────────────

export const renderPasswordResetTemplate = (args: {
  resetUrl: string;
}): BaseEmailTemplate => {
  const resetUrl = esc(args.resetUrl || "");
  const subject = "Reset your SpendNote password";

  const html = appCard(
    "Reset your password",
    "We received a password reset request.",
    `
      <p style="margin:0 0 10px;">Someone requested a password reset for your SpendNote account.</p>
      <p style="margin:0 0 14px;">Click below to choose a new password. This link expires in 1 hour.</p>
      <div style="margin:18px 0 16px;">
        <a href="${resetUrl}" style="${CTA_STYLE}">Reset password &rarr;</a>
      </div>
      <p style="margin:0 0 10px;color:#374151;font-size:13px;">If the button doesn't work, use this link:</p>
      <p style="margin:0 0 16px;"><a href="${resetUrl}" style="color:#1d4ed8;word-break:break-all;font-size:13px;">${resetUrl}</a></p>
      <p style="margin:0;color:#6b7280;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    `,
  );

  const text = `Reset your SpendNote password\n\nWe received a request to reset your password.\nReset link (expires in 1 hour):\n${args.resetUrl}\n\nIf you didn't request this, you can ignore this email.`;
  return { subject, html, text };
};

// ─── First transaction congratulations ──────────────────────────────────────────

export const renderFirstTransactionTemplate = (args: {
  fullName?: string;
  dashboardUrl: string;
}): BaseEmailTemplate => {
  const name = esc(String(args.fullName || "there").trim() || "there");
  const dashboardUrl = esc(args.dashboardUrl || "https://spendnote.app/dashboard.html");
  const subject = "Your first cash movement is on record";

  const html = appCard(
    "Your first cash movement is on record",
    "You just made your cash trackable.",
    `
      <p style="margin:0 0 10px;">Good. You're now tracking your cash, ${name}.</p>
      <p style="margin:0 0 10px;">Your first cash movement is now documented &mdash; who, when, how much. That's one handoff you'll never have to guess about.</p>
      <p style="margin:0 0 14px;font-weight:700;">Now do it again. That's how you stay in control.</p>
      <div style="margin:18px 0 16px;">
        <a href="${dashboardUrl}" style="${CTA_STYLE}">Record the next one (30 sec) &rarr;</a>
      </div>
      <p style="margin:0;color:#6b7280;font-size:12px;">Most teams start with an opening balance &mdash; then track every payment as it happens.</p>
    `,
  );

  const text = `Your first cash movement is on record\n\nGood. You're now tracking your cash, ${args.fullName || "there"}.\n\nNow do it again. That's how you stay in control.\n\n${args.dashboardUrl}`;
  return { subject, html, text };
};

// ─── Trial expiry warning ───────────────────────────────────────────────────────

export const renderTrialExpiryWarningTemplate = (args: {
  fullName?: string;
  daysLeft: number;
  pricingUrl: string;
  txCount?: number;
}): BaseEmailTemplate => {
  const name = esc(String(args.fullName || "there").trim() || "there");
  const days = Math.max(0, args.daysLeft || 0);
  const pricingUrl = esc(args.pricingUrl || "https://spendnote.app/spendnote-pricing.html");
  const urgency = days <= 1 ? "expires today" : `expires in ${days} days`;
  const subject = `Your SpendNote trial ${urgency}`;
  const txCount = args.txCount ?? 0;

  const txLine = txCount > 0
    ? `<p style="margin:0 0 10px;font-weight:700;">You've recorded ${txCount} transaction${txCount === 1 ? "" : "s"}. After expiry, you can't add new ones.</p>`
    : `<p style="margin:0 0 10px;font-weight:700;">${PAIN_LINE}</p>`;

  const html = appCard(
    `Trial ${urgency}`,
    "Keep your cash records intact.",
    `
      <p style="margin:0 0 10px;">Hi ${name},</p>
      <p style="margin:0 0 10px;">Your free trial ${urgency}. After that, you won't be able to create new transactions or receipts.</p>
      ${txLine}
      <p style="margin:0 0 14px;"><strong>Your existing data stays safe</strong> &mdash; you can always view and export it. But new entries require an active plan.</p>
      <div style="margin:18px 0 16px;">
        <a href="${pricingUrl}" style="${CTA_STYLE}">Choose a plan &rarr;</a>
      </div>
      <p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>Plans start at $19/month:</strong></p>
      <ul style="margin:0 0 14px;padding-left:18px;color:#374151;font-size:13px;">
        <li><strong>Standard</strong> &mdash; 2 Cash Boxes, printable receipts, CSV export</li>
        <li><strong>Pro</strong> &mdash; Unlimited Cash Boxes, team access, email receipts</li>
      </ul>
      <p style="margin:0;color:#6b7280;font-size:12px;">Need help? Visit our <a href="https://spendnote.app/spendnote-faq.html" style="color:#1d4ed8;">FAQ</a> or contact <a href="mailto:support@spendnote.app" style="color:#1d4ed8;">support@spendnote.app</a>.</p>
    `,
  );

  const txText = txCount > 0
    ? `You've recorded ${txCount} transaction${txCount === 1 ? "" : "s"}. After expiry, you can't add new ones.`
    : PAIN_LINE;
  const text = `Your SpendNote trial ${urgency}\n\nHi ${args.fullName || "there"},\n\nYour trial ${urgency}.\n${txText}\n\nChoose a plan: ${args.pricingUrl}`;
  return { subject, html, text };
};

// ─── Upgrade confirmed ──────────────────────────────────────────────────────────

export const renderUpgradeConfirmedTemplate = (args: {
  fullName?: string;
  plan: string;
  dashboardUrl: string;
}): BaseEmailTemplate => {
  const name = esc(String(args.fullName || "there").trim() || "there");
  const plan = esc(String(args.plan || "Standard").trim());
  const dashboardUrl = esc(args.dashboardUrl || "https://spendnote.app/dashboard.html");
  const subject = `Welcome to SpendNote ${args.plan || "Standard"}`;

  const isPro = String(args.plan || "").toLowerCase() === "pro";
  const featureList = isPro
    ? `<li>Unlimited Cash Boxes</li><li>Team management &mdash; invite your first member</li><li>Email receipts</li><li>Custom receipt labels &amp; logo</li><li>CSV export</li>`
    : `<li>2 Cash Boxes</li><li>Printable receipts</li><li>Custom receipt labels &amp; logo</li><li>CSV export</li>`;

  const html = appCard(
    `You're on ${plan}`,
    "You're now set up to track your cash properly.",
    `
      <p style="margin:0 0 10px;">Hi ${name},</p>
      <p style="margin:0 0 14px;">Your SpendNote <strong>${plan}</strong> plan is now active. Here's what you've unlocked:</p>
      <ul style="margin:0 0 14px;padding-left:18px;color:#374151;font-size:13px;">${featureList}</ul>
      <div style="margin:18px 0 16px;">
        <a href="${dashboardUrl}" style="${CTA_STYLE}">Open SpendNote &rarr;</a>
      </div>
      <p style="margin:0;color:#6b7280;font-size:12px;">Manage your subscription anytime from Settings. Need help? Visit our <a href="https://spendnote.app/spendnote-faq.html" style="color:#1d4ed8;">FAQ</a> or contact <a href="mailto:support@spendnote.app" style="color:#1d4ed8;">support@spendnote.app</a>.</p>
    `,
  );

  const text = `Welcome to SpendNote ${args.plan || "Standard"}\n\nHi ${args.fullName || "there"}, you're now set up to track your cash properly. Your ${args.plan} plan is active.\n\nOpen SpendNote: ${args.dashboardUrl}`;
  return { subject, html, text };
};

// ─── Password changed ───────────────────────────────────────────────────────────

export const renderPasswordChangedTemplate = (): BaseEmailTemplate => {
  const subject = "Your SpendNote password was changed";
  const loginUrl = "https://spendnote.app/spendnote-login.html";

  const html = appCard(
    "Password changed",
    "Your password was updated successfully.",
    `
      <p style="margin:0 0 10px;">Your SpendNote password was changed successfully.</p>
      <p style="margin:0 0 14px;">If you made this change, no further action is needed.</p>
      <div style="margin:18px 0 16px;">
        <a href="${loginUrl}" style="${CTA_STYLE}">Open SpendNote &rarr;</a>
      </div>
      <p style="margin:0;color:#6b7280;font-size:12px;">If you didn't make this change, contact us immediately at <a href="mailto:support@spendnote.app" style="color:#1d4ed8;">support@spendnote.app</a>.</p>
    `,
  );

  const text = `Your SpendNote password was changed\n\nYour password was updated successfully. If you made this change, no action is needed.\n\nIf you didn't make this change, contact us at support@spendnote.app immediately.`;
  return { subject, html, text };
};
