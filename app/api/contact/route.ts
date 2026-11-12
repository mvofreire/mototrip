import { NextResponse } from 'next/server'

// Mensagens do formulário de contato são enviadas pelo Resend (https://resend.com)
// e chegam na caixa contact@mototrip.pt. O domínio mototrip.pt é verificado no
// Resend, então o remetente pode ser um endereço do próprio domínio.
const TO = process.env.CONTACT_TO_EMAIL || 'contact@mototrip.pt'
const FROM = process.env.CONTACT_FROM_EMAIL || 'MotoTrip <contact@mototrip.pt>'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 }

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // Campo escondido: bots preenchem, pessoas não. Finge sucesso.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const field = (key: keyof typeof LIMITS) =>
    typeof body[key] === 'string' ? (body[key] as string).trim() : ''

  const name = field('name')
  const email = field('email')
  const subject = field('subject')
  const message = field('message')

  if (
    !name ||
    !EMAIL_RE.test(email) ||
    message.length < 10 ||
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    subject.length > LIMITS.subject ||
    message.length > LIMITS.message
  ) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set')
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  const locale = typeof body.locale === 'string' ? body.locale.slice(0, 5) : ''
  const title = subject || 'Nova mensagem de contato'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `[MotoTrip] ${title}`,
      text: `Nome: ${name}\nEmail: ${email}\nIdioma: ${locale}\n\n${message}`,
      html: `<p><strong>Nome:</strong> ${escapeHtml(name)}<br/><strong>Email:</strong> ${escapeHtml(email)}<br/><strong>Idioma:</strong> ${escapeHtml(locale)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  })

  if (!res.ok) {
    console.error('[contact] Resend error', res.status, await res.text())
    return NextResponse.json({ error: 'failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
