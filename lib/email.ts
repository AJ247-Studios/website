import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

interface LeadRecord {
  name: string;
  email: string;
  phone?: string | null;
  service: string;
  event_date?: string | null;
  message?: string | null;
  projectSlug?: string | null;
  source?: string;
  ip_address?: string;
  created_at: string;
}

// Initialize the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Email configuration missing");
      return false;
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      ...options,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send notification email to the team when a new lead is submitted
 */
export async function sendNotificationEmail(lead: LeadRecord): Promise<boolean> {
  const teamEmail = process.env.NEXT_PUBLIC_TEAM_EMAIL || "aj247studios@gmail.com";

  const serviceLabel = {
    sports: "Sports & Events Photography",
    wedding: "Wedding Photography",
    product: "Product Photography",
    "real-estate": "Real Estate Photography",
    portrait: "Portrait Photography",
    corporate: "Corporate Photography",
    other: "Other",
  }[lead.service] || lead.service;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
      <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
        🎯 New Quote Request
      </h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Lead Details</h3>
        
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
        ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ""}
        <p><strong>Service:</strong> ${serviceLabel}</p>
        ${lead.event_date ? `<p><strong>Event Date:</strong> ${lead.event_date}</p>` : ""}
        <p><strong>Source:</strong> ${lead.source || "contact_form"}</p>
        ${lead.projectSlug ? `<p><strong>Project:</strong> ${lead.projectSlug}</p>` : ""}
      </div>

      ${
        lead.message
          ? `
      <div style="background-color: #fff9e6; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin-top: 0;">Message:</h4>
        <p style="white-space: pre-wrap; word-break: break-word;">${escapeHtml(lead.message)}</p>
      </div>
      `
          : ""
      }

      <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          <strong>Submitted:</strong> ${new Date(lead.created_at).toLocaleString()}<br>
          <strong>IP Address:</strong> ${lead.ip_address || "N/A"}
        </p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #999;">
          This is an automated notification from your website. Log in to your dashboard to manage this lead.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: teamEmail,
    subject: `New Quote Request: ${lead.name} - ${serviceLabel}`,
    html,
    replyTo: lead.email,
  });
}

/**
 * Send confirmation email to the customer
 */
export async function sendConfirmationEmail(lead: LeadRecord): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
      <h2 style="color: #0066cc;">Thank You for Your Inquiry! 🎉</h2>
      
      <p>Hi ${lead.name},</p>
      
      <p>We've received your quote request and we're excited to help you with your ${lead.service} needs!</p>
      
      <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0066cc;">What happens next?</h3>
        <ol>
          <li><strong>We Review:</strong> Our team will review your request right away</li>
          <li><strong>You Get a Quote:</strong> We'll send you a personalized quote within 2 hours during business hours</li>
          <li><strong>Let's Connect:</strong> We can schedule a call if you'd like to discuss your project further</li>
        </ol>
      </div>

      <p>In the meantime, feel free to explore our <a href="https://aj247studios.com/portfolio" style="color: #0066cc; text-decoration: none;">portfolio</a> to see some of our recent work.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">
          <strong>Have questions?</strong> You can reach us at <a href="mailto:aj247studios@gmail.com" style="color: #0066cc; text-decoration: none;">aj247studios@gmail.com</a>
        </p>
      </div>

      <p>Looking forward to working with you!</p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        <strong>AJ247 Studios</strong><br>
        Professional Photography & Videography
      </p>
    </div>
  `;

  return sendEmail({
    to: lead.email,
    subject: "We've Received Your Quote Request - AJ247 Studios",
    html,
  });
}

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
