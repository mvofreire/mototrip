import { BlogPostEditor } from '@/components/admin/blog-post-editor'

/** /profile/admin/blog/new creates a post; /profile/admin/blog/<id> edits one */
export default function AdminBlogPostPage({ params }: { params: { id: string } }) {
  return <BlogPostEditor key={params.id} postId={params.id === 'new' ? null : params.id} />
}
