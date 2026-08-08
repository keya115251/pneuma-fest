import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Adjust the "from" address once you've verified a domain in Resend.
// Until then, Resend's shared test address only delivers to your own
// verified account email, not real registrants - verify a domain
// before relying on this in production.
const FROM_ADDRESS = "Dyuthi <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  try {
    const {
      toEmail,
      registrantName,
      registrantEmail,
      registrantPhone,
      eventName,
      eventDate,
      couponCode,
    } = await req.json();

    if (!toEmail || !registrantName || !eventName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `You're registered for ${eventName} — Dyuthi`,
      html: buildEmailHtml({
        registrantName,
        registrantEmail,
        registrantPhone,
        eventName,
        eventDate,
        couponCode,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("send-confirmation error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

function buildEmailHtml({
  registrantName,
  registrantEmail,
  registrantPhone,
  eventName,
  eventDate,
  couponCode,
}: {
  registrantName: string;
  registrantEmail?: string;
  registrantPhone?: string;
  eventName: string;
  eventDate?: string;
  couponCode?: string;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0a0a0f; color: #e5e5e5;">
      <h1 style="font-size: 24px; margin-bottom: 8px;">You're registered!</h1>
      <p style="color: #999; margin-bottom: 24px;">Dyuthi — National Performing Arts Festival</p>

      <div style="background: #16161c; border: 1px solid #2a2a33; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 4px; color: #999; font-size: 12px; text-transform: uppercase;">Event</p>
        <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">${eventName}</p>

        ${
          eventDate
            ? `<p style="margin: 0 0 4px; color: #999; font-size: 12px; text-transform: uppercase;">Date</p>
               <p style="margin: 0 0 16px; font-size: 16px;">${eventDate}</p>`
            : ""
        }

        <p style="margin: 0 0 4px; color: #999; font-size: 12px; text-transform: uppercase;">Registered by</p>
        <p style="margin: 0 0 16px; font-size: 16px;">${registrantName}</p>

        ${
          registrantEmail
            ? `<p style="margin: 0 0 4px; color: #999; font-size: 12px; text-transform: uppercase;">Forward to</p>
               <p style="margin: 0 0 4px; font-size: 15px;">${registrantEmail}</p>`
            : ""
        }
        ${
          registrantPhone
            ? `<p style="margin: 0; font-size: 15px; color: #999;">${registrantPhone}</p>`
            : ""
        }
      </div>

      ${
        couponCode
          ? `<div style="background: #1e1030; border: 1px solid #B497CF; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
               <p style="margin: 0 0 8px; color: #B497CF; font-size: 12px; text-transform: uppercase;">Your Workshop Discount Code</p>
               <p style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px;">${couponCode}</p>
               <p style="margin: 8px 0 0; color: #999; font-size: 13px;">40% off any workshop, details coming soon.</p>
             </div>`
          : ""
      }

      <p style="color: #999; font-size: 13px; margin-top: 24px;">
        Questions? Reach out to us on Instagram or reply to this email.
      </p>
    </div>
  `;
}