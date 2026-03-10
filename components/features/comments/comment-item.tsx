'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { ptBR, enUS, es } from 'date-fns/locale'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { RouteCommentWithUser } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { CommentForm } from './comment-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CommentItemProps {
  comment: RouteCommentWithUser
  currentUserId?: string
  isAdmin?: boolean
  locale: string
  onUpdate?: (commentId: string, content: string) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
}

const localeMap = {
  pt: ptBR,
  en: enUS,
  es: es
}

export function CommentItem({
  comment,
  currentUserId,
  isAdmin = false,
  locale,
  onUpdate,
  onDelete
}: CommentItemProps) {
  const t = useTranslations('comments')
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const isOwner = currentUserId === comment.user_id
  const canModify = isOwner || isAdmin
  
  const dateLocale = localeMap[locale as keyof typeof localeMap] || enUS

  const handleUpdate = async (content: string) => {
    if (!onUpdate) return
    
    setIsUpdating(true)
    try {
      await onUpdate(comment.id, content)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating comment:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(comment.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: dateLocale
  })

  const isEdited = comment.updated_at !== comment.created_at

  return (
    <div className="flex gap-3 p-4 border rounded-lg bg-card">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {comment.user.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.name || t('item.anonymous')}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-primary">
              {(comment.user.name || 'U')[0].toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-semibold text-sm">
              {comment.user.name || t('item.anonymous')}
            </p>
            <p className="text-xs text-muted-foreground">
              {formattedDate}
              {isEdited && (
                <span className="ml-1">({t('item.edited')})</span>
              )}
            </p>
          </div>

          {/* Actions Menu */}
          {canModify && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('item.actions.edit')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('item.actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment content or edit form */}
        {isEditing ? (
          <CommentForm
            onSubmit={handleUpdate}
            isSubmitting={isUpdating}
            initialValue={comment.content}
            submitLabel={t('form.update')}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
