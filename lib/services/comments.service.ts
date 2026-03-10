import { supabase } from '@/lib/supabase/client'
import { RouteComment, RouteCommentInsert, RouteCommentUpdate, RouteCommentWithUser } from '@/types'

export interface CommentsPaginationResponse {
  comments: RouteCommentWithUser[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class CommentsService {
  private supabase = supabase

  /**
   * Get comments for a specific route with pagination
   */
  async getRouteComments(
    routeId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<CommentsPaginationResponse> {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Get total count
    const { count } = await this.supabase
      .from('route_comments')
      .select('*', { count: 'exact', head: true })
      .eq('route_id', routeId)

    // Get paginated comments with user data
    const { data, error } = await this.supabase
      .from('route_comments')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('route_id', routeId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching comments:', error)
      throw new Error('Falha ao carregar comentários')
    }

    const comments = (data || []).map((comment: any) => ({
      ...comment,
      user: {
        id: comment.profiles?.id || comment.user_id,
        name: comment.profiles?.full_name || null,
        avatar_url: comment.profiles?.avatar_url || null
      },
      profiles: undefined
    })) as unknown as RouteCommentWithUser[]
    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      comments,
      total,
      page,
      pageSize,
      totalPages
    }
  }

  /**
   * Get count of comments for a route
   */
  async getCommentsCount(routeId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('route_comments')
      .select('*', { count: 'exact', head: true })
      .eq('route_id', routeId)

    if (error) {
      console.error('Error counting comments:', error)
      return 0
    }

    return count || 0
  }

  /**
   * Get comments count for multiple routes
   */
  async getCommentsCountForRoutes(routeIds: string[]): Promise<Record<string, number>> {
    if (routeIds.length === 0) return {}

    const { data, error } = await this.supabase
      .from('route_comments')
      .select('route_id')
      .in('route_id', routeIds)

    if (error) {
      console.error('Error counting comments for routes:', error)
      return {}
    }

    // Count comments per route
    const counts: Record<string, number> = {}
    routeIds.forEach(id => {
      counts[id] = 0
    })

    data?.forEach((comment) => {
      counts[comment.route_id] = (counts[comment.route_id] || 0) + 1
    })

    return counts
  }

  /**
   * Create a new comment
   */
  async createComment(
    routeId: string,
    content: string,
    userId: string
  ): Promise<RouteCommentWithUser> {
    // Validate content length
    if (!content.trim()) {
      throw new Error('O comentário não pode estar vazio')
    }

    if (content.length > 500) {
      throw new Error('O comentário não pode ter mais de 500 caracteres')
    }

    const commentData: RouteCommentInsert = {
      route_id: routeId,
      user_id: userId,
      content: content.trim()
    }

    const { data, error } = await this.supabase
      .from('route_comments')
      .insert(commentData)
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      throw new Error('Falha ao criar comentário')
    }

    const comment = data as any
    return {
      ...comment,
      user: {
        id: comment.profiles?.id || comment.user_id,
        name: comment.profiles?.full_name || null,
        avatar_url: comment.profiles?.avatar_url || null
      },
      profiles: undefined
    } as unknown as RouteCommentWithUser
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    content: string,
    userId: string
  ): Promise<RouteCommentWithUser> {
    // Validate content length
    if (!content.trim()) {
      throw new Error('O comentário não pode estar vazio')
    }

    if (content.length > 500) {
      throw new Error('O comentário não pode ter mais de 500 caracteres')
    }

    // Check if user owns the comment
    const { data: existingComment, error: checkError } = await this.supabase
      .from('route_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (checkError || !existingComment) {
      throw new Error('Comentário não encontrado')
    }

    if (existingComment.user_id !== userId) {
      throw new Error('Você não tem permissão para editar este comentário')
    }

    const updateData: RouteCommentUpdate = {
      content: content.trim()
    }

    const { data, error } = await this.supabase
      .from('route_comments')
      .update(updateData)
      .eq('id', commentId)
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      throw new Error('Falha ao atualizar comentário')
    }

    const comment = data as any
    return {
      ...comment,
      user: {
        id: comment.profiles?.id || comment.user_id,
        name: comment.profiles?.full_name || null,
        avatar_url: comment.profiles?.avatar_url || null
      },
      profiles: undefined
    } as unknown as RouteCommentWithUser
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    // Check if user owns the comment or is admin
    if (!isAdmin) {
      const { data: existingComment, error: checkError } = await this.supabase
        .from('route_comments')
        .select('user_id')
        .eq('id', commentId)
        .single()

      if (checkError || !existingComment) {
        throw new Error('Comentário não encontrado')
      }

      if (existingComment.user_id !== userId) {
        throw new Error('Você não tem permissão para deletar este comentário')
      }
    }

    const { error } = await this.supabase
      .from('route_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      throw new Error('Falha ao deletar comentário')
    }
  }

  /**
   * Check if user can edit/delete a comment
   */
  async canModifyComment(commentId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    if (isAdmin) return true

    const { data, error } = await this.supabase
      .from('route_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (error || !data) return false

    return data.user_id === userId
  }
}

export const commentsService = new CommentsService()
