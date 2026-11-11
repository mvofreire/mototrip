'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' }

export function ContactForm() {
  const t = useTranslations('contact.form')
  const locale = useLocale()
  const [values, setValues] = useState(EMPTY)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale }),
      })
      if (!res.ok) throw new Error()
      setValues(EMPTY)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{t('success')}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => setStatus('idle')}>
          {t('sendAnother')}
        </Button>
      </div>
    )
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>{t('error')}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">{t('name')}</Label>
          <Input id="contact-name" value={values.name} onChange={set('name')} required maxLength={100} autoComplete="name" disabled={sending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">{t('email')}</Label>
          <Input id="contact-email" type="email" value={values.email} onChange={set('email')} required maxLength={200} autoComplete="email" disabled={sending} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">{t('subject')}</Label>
        <Input id="contact-subject" value={values.subject} onChange={set('subject')} maxLength={150} disabled={sending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">{t('message')}</Label>
        <Textarea
          id="contact-message"
          value={values.message}
          onChange={set('message')}
          placeholder={t('messagePlaceholder')}
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          disabled={sending}
        />
      </div>

      {/* Honeypot: escondido de pessoas, preenchido por bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>

      <Button type="submit" disabled={sending} className="w-full sm:w-auto">
        {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {sending ? t('sending') : t('submit')}
      </Button>
    </form>
  )
}
