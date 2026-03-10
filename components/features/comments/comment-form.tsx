'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  isSubmitting?: boolean
  initialValue?: string
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
}

export function CommentForm({
  onSubmit,
  isSubmitting = false,
  initialValue = '',
  submitLabel,
  cancelLabel,
  onCancel
}: CommentFormProps) {
  const t = useTranslations('comments')
  const [content, setContent] = useState(initialValue)
  const [error, setError] = useState('')

  const maxLength = 500
  const remainingChars = maxLength - content.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError(t('errors.empty'))
      return
    }

    if (content.length > maxLength) {
      setError(t('errors.tooLong'))
      return
    }

    try {
      await onSubmit(content)
      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.submitFailed'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="comment-content">
          {t('form.label')}
        </Label>
        <Textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('form.placeholder')}
          className="min-h-[100px] resize-none"
          maxLength={maxLength}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between text-sm">
          <span className={remainingChars < 50 ? 'text-orange-600' : 'text-muted-foreground'}>
            {t('form.charactersRemaining', { count: remainingChars })}
          </span>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? t('form.submitting') : (submitLabel || t('form.submit'))}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel || t('form.cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}
