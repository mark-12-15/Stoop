import { Resend } from "resend";

type Params = {
  to: string;
  landlordName: string | null;
  propertyAddress: string;
  ticketId: string;
  tenantRawText: string;
  isEmergency: boolean;
  tenantName?: string | null;
  tenantEmail?: string | null;
  tenantPhone?: string | null;
};

export async function sendNewTicketNotification(params: Params): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stoopkeep.com";
  const ticketUrl = `${appUrl}/dashboard/tickets/${params.ticketId}`;
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@stoopkeep.com";

  const greeting = params.landlordName ? `Hi ${params.landlordName},` : "Hi,";
  const emergencyLabel = params.isEmergency ? "🚨 Emergency" : "Normal";
  const subject = params.isEmergency
    ? `[Emergency] New repair request — ${params.propertyAddress}`
    : `New repair request — ${params.propertyAddress}`;

  const hasContact = params.tenantName || params.tenantEmail || params.tenantPhone;
  const contactLines = hasContact
    ? [
        `Name:   ${params.tenantName || "Not provided"}`,
        `Email:  ${params.tenantEmail || "Not provided"}`,
        `Phone:  ${params.tenantPhone || "Not provided"}`,
      ].join("\n")
    : "Tenant did not provide contact info.";

  const text = `
${greeting}

A new maintenance request has been submitted for your property.

Property: ${params.propertyAddress}
Priority: ${emergencyLabel}

Description:
${params.tenantRawText}

---
Tenant Contact Info
${contactLines}
---

View the ticket in your dashboard:
${ticketUrl}

—
StoopKeep · Automated notification, please do not reply
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;color:#1e293b;max-width:560px;margin:0 auto;padding:24px">

  <p style="margin-bottom:16px">${greeting}</p>

  <p style="margin-bottom:16px">A new maintenance request has been submitted for your property.</p>

  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
    <tr>
      <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;width:120px">Property</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0">${escapeHtml(params.propertyAddress)}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600">Priority</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;${params.isEmergency ? "color:#dc2626;font-weight:600" : ""}">${emergencyLabel}</td>
    </tr>
  </table>

  <p style="font-weight:600;margin-bottom:8px">Description</p>
  <blockquote style="margin:0 0 20px;padding:12px 16px;background:#f8fafc;border-left:4px solid #64748b;border-radius:4px;font-size:14px;white-space:pre-wrap">${escapeHtml(params.tenantRawText)}</blockquote>

  <p style="font-weight:600;margin-bottom:8px">Tenant Contact Info</p>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px">
    <tr>
      <td style="padding:6px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;width:80px">Name</td>
      <td style="padding:6px 12px;border:1px solid #e2e8f0;color:${params.tenantName ? "#1e293b" : "#94a3b8"}">${escapeHtml(params.tenantName || "Not provided")}</td>
    </tr>
    <tr>
      <td style="padding:6px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600">Email</td>
      <td style="padding:6px 12px;border:1px solid #e2e8f0;color:${params.tenantEmail ? "#1e293b" : "#94a3b8"}">${escapeHtml(params.tenantEmail || "Not provided")}</td>
    </tr>
    <tr>
      <td style="padding:6px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600">Phone</td>
      <td style="padding:6px 12px;border:1px solid #e2e8f0;color:${params.tenantPhone ? "#1e293b" : "#94a3b8"}">${escapeHtml(params.tenantPhone || "Not provided")}</td>
    </tr>
  </table>

  <a href="${ticketUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">View in Dashboard →</a>

  <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0">
  <p style="font-size:12px;color:#94a3b8">StoopKeep · Automated notification, please do not reply</p>

</body>
</html>
`.trim();

  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    // Production: send via Resend
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to: params.to, subject, text, html });
    return;
  }

  // Local dev: inject directly into Mailpit via HTTP API (no SMTP needed)
  const mailpitUrl = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";
  await fetch(`${mailpitUrl}/api/v1/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      From: { Email: from },
      To: [{ Email: params.to }],
      Subject: subject,
      Text: text,
      HTML: html,
    }),
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
