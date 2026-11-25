import nodemailer from "nodemailer";

const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USERNAME && process.env.SMTP_KEY);

const transport = configured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USERNAME, pass: process.env.SMTP_KEY },
    })
  : null;

const FROM = process.env.MAIL_FROM || "TrueUnit <no-reply@example.com>";

function layout(title: string, body: string, cta: { label: string; url: string }) {
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;color:#18181b">
  <p style="font-weight:600;font-size:16px">Scout · TrueUnit</p>
  <h1 style="font-size:20px">${title}</h1>
  <p style="font-size:15px;line-height:1.5">${body}</p>
  <p><a href="${cta.url}" style="display:inline-block;background:#2f2a7a;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">${cta.label}</a></p>
  <p style="font-size:12px;color:#71717a">If you did not ask for this, ignore this email. TrueUnit is a prototype.</p></div>`;
}

export async function sendMail(to: string, subject: string, title: string, body: string, cta: { label: string; url: string }) {
  if (!transport) {
    console.warn("[mail] SMTP not configured; skipped:", subject);
    return;
  }
  try {
    await transport.sendMail({ from: FROM, to, subject, html: layout(title, body, cta), text: `${title}\n\n${body}\n\n${cta.label}: ${cta.url}` });
  } catch (err) {
    console.error("[mail] send failed:", subject, (err as Error).message);
  }
}
