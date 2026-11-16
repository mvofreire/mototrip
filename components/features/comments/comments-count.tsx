import { MessageSquare } from 'lucide-react'

interface CommentsCountProps {
  /** routes.comments_count, kept up to date by a trigger on route_comments */
  count: number
  className?: string
}

export function CommentsCount({ count, className = '' }: CommentsCountProps) {
  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <MessageSquare className="h-4 w-4" />
      <span>{count}</span>
    </div>
  )
}
