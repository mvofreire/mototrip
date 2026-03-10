'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { MessageSquare } from 'lucide-react'
import { commentsService } from '@/lib/services/comments.service'
import { RouteCommentWithUser } from '@/types'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'

interface CommentsListProps {
  routeId: string
  locale: string
}

export function CommentsList({ routeId, locale }: CommentsListProps) {
  const t = useTranslations('comments')
  const { user, profile } = useAuth()
  
  const [comments, setComments] = useState<RouteCommentWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComments, setTotalComments] = useState(0)
  
  const pageSize = 20

  const loadComments = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError('')
      const response = await commentsService.getRouteComments(routeId, page, pageSize)
      
      setComments(response.comments)
      setTotalComments(response.total)
      setTotalPages(response.totalPages)
      setCurrentPage(response.page)
    } catch (err) {
      console.error('Error loading comments:', err)
      setError(t('errors.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [routeId])

  const handleCreateComment = async (content: string) => {
    if (!user) {
      throw new Error(t('errors.loginRequired'))
    }

    setIsSubmitting(true)
    try {
      const newComment = await commentsService.createComment(routeId, content, user.id)
      
      // Add new comment to the top of the list
      setComments([newComment, ...comments])
      setTotalComments(totalComments + 1)
      
      // Reload if we need to recalculate pages
      if (comments.length >= pageSize) {
        await loadComments(1)
      }
    } catch (err) {
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!user) {
      throw new Error(t('errors.loginRequired'))
    }

    const updatedComment = await commentsService.updateComment(commentId, content, user.id)
    
    setComments(comments.map(c => 
      c.id === commentId ? updatedComment : c
    ))
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      throw new Error(t('errors.loginRequired'))
    }

    const isAdmin = profile?.is_admin || false
    await commentsService.deleteComment(commentId, user.id, isAdmin)
    
    // Remove comment from list
    const newComments = comments.filter(c => c.id !== commentId)
    setComments(newComments)
    setTotalComments(totalComments - 1)
    
    // Reload if we're on a page that now has no comments and it's not page 1
    if (newComments.length === 0 && currentPage > 1) {
      await loadComments(currentPage - 1)
    } else if (newComments.length === 0 && currentPage === 1) {
      // Just cleared the last comment
      setTotalPages(0)
    }
  }

  const handlePageChange = (page: number) => {
    loadComments(page)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-xl font-semibold">
          {t('title')}
        </h3>
        <span className="text-sm text-muted-foreground">
          ({totalComments})
        </span>
      </div>

      <Separator />

      {/* Comment Form (only for logged-in users) */}
      {user ? (
        <Card className="p-4">
          <CommentForm
            onSubmit={handleCreateComment}
            isSubmitting={isSubmitting}
          />
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">
            {t('loginPrompt')}
          </p>
        </Card>
      )}

      {/* Comments List */}
      {isLoading && comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            onClick={() => loadComments(currentPage)}
            className="mt-4"
          >
            {t('retry')}
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              isAdmin={profile?.is_admin || false}
              locale={locale}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            {t('pagination.previous')}
          </Button>
          
          <span className="text-sm text-muted-foreground px-4">
            {t('pagination.page', { current: currentPage, total: totalPages })}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            {t('pagination.next')}
          </Button>
        </div>
      )}
    </div>
  )
}
