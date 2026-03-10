'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { commentsService } from '@/lib/services/comments.service'

interface CommentsCountProps {
  routeId: string
  className?: string
}

export function CommentsCount({ routeId, className = '' }: CommentsCountProps) {
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCount = async () => {
      try {
        const commentCount = await commentsService.getCommentsCount(routeId)
        setCount(commentCount)
      } catch (error) {
        console.error('Error loading comments count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCount()
  }, [routeId])

  if (isLoading) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <MessageSquare className="h-4 w-4" />
      <span>{count}</span>
    </div>
  )
}
