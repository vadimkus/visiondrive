import { NextRequest, NextResponse } from 'next/server'

const CONTACT_EMAIL = 'tech@visiondrive.ae'
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT || '587'
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // If SMTP is configured, send via nodemailer-style fetch
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      // Use AWS SES or SMTP relay
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })

      await transporter.sendMail({
        from: `"VisionDrive Contact" <${SMTP_USER}>`,
        to: CONTACT_EMAIL,
        replyTo: email,
        subject: `[VisionDrive Contact] New message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent from visiondrive.ae contact form</p>
        `,
      })

      return NextResponse.json({ success: true, message: 'Message sent successfully' })
    }

    // Fallback: log to server (visible in Vercel function logs)
    console.error('[CONTACT_FORM]', JSON.stringify({
      timestamp: new Date().toISOString(),
      name,
      email,
      message: message.slice(0, 500),
    }))

    return NextResponse.json({ success: true, message: 'Message received. We will get back to you soon.' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
