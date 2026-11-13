/**
 * Blog post body: Markdown (GFM) plus two directives.
 *
 *   ::route{slug="nacional-2-chaves-faro"}   → route card, on its own line
 *
 *   :::tip
 *   Text of the tip box
 *   :::
 *
 * Used by the public post page and by the admin preview, so the preview is
 * exactly what goes live. Raw HTML in the Markdown is not rendered.
 */

import type { ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import { visit, SKIP } from 'unist-util-visit'
import { Lightbulb } from 'lucide-react'
import { BlogRouteCard } from '@/components/features/blog/blog-route-card'
import type { RouteWithDetails } from '@/types'

const ROUTE_DIRECTIVE = /::route\{[^}]*?slug=["']([^"']+)["'][^}]*\}/g

/** Route slugs a body links to, in order (duplicates removed) */
export function routeSlugsIn(markdown: string): string[] {
  return Array.from(new Set(Array.from(markdown.matchAll(ROUTE_DIRECTIVE), (m) => m[1])))
}

/** The directive inserted by the editor's "Insert route" button */
export function routeDirective(slug: string) {
  return `::route{slug="${slug}"}`
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function textOf(node: any): string {
  if (node.type === 'text') return node.value
  return (node.children ?? []).map(textOf).join('')
}

/**
 * Turns the known directives into elements the components below render, and
 * puts anything else back as plain text, so "Nota:texto" or "10:30h" in a
 * paragraph are not swallowed as directives.
 */
function remarkBlogDirectives() {
  return (tree: any) => {
    visit(tree, (node: any, index, parent: any) => {
      if (node.type === 'leafDirective' && node.name === 'route') {
        node.data = { hName: 'route-card', hProperties: { slug: node.attributes?.slug ?? '' } }
        return
      }
      if (node.type === 'containerDirective' && node.name === 'tip') {
        node.data = { hName: 'blog-tip' }
        return
      }
      if (
        parent &&
        typeof index === 'number' &&
        (node.type === 'textDirective' || node.type === 'leafDirective' || node.type === 'containerDirective')
      ) {
        const label = textOf(node)
        const prefix = node.type === 'textDirective' ? ':' : node.type === 'leafDirective' ? '::' : ':::'
        const text = { type: 'text', value: `${prefix}${node.name}${label ? `[${label}]` : ''}` }
        parent.children[index] =
          node.type === 'textDirective' ? text : { type: 'paragraph', children: [text] }
        return [SKIP, index]
      }
    })
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface BlogMarkdownProps {
  markdown: string
  locale: string
  /** Routes the body links to, by slug */
  routes: Map<string, RouteWithDetails>
  /** What to show for a slug that is not in `routes` (the site shows nothing) */
  renderMissingRoute?: (slug: string) => ReactNode
  /** Slug of the post being rendered (for click analytics) */
  postSlug?: string
}

export function BlogMarkdown({ markdown, locale, routes, renderMissingRoute, postSlug }: BlogMarkdownProps) {
  const components = {
    // One h1 per page (the post title), so headings in the body start at h2
    h1: ({ children }) => <h2 className="pt-4 text-2xl font-bold md:text-3xl">{children}</h2>,
    h2: ({ children }) => <h2 className="pt-4 text-2xl font-bold md:text-3xl">{children}</h2>,
    h3: ({ children }) => <h3 className="pt-2 text-xl font-semibold">{children}</h3>,
    h4: ({ children }) => <h4 className="font-semibold">{children}</h4>,
    ul: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
    a: ({ href, children }) => {
      const external = !!href && /^https?:\/\//.test(href)
      return (
        <a
          href={href}
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground">{children}</blockquote>
    ),
    code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">{children}</code>,
    pre: ({ children }) => <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm [&_code]:bg-transparent [&_code]:p-0">{children}</pre>,
    hr: () => <hr className="my-8 border-border" />,
    // eslint-disable-next-line @next/next/no-img-element
    img: ({ src, alt }) => <img src={src} alt={alt ?? ''} loading="lazy" className="w-full rounded-lg border" />,
    table: ({ children }) => (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b p-2 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b p-2">{children}</td>,
    'blog-tip': ({ children }: { children?: ReactNode }) => (
      <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30 [&_p]:m-0">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="space-y-2">{children}</div>
      </div>
    ),
    'route-card': ({ slug }: { slug?: string }) => {
      const route = slug ? routes.get(slug) : undefined
      if (!route) return slug && renderMissingRoute ? <>{renderMissingRoute(slug)}</> : null
      return (
        <div className="mx-auto max-w-md">
          <BlogRouteCard route={route} locale={locale} postSlug={postSlug} />
        </div>
      )
    },
  } as Components

  return (
    <div className="space-y-6 text-[1.05rem] leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkDirective, remarkBlogDirectives]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
