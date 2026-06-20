import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import * as nodemailer from 'nodemailer';

/* ──────────────────────────────────────────────
 *  Secrets — stored via `firebase functions:secrets:set`
 *
 *  GMAIL_ADDRESS        your Gmail address (sender + recipient)
 *  GMAIL_APP_PASSWORD   a 16-char App Password (not your login password)
 *                       Generate at https://myaccount.google.com/apppasswords
 * ────────────────────────────────────────────── */
const GMAIL_ADDRESS = defineSecret('GMAIL_ADDRESS');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');

// ── Helpers ─────────────────────────────────────────────────────────────────

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_ADDRESS.value(),
      pass: GMAIL_APP_PASSWORD.value(),
    },
  });
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return '';
  return `<tr><td style="padding:6px 12px;font-weight:600;color:#555">${label}</td><td style="padding:6px 12px">${value}</td></tr>`;
}

// ── Contact form notification ───────────────────────────────────────────────

export const onContactCreated = onDocumentCreated(
  {
    document: 'contacts/{contactId}',
    region: 'europe-north1',
    secrets: [GMAIL_ADDRESS, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) {
      console.warn('onContactCreated: no data in event, skipping');
      return;
    }

    const { fullName, company, workEmail, projectBudget, projectDetails } = data;
    console.log(`onContactCreated: processing contact from ${fullName}`);
    console.log(`onContactCreated: GMAIL_ADDRESS set=${!!GMAIL_ADDRESS.value()}, GMAIL_APP_PASSWORD set=${!!GMAIL_APP_PASSWORD.value()}, pass length=${GMAIL_APP_PASSWORD.value().length}`);

    const html = `
      <h2 style="color:#4f46e5">New Contact Submission</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        ${row('Name', fullName)}
        ${row('Company', company)}
        ${row('Email', workEmail)}
        ${row('Budget', projectBudget)}
        ${row('Language', data.language)}
        ${row('Page', data.url)}
      </table>
      <h3 style="margin-top:20px;color:#333">Project Details</h3>
      <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px">${projectDetails}</p>
    `;

    try {
      const info = await getTransporter().sendMail({
        from: `Cloudie Website <${GMAIL_ADDRESS.value()}>`,
        to: GMAIL_ADDRESS.value(),
        subject: `🟢 New contact: ${fullName}`,
        html,
      });
      console.log(`onContactCreated: email sent successfully, messageId=${info.messageId}`);
    } catch (err) {
      console.error('onContactCreated: failed to send email', err);
      throw err;
    }
  },
);

// ── Career application notification ──────────────────────────────────────────

export const onCareerApplicationCreated = onDocumentCreated(
  {
    document: 'career_applications/{applicationId}',
    region: 'europe-north1',
    secrets: [GMAIL_ADDRESS, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) {
      console.warn('onCareerApplicationCreated: no data in event, skipping');
      return;
    }

    const { fullName, email, phone, linkedin, position, coverLetter, resumeUrl, resumeFileName } = data;
    console.log(`onCareerApplicationCreated: processing application from ${fullName}`);

    const html = `
      <h2 style="color:#4f46e5">New Career Application</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        ${row('Name', fullName)}
        ${row('Email', email)}
        ${row('Phone', phone)}
        ${row('LinkedIn', linkedin)}
        ${row('Position', position)}
        ${row('Resume', resumeUrl ? `<a href="${resumeUrl}">${resumeFileName || 'Download'}</a>` : null)}
        ${row('Language', data.language)}
        ${row('Page', data.url)}
      </table>
      ${coverLetter ? `<h3 style="margin-top:20px;color:#333">Cover Letter</h3><p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px">${coverLetter}</p>` : ''}
    `;

    try {
      const info = await getTransporter().sendMail({
        from: `Cloudie Website <${GMAIL_ADDRESS.value()}>`,
        to: GMAIL_ADDRESS.value(),
        subject: `🟣 New application: ${fullName}${position ? ` — ${position}` : ''}`,
        html,
      });
      console.log(`onCareerApplicationCreated: email sent successfully, messageId=${info.messageId}`);
    } catch (err) {
      console.error('onCareerApplicationCreated: failed to send email', err);
      throw err;
    }
  },
);
