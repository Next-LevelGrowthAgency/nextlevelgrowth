import { siteConfig } from "@/lib/site-config";
import type { LeadProfile, OwnerLeadSummary } from "@/types";

/**
 * Email templates for the Growth Coach lead-capture flow — the internal
 * notification sent to the Next Level Growth inbox, and the personalized
 * report sent to the visitor. Deliberately framework-free (no React Email /
 * JSX) so these render identically through the Resend adapter and are easy
 * to unit-test as plain strings. All visitor-supplied and conversation text
 * is passed through `escapeHtml` before it reaches an HTML template — never
 * interpolate raw user input into `html` output.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlList(items: string[] | undefined): string {
  if (!items || items.length === 0) return '<p style="color:#6b7280;margin:0;">None recorded.</p>';
  return `<ul style="margin:0;padding-left:20px;">${items.map((i) => `<li style="margin-bottom:4px;">${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function textList(items: string[] | undefined): string {
  if (!items || items.length === 0) return "  (none recorded)";
  return items.map((i) => `  - ${i}`).join("\n");
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(value)}</td></tr>`;
}

function textRow(label: string, value: string | null | undefined): string {
  return value ? `${label}: ${value}\n` : "";
}

function sectionHeading(title: string): string {
  return `<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#14321f;margin:24px 0 8px;">${escapeHtml(title)}</h2>`;
}

function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1c1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e0;">
          <tr><td style="background:#14321f;padding:20px 28px;">
            <span style="color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.02em;">${escapeHtml(siteConfig.name)}</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="font-size:20px;margin:0 0 16px;">${escapeHtml(title)}</h1>
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 28px;background:#f5f5f4;border-top:1px solid #e5e5e0;font-size:12px;color:#6b7280;">
            ${escapeHtml(siteConfig.name)} &middot; <a href="mailto:${escapeHtml(siteConfig.contact.email)}" style="color:#14321f;">${escapeHtml(siteConfig.contact.email)}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

// -----------------------------------------------------------------------
// A) Internal lead notification — sent to the Next Level Growth inbox
// -----------------------------------------------------------------------

export function buildInternalLeadEmailSubject(lead: LeadProfile): string {
  const who = lead.businessName || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unnamed visitor";
  const need = lead.biggestGrowthGap || lead.primaryChallenge || lead.recommendedServices?.[0]?.name || "General inquiry";
  return `New Growth Coach Lead — ${who} — ${need}`;
}

export function buildInternalLeadEmail(lead: LeadProfile, summary: OwnerLeadSummary): { html: string; text: string } {
  const contactRows = [
    row("Name", summary.name),
    row("Email", summary.email),
    row("Phone", summary.phone),
    row("Preferred contact method", summary.preferredContactMethod),
  ]
    .filter(Boolean)
    .join("");

  const businessRows = [
    row("Business name", summary.businessName),
    row("Industry", summary.industry),
    row("Location", summary.location),
    row("Website", summary.website),
    row("Business stage", summary.businessStage),
    row("Team size", summary.teamSize),
  ]
    .filter(Boolean)
    .join("");

  const growthSystemRows = [
    row("Primary goal", summary.primaryGoal),
    row("Biggest challenge", summary.primaryChallenge),
    row("Marketing channels", summary.marketingChannels),
    row("Monthly lead volume", summary.leadVolume),
    row("Budget / revenue range", summary.revenueOrBudget),
    row("Timeline", summary.timeline),
    row("Constraints", summary.constraints),
  ]
    .filter(Boolean)
    .join("");

  const html = emailShell(
    "New Growth Coach Lead",
    `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr><td style="padding:6px 10px;background:${summary.qualification === "high-priority-follow-up" ? "#fde8dc" : "#eef4ee"};border-radius:8px;font-size:13px;font-weight:600;">
        Lead readiness: ${escapeHtml(summary.qualification)}${summary.consultationRequested ? " — requested a strategy conversation" : ""}
      </td></tr>
    </table>
    ${sectionHeading("Contact")}
    <table role="presentation" cellpadding="0" cellspacing="0">${contactRows || '<tr><td style="color:#6b7280;font-size:13px;">Not provided</td></tr>'}</table>
    ${sectionHeading("Business")}
    <table role="presentation" cellpadding="0" cellspacing="0">${businessRows || '<tr><td style="color:#6b7280;font-size:13px;">Not provided</td></tr>'}</table>
    ${sectionHeading("Current Growth System")}
    <table role="presentation" cellpadding="0" cellspacing="0">${growthSystemRows || '<tr><td style="color:#6b7280;font-size:13px;">Not provided</td></tr>'}</table>
    ${sectionHeading("Assessment")}
    <table role="presentation" cellpadding="0" cellspacing="0">
      ${row("Growth Score", summary.growthScore != null ? `${summary.growthScore}/100 (${summary.growthScoreBand ?? "n/a"}, confidence: ${summary.growthScoreConfidence ?? "n/a"})` : null)}
      ${row("Priority gap", summary.biggestGrowthGap)}
      ${row("Recommended plan", summary.recommendedPlan)}
      ${row("90-day plan requested", summary.ninetyDayPlanRequested ? "Yes" : "No")}
    </table>
    <p style="font-size:13px;font-weight:600;margin:12px 0 4px;">Recommended services</p>
    ${htmlList(summary.recommendedServices)}
    ${
      summary.growthCategorySnapshot && summary.growthCategorySnapshot.length > 0
        ? `<p style="font-size:13px;font-weight:600;margin:12px 0 4px;">Category scores</p>${htmlList(summary.growthCategorySnapshot.map((c) => `${c.label}: ${c.score}/100`))}`
        : ""
    }
    ${sectionHeading("AI Analysis")}
    <p style="font-size:13px;margin:0 0 8px;"><strong>Conversation summary:</strong> ${escapeHtml(summary.reportSummary)}</p>
    <p style="font-size:13px;margin:0 0 8px;"><strong>Next action:</strong> ${escapeHtml(summary.nextAction)}</p>
    <p style="font-size:13px;margin:0;"><strong>Suggested follow-up approach:</strong> ${escapeHtml(summary.suggestedFollowUpApproach)}</p>
    ${sectionHeading("Data Sources")}
    <p style="font-size:12px;color:#6b7280;margin:0;">
      Contact and business details are as entered by the visitor (user_stated). The priority gap, category scores, and
      recommended services/plan are produced by a deterministic rule engine from those answers (system_derived), not
      free-form AI generation. No inference is presented to the visitor or to you as a confirmed fact.
    </p>
    ${sectionHeading("Consent")}
    <table role="presentation" cellpadding="0" cellspacing="0">
      ${row("Save & send report", summary.consent.saveReport ? "Yes" : "No")}
      ${row("Email follow-up", summary.consent.emailFollowUp ? "Yes" : "No")}
      ${row("Phone call", summary.consent.phoneCall ? "Yes" : "No")}
      ${row("Marketing emails", summary.consent.marketing ? "Yes" : "No")}
    </table>
    <p style="font-size:11px;color:#9ca3af;margin:8px 0 0;">
      Consent timestamps — report: ${lead.reportConsentTimestamp ? new Date(lead.reportConsentTimestamp).toISOString() : "n/a"},
      contact: ${lead.contactConsentTimestamp ? new Date(lead.contactConsentTimestamp).toISOString() : "n/a"},
      marketing: ${lead.marketingConsentTimestamp ? new Date(lead.marketingConsentTimestamp).toISOString() : "n/a"}.
      Lead ID: ${escapeHtml(lead.id)}.
    </p>
    `
  );

  const text = [
    `NEW GROWTH COACH LEAD`,
    `Lead readiness: ${summary.qualification}${summary.consultationRequested ? " (requested a strategy conversation)" : ""}`,
    ``,
    `CONTACT`,
    textRow("Name", summary.name),
    textRow("Email", summary.email),
    textRow("Phone", summary.phone),
    textRow("Preferred contact method", summary.preferredContactMethod),
    ``,
    `BUSINESS`,
    textRow("Business name", summary.businessName),
    textRow("Industry", summary.industry),
    textRow("Location", summary.location),
    textRow("Website", summary.website),
    textRow("Business stage", summary.businessStage),
    textRow("Team size", summary.teamSize),
    ``,
    `CURRENT GROWTH SYSTEM`,
    textRow("Primary goal", summary.primaryGoal),
    textRow("Biggest challenge", summary.primaryChallenge),
    textRow("Marketing channels", summary.marketingChannels),
    textRow("Monthly lead volume", summary.leadVolume),
    textRow("Budget / revenue range", summary.revenueOrBudget),
    textRow("Timeline", summary.timeline),
    ``,
    `ASSESSMENT`,
    textRow("Growth Score", summary.growthScore != null ? `${summary.growthScore}/100 (${summary.growthScoreBand ?? "n/a"})` : null),
    textRow("Priority gap", summary.biggestGrowthGap),
    textRow("Recommended plan", summary.recommendedPlan),
    textRow("90-day plan requested", summary.ninetyDayPlanRequested ? "Yes" : "No"),
    `Recommended services:`,
    textList(summary.recommendedServices),
    ``,
    `AI ANALYSIS`,
    `Conversation summary: ${summary.reportSummary}`,
    `Next action: ${summary.nextAction}`,
    `Suggested follow-up approach: ${summary.suggestedFollowUpApproach}`,
    ``,
    `DATA SOURCES`,
    `Contact/business details: user_stated. Priority gap, scores, and recommendations: system_derived (rule engine, not free-form AI).`,
    ``,
    `CONSENT`,
    textRow("Save & send report", summary.consent.saveReport ? "Yes" : "No"),
    textRow("Email follow-up", summary.consent.emailFollowUp ? "Yes" : "No"),
    textRow("Phone call", summary.consent.phoneCall ? "Yes" : "No"),
    textRow("Marketing emails", summary.consent.marketing ? "Yes" : "No"),
    ``,
    `Lead ID: ${lead.id}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { html, text };
}

// -----------------------------------------------------------------------
// B) Visitor personalized plan email — never includes internal labels,
// lead scores, sales-qualification tiers, or private notes.
// -----------------------------------------------------------------------

export function buildVisitorReportEmail(lead: LeadProfile): { subject: string; html: string; text: string } {
  const firstName = lead.firstName?.trim() || "there";
  const includeNinetyDay = Boolean(lead.ninetyDayPlanRequested && lead.ninetyDayRoadmap);

  const recommendations = (lead.recommendedServices ?? []).slice(0, 3).map((s) => `${s.name}: ${s.relevance}`);

  const html = emailShell(
    "Your Personalized Next Level Growth Plan",
    `
    <p style="font-size:14px;line-height:1.6;">Hi ${escapeHtml(firstName)},</p>
    <p style="font-size:14px;line-height:1.6;">
      Thank you for spending time with the Next Level Growth Coach. Here is the personalized plan we put together based
      on what you shared.
    </p>
    ${lead.primaryGoal ? `<p style="font-size:14px;line-height:1.6;"><strong>Your main goal:</strong> ${escapeHtml(lead.primaryGoal)}</p>` : ""}
    ${lead.growthGap ? `<p style="font-size:14px;line-height:1.6;"><strong>Priority gap:</strong> ${escapeHtml(lead.growthGap)}</p>` : ""}
    ${sectionHeading("Three Immediate Recommendations")}
    ${htmlList(recommendations)}
    ${lead.nextAction ? `${sectionHeading("First Action")}<p style="font-size:14px;line-height:1.6;">${escapeHtml(lead.nextAction)}</p>` : ""}
    ${sectionHeading("Your 30-Day Plan")}
    ${htmlList(lead.thirtyDayPlan)}
    ${
      includeNinetyDay && lead.ninetyDayRoadmap
        ? `${sectionHeading("Your Full 90-Day Roadmap")}
           <p style="font-size:13px;font-weight:600;margin:12px 0 4px;">Days 1–30</p>${htmlList(lead.ninetyDayRoadmap.days1to30)}
           <p style="font-size:13px;font-weight:600;margin:12px 0 4px;">Days 31–60</p>${htmlList(lead.ninetyDayRoadmap.days31to60)}
           <p style="font-size:13px;font-weight:600;margin:12px 0 4px;">Days 61–90</p>${htmlList(lead.ninetyDayRoadmap.days61to90)}`
        : `<p style="font-size:13px;color:#6b7280;margin:16px 0 0;">Want the full 90-day roadmap, not just the 30-day plan? Reply to this email and we'll send it.</p>`
    }
    ${sectionHeading("Where We Could Help")}
    <p style="font-size:14px;line-height:1.6;">
      ${lead.recommendedPlan ? escapeHtml(lead.recommendedPlan.reason) : "A short conversation is the fastest way to figure out the right starting point."}
    </p>
    <p style="font-size:14px;line-height:1.6;margin-top:20px;">
      Have questions, or want to talk any of this through? Just reply to this email; a real person reads every response.
    </p>
    <p style="font-size:12px;color:#6b7280;line-height:1.6;margin-top:20px;">
      This plan is based on the information you shared in your conversation with the Growth Coach. It provides
      educational business, marketing, and technology guidance, not legal, tax, accounting, investment, or medical
      advice, and it does not guarantee any specific business result.
    </p>
    `
  );

  const text = [
    `Your Personalized Next Level Growth Plan`,
    ``,
    `Hi ${firstName},`,
    ``,
    `Thank you for spending time with the Next Level Growth Coach. Here is the personalized plan we put together based on what you shared.`,
    ``,
    lead.primaryGoal ? `Your main goal: ${lead.primaryGoal}` : "",
    lead.growthGap ? `Priority gap: ${lead.growthGap}` : "",
    ``,
    `THREE IMMEDIATE RECOMMENDATIONS`,
    textList(recommendations),
    ``,
    lead.nextAction ? `FIRST ACTION\n${lead.nextAction}\n` : "",
    `YOUR 30-DAY PLAN`,
    textList(lead.thirtyDayPlan),
    ``,
    includeNinetyDay && lead.ninetyDayRoadmap
      ? [
          `YOUR FULL 90-DAY ROADMAP`,
          `Days 1-30:`,
          textList(lead.ninetyDayRoadmap.days1to30),
          `Days 31-60:`,
          textList(lead.ninetyDayRoadmap.days31to60),
          `Days 61-90:`,
          textList(lead.ninetyDayRoadmap.days61to90),
        ].join("\n")
      : `Want the full 90-day roadmap, not just the 30-day plan? Reply to this email and we'll send it.`,
    ``,
    `WHERE WE COULD HELP`,
    lead.recommendedPlan ? lead.recommendedPlan.reason : "A short conversation is the fastest way to figure out the right starting point.",
    ``,
    `Have questions, or want to talk any of this through? Just reply to this email; a real person reads every response.`,
    ``,
    `This plan is based on the information you shared in your conversation with the Growth Coach. It provides educational business, marketing, and technology guidance, not legal, tax, accounting, investment, or medical advice, and it does not guarantee any specific business result.`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject: "Your Personalized Next Level Growth Plan", html, text };
}

// -----------------------------------------------------------------------
// C) Contact form confirmation — transactional (confirms the specific
// message the visitor just sent), not gated behind a marketing-consent
// checkbox, the same way a "we got your message" receipt from any contact
// form isn't a marketing send.
// -----------------------------------------------------------------------

export function buildContactConfirmationEmail(name: string): { subject: string; html: string; text: string } {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const subject = "We received your message — Next Level Growth";
  const html = emailShell(
    "Thanks for reaching out",
    `
    <p style="font-size:14px;line-height:1.6;">Hi ${escapeHtml(firstName)},</p>
    <p style="font-size:14px;line-height:1.6;">
      Thanks for contacting ${escapeHtml(siteConfig.name)}. Your message is in, and a real person will reply, usually
      within one business day.
    </p>
    <p style="font-size:14px;line-height:1.6;">
      Have something to add in the meantime? Just reply to this email.
    </p>
    `
  );
  const text = `Hi ${firstName},\n\nThanks for contacting ${siteConfig.name}. Your message is in, and a real person will reply, usually within one business day.\n\nHave something to add in the meantime? Just reply to this email.`;
  return { subject, html, text };
}

// -----------------------------------------------------------------------
// D) Growth Audit confirmation — transactional, same rationale as above.
// -----------------------------------------------------------------------

export function buildGrowthAuditConfirmationEmail(input: { name: string; businessName: string; preferredContact: "Email" | "Phone" | "Text" }): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = input.name.trim().split(/\s+/)[0] || "there";
  const subject = "Your Growth Audit request is in — Next Level Growth";
  const contactLine =
    input.preferredContact === "Email"
      ? "by email"
      : input.preferredContact === "Phone"
        ? "by phone"
        : "by text";
  const html = emailShell(
    "Your Growth Audit request is in",
    `
    <p style="font-size:14px;line-height:1.6;">Hi ${escapeHtml(firstName)},</p>
    <p style="font-size:14px;line-height:1.6;">
      Thanks for requesting a free Growth Audit for ${escapeHtml(input.businessName)}. We'll review what you shared
      and follow up ${escapeHtml(contactLine)} within one business day with honest, specific observations, not a
      generic sales pitch.
    </p>
    <p style="font-size:14px;line-height:1.6;">
      Questions before then? Just reply to this email.
    </p>
    `
  );
  const text = `Hi ${firstName},\n\nThanks for requesting a free Growth Audit for ${input.businessName}. We'll review what you shared and follow up ${contactLine} within one business day with honest, specific observations, not a generic sales pitch.\n\nQuestions before then? Just reply to this email.`;
  return { subject, html, text };
}

// -----------------------------------------------------------------------
// E) AI monthly budget alert — internal-only, sent to the owner inbox when
// a Growth Coach cost pool crosses 80% or 100% of its monthly ceiling. See
// src/lib/growth-coach/ai/circuit-breaker.ts for when/how this fires.
// -----------------------------------------------------------------------

export function buildAiBudgetAlertEmail(input: {
  poolLabel: string;
  threshold: "80" | "100";
  cumulativeCostUsd: number;
  budgetUsd: number;
  monthKey: string;
}): { subject: string; html: string; text: string } {
  const percentLabel = input.threshold === "100" ? "100% — AI access is now paused" : "80%";
  const cost = input.cumulativeCostUsd.toFixed(2);
  const budget = input.budgetUsd.toFixed(2);
  const subject =
    input.threshold === "100"
      ? `AI Growth Coach — ${input.poolLabel} budget exhausted for ${input.monthKey}`
      : `AI Growth Coach — ${input.poolLabel} budget at 80% for ${input.monthKey}`;

  const html = emailShell(
    "Growth Coach AI Budget Alert",
    `
    <p style="font-size:14px;line-height:1.6;">
      The <strong>${escapeHtml(input.poolLabel)}</strong> monthly AI budget has reached <strong>${escapeHtml(percentLabel)}</strong>
      of its ${escapeHtml(input.monthKey)} ceiling.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      ${row("Pool", input.poolLabel)}
      ${row("Spent so far", `$${cost}`)}
      ${row("Monthly budget", `$${budget}`)}
      ${row("Month", input.monthKey)}
    </table>
    ${
      input.threshold === "100"
        ? `<p style="font-size:14px;line-height:1.6;margin-top:16px;">
             AI replies for this pool are now paused for the rest of the month — visitors in it are getting the
             scripted Growth Coach experience instead (lead capture still works normally), and the pool will resume
             automatically on the 1st. Raise AI_MONTHLY_${input.poolLabel === "Client" ? "CLIENT" : "FREE"}_BUDGET_USD
             if this ceiling should be higher.
           </p>`
        : `<p style="font-size:14px;line-height:1.6;margin-top:16px;">
             AI replies are still active. You'll get one more alert if this pool reaches 100% this month.
           </p>`
    }
    `
  );

  const text = [
    `GROWTH COACH AI BUDGET ALERT`,
    ``,
    `The ${input.poolLabel} monthly AI budget has reached ${percentLabel} of its ${input.monthKey} ceiling.`,
    ``,
    `Pool: ${input.poolLabel}`,
    `Spent so far: $${cost}`,
    `Monthly budget: $${budget}`,
    `Month: ${input.monthKey}`,
    ``,
    input.threshold === "100"
      ? `AI replies for this pool are now paused for the rest of the month — visitors in it are getting the scripted Growth Coach experience instead (lead capture still works normally), and the pool will resume automatically on the 1st.`
      : `AI replies are still active. You'll get one more alert if this pool reaches 100% this month.`,
  ].join("\n");

  return { subject, html, text };
}
