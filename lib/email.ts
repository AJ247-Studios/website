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
 * Send the pricing guide welcome email to a new subscriber
 */
export async function sendPricingGuideEmail(email: string): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aj247studios.com";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
          Your 2026 Pricing Guide is Here 📸
        </h1>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">
          AJ247 Studios — Kraków Photo & Video Production
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none;">
        <p style="margin-top: 0;">Hey there,</p>

        <p>Thanks for joining the AJ247 Studios early list! Here's everything you need to know about our 2026 pricing, plus the insider tips I promised.</p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/pricing-guide" 
             style="display: inline-block; padding: 14px 32px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            View Full Pricing Guide →
          </a>
        </div>

        <!-- 5 Insider Tips -->
        <div style="background: #f8fafc; border-radius: 10px; padding: 24px; margin: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0;">5 Insider Tips for Better Event Photos</h2>
          
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">1. Book 3–4 months ahead</div>
            <div style="font-size: 14px; color: #475569;">The best Kraków venues and dates fill up fast, especially May–September wedding season and autumn sports leagues.</div>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">2. Send a shot list 48 hours before</div>
            <div style="font-size: 14px; color: #475569;">Even for candid events, a short list of "must-have" moments ensures nothing important gets missed.</div>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">3. Schedule golden hour portraits</div>
            <div style="font-size: 14px; color: #475569;">If your event has a break, use it. 30 minutes before sunset gives the most flattering natural light in Kraków's Old Town.</div>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">4. Designate a family "spotter"</div>
            <div style="font-size: 14px; color: #475569;">At big events, assign one person who knows both families to help gather people for group shots. Saves 20+ minutes.</div>
          </div>

          <div style="margin-bottom: 0;">
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">5. Plan the video interview early</div>
            <div style="font-size: 14px; color: #475569;">If you want testimonials or messages on camera, capture them before the event energy drops. Post-ceremony is usually best.</div>
          </div>
        </div>

        <!-- Quick Pricing Preview -->
        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 12px 0;">2026 Pricing Snapshot</h2>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #475569; border-bottom: 1px solid #f1f5f9;">Portrait Mini Session</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">450 PLN</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569; border-bottom: 1px solid #f1f5f9;">Sports Coverage (Customized)</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">1,499 PLN</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569; border-bottom: 1px solid #f1f5f9;">Wedding Coverage (Customized)</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">3,499 PLN</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569; border-bottom: 1px solid #f1f5f9;">Corporate Half Day</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">1,199 PLN</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569;">Concert Premium Package</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">4,999 PLN</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0 0;">
            All packages include edited photos, online gallery delivery, and clear turnaround times.
            <a href="${siteUrl}/services" style="color: #2563eb; text-decoration: none;">See full details →</a>
          </p>
        </div>

        <!-- What's Next -->
        <div style="background: #eff6ff; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">What's coming next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px;">
            <li style="margin-bottom: 6px;"><strong>Day 3:</strong> How to prepare for your shoot</li>
            <li style="margin-bottom: 6px;"><strong>Day 7:</strong> Portfolio highlights & behind-the-scenes</li>
            <li><strong>Day 14:</strong> Exclusive 10% early-booking discount</li>
          </ul>
        </div>

        <p style="margin-bottom: 0;">Questions? Just reply to this email or <a href="https://wa.me/48503685377" style="color: #2563eb; text-decoration: none;">message us on WhatsApp</a>.</p>
      </div>

      <!-- Footer -->
      <div style="padding: 24px 30px; text-align: center; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">
          <strong>AJ247 Studios</strong><br>
          Kraków, Poland
        </p>
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          <a href="${siteUrl}/unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> anytime.
          We never spam.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Your 2026 Pricing Guide + 5 Insider Tips — AJ247 Studios",
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
