import { NextRequest, NextResponse } from 'next/server'

const CONTACT_EMAIL = 'tech@visiondrive.ae'
const RESEND_API_KEY = process.env.RESEND_API_KEY

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

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'VisionDrive Contact <onboarding@resend.dev>',
          to: [CONTACT_EMAIL],
          reply_to: email,
          subject: `[VisionDrive Contact] New message from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Sent from visiondrive.ae contact form</p>
          `,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('Resend API error:', err)
        throw new Error('Email delivery failed')
      }

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
