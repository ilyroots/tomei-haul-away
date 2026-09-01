import { Resend } from "resend";
import { logger } from "@/lib/logging/logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const BUSINESS_NOTIFICATION_EMAIL = process.env.BUSINESS_NOTIFICATION_EMAIL;
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function getClient(): Resend | null {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required in production.");
    }
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

function previewEmail(to: string | string[], subject: string, html: string) {
  logger.info("[EMAIL PREVIEW]", { to, subject, htmlLength: html.length });
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  const from = RESEND_FROM_EMAIL ?? "Tomei Haul Away <hello@example.com>";

  if (!RESEND_FROM_EMAIL && process.env.NODE_ENV === "production") {
    throw new Error("RESEND_FROM_EMAIL is required in production.");
  }

  const client = getClient();

  if (!client) {
    previewEmail(to, subject, html);
    return { id: "preview", preview: true };
  }

  const { data, error } = await client.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    logger.error("Failed to send email", { error, to, subject });
    throw new Error(error.message);
  }

  logger.info("Email sent", { to, subject, id: data?.id });
  return { id: data?.id, preview: false };
}

export type QuoteReceivedPayload = {
  name: string;
  email: string;
  referenceNumber: string;
  services?: string[];
};

export type MoreInfoRequestedPayload = {
  name: string;
  email: string;
  referenceNumber: string;
  questions: string;
};

export type QuoteReadyPayload = {
  name: string;
  email: string;
  referenceNumber: string;
  estimatedMin: number;
  estimatedMax: number;
  validUntil: string;
};

export type AppointmentPayload = {
  name: string;
  email: string;
  referenceNumber: string;
  scheduledDate: string;
  arrivalWindow?: string;
  address?: string;
};

export type AppointmentReminderPayload = AppointmentPayload;

export type InternalNewLeadPayload = {
  referenceNumber: string;
  name: string;
  email: string;
  phone?: string;
  services?: string[];
};

export const email = {
  quoteReceived: async (payload: QuoteReceivedPayload) => {
    const subject = `We received your quote request — ${payload.referenceNumber}`;
    const html = `
      <p>Hi ${payload.name},</p>
      <p>Thanks for contacting Tomei Haul Away. We received your request and will review it shortly.</p>
      <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
      <p><a href="${APP_URL}">Visit our site</a></p>
    `;
    return sendEmail(payload.email, subject, html);
  },

  moreInfoRequested: async (payload: MoreInfoRequestedPayload) => {
    const subject = `We need a little more information — ${payload.referenceNumber}`;
    const html = `
      <p>Hi ${payload.name},</p>
      <p>We are reviewing your request and need a bit more detail:</p>
      <blockquote>${payload.questions}</blockquote>
      <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
    `;
    return sendEmail(payload.email, subject, html);
  },

  quoteReady: async (payload: QuoteReadyPayload) => {
    const subject = `Your quote is ready — ${payload.referenceNumber}`;
    const html = `
      <p>Hi ${payload.name},</p>
      <p>Your estimate is ready:</p>
      <p><strong>Estimated range:</strong> $${payload.estimatedMin} – $${payload.estimatedMax}</p>
      <p><strong>Valid until:</strong> ${payload.validUntil}</p>
      <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
    `;
    return sendEmail(payload.email, subject, html);
  },

  appointmentConfirmed: async (payload: AppointmentPayload) => {
    const subject = `Appointment confirmed — ${payload.referenceNumber}`;
    const html = `
      <p>Hi ${payload.name},</p>
      <p>Your appointment is confirmed for <strong>${payload.scheduledDate}</strong>${payload.arrivalWindow ? ` (${payload.arrivalWindow})` : ""}.</p>
      ${payload.address ? `<p><strong>Address:</strong> ${payload.address}</p>` : ""}
      <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
    `;
    return sendEmail(payload.email, subject, html);
  },

  appointmentChanged: async (payload: AppointmentPayload) => {
    const subject = `Your appointment has been updated — ${payload.referenceNumber}`;
    const html = `
      <p>Hi ${payload.name},</p>
      <p>Your appointment has been rescheduled to <strong>${payload.scheduledDate}</strong>${payload.arrivalWindow ? ` (${payload.arrivalWindow})` : ""}.</p>
      <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
    `;
    return sendEmail(payload.email, subject, html);
  },

  appointmentCancelled: async (payload: AppointmentPayload) => {
    const subject = `Your appointment has been cancelled — ${payload.referenceNumber}`;
    const html = `
      <p>Hi ${payload.name},</p>
      <p>Your appointment on ${payload.scheduledDate} has been cancelled. Let us know if you would like to reschedule.</p>
      <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
    `;
    return sendEmail(payload.email, subject, html);
  },

  appointmentReminder: async (payload: AppointmentReminderPayload) => {
    const subject = `Reminder: junk removal appointment tomorrow — ${payload.referenceNumber}`;
    const html = `
      <p>Hi ${payload.name},</p>
      <p>This is a friendly reminder that our crew is scheduled to arrive tomorrow, <strong>${payload.scheduledDate}</strong>${payload.arrivalWindow ? ` (${payload.arrivalWindow})` : ""}.</p>
      ${payload.address ? `<p><strong>Address:</strong> ${payload.address}</p>` : ""}
      <p><strong>Reference:</strong> ${payload.referenceNumber}</p>
    `;
    return sendEmail(payload.email, subject, html);
  },

  internalNewLead: async (payload: InternalNewLeadPayload) => {
    if (!BUSINESS_NOTIFICATION_EMAIL) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("BUSINESS_NOTIFICATION_EMAIL is required in production.");
      }
      previewEmail("business@example.com", "New lead", JSON.stringify(payload));
      return { id: "preview", preview: true };
    }

    const subject = `New lead: ${payload.referenceNumber}`;
    const html = `
      <p>A new quote request was submitted.</p>
      <ul>
        <li><strong>Reference:</strong> ${payload.referenceNumber}</li>
        <li><strong>Name:</strong> ${payload.name}</li>
        <li><strong>Email:</strong> ${payload.email}</li>
        ${payload.phone ? `<li><strong>Phone:</strong> ${payload.phone}</li>` : ""}
        ${payload.services?.length ? `<li><strong>Services:</strong> ${payload.services.join(", ")}</li>` : ""}
      </ul>
      <p><a href="${APP_URL}/admin/leads/${payload.referenceNumber}">View in admin</a></p>
    `;
    return sendEmail(BUSINESS_NOTIFICATION_EMAIL, subject, html);
  },
};
