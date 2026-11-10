'use client'

/**
 * Markdown editor for blog posts (CodeMirror 6, only the modules we use).
 * Loaded with next/dynamic from the admin, so the public site never ships it.
 */

import { useEffect, useRef, type MutableRefObject } from 'react'
import { EditorState, type Extension } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  drawSelection,
  keymap,
  placeholder as placeholderExt,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

export interface MarkdownEditorHandle {
  /** Wraps the selection (or inserts a placeholder) with before/after */
  wrap(before: string, after: string, placeholder: string): void
  /** Adds a prefix (e.g. "## ", "- ") to every selected line */
  prefixLines(prefix: string): void
  /** Inserts a block on its own lines at the cursor */
  insertBlock(text: string): void
  focus(): void
}

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Filled with the toolbar commands once the editor is ready */
  editorRef?: MutableRefObject<MarkdownEditorHandle | null>
}

// ----------------------------------------------------------------- commands

function wrap(view: EditorView, before: string, after: string, placeholder: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to) || placeholder
  view.dispatch({
    changes: { from, to, insert: `${before}${selected}${after}` },
    selection: { anchor: from + before.length, head: from + before.length + selected.length },
    scrollIntoView: true,
  })
  view.focus()
}

function prefixLines(view: EditorView, prefix: string) {
  const { from, to } = view.state.selection.main
  const first = view.state.doc.lineAt(from).number
  const last = view.state.doc.lineAt(to).number
  const changes = []
  for (let n = first; n <= last; n++) {
    const line = view.state.doc.line(n)
    // Replace an existing heading/list marker instead of stacking them
    const marker = /^(#{1,6} |[-*] |\d+\. |> )/.exec(line.text)?.[0] ?? ''
    changes.push({ from: line.from, to: line.from + marker.length, insert: marker === prefix ? '' : prefix })
  }
  view.dispatch({ changes, scrollIntoView: true })
  view.focus()
}

function insertBlock(view: EditorView, text: string) {
  const line = view.state.doc.lineAt(view.state.selection.main.head)
  // On an empty line the block replaces it; otherwise it goes after the line.
  // Blank lines around it keep it a block of its own in Markdown.
  const empty = !line.text.trim()
  const from = empty ? line.from : line.to
  const insert = `${empty ? '' : '\n\n'}${text}\n\n`
  view.dispatch({
    changes: { from, to: empty ? line.to : from, insert },
    selection: { anchor: from + insert.length },
    scrollIntoView: true,
  })
  view.focus()
}

const shortcuts = keymap.of([
  { key: 'Mod-b', run: (v) => (wrap(v, '**', '**', 'texto'), true) },
  { key: 'Mod-i', run: (v) => (wrap(v, '_', '_', 'texto'), true) },
  { key: 'Mod-k', run: (v) => (wrap(v, '[', '](https://)', 'link'), true) },
])

// --------------------------------------------------- directive line styling

const directiveLine = Decoration.line({ class: 'cm-directive-line' })
const DIRECTIVE = /^\s*(::route\{.*\}|:::\w*)\s*$/

const directiveHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = this.build(view)
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = this.build(u.view)
    }
    build(view: EditorView) {
      const marks = []
      for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; ) {
          const line = view.state.doc.lineAt(pos)
          if (DIRECTIVE.test(line.text)) marks.push(directiveLine.range(line.from))
          pos = line.to + 1
        }
      }
      return Decoration.set(marks)
    }
  },
  { decorations: (v) => v.decorations },
)

// -------------------------------------------------------------------- theme

const highlight = HighlightStyle.define([
  { tag: tags.heading, fontWeight: '700', color: 'hsl(var(--foreground))' },
  { tag: tags.heading1, fontSize: '1.25em' },
  { tag: tags.heading2, fontSize: '1.15em' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.link, color: 'hsl(var(--primary))' },
  { tag: tags.url, color: 'hsl(var(--muted-foreground))' },
  { tag: [tags.processingInstruction, tags.meta, tags.list, tags.quote], color: 'hsl(var(--primary))' },
  { tag: tags.monospace, fontFamily: 'ui-monospace, monospace' },
])

const theme = EditorView.theme({
  '&': {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    fontSize: '14px',
    height: '100%',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: '1.65' },
  '.cm-content': { padding: '16px 0', caretColor: 'hsl(var(--primary))' },
  '.cm-line': { padding: '0 16px' },
  '.cm-cursor': { borderLeftColor: 'hsl(var(--primary))' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'hsl(var(--primary) / 0.2) !important',
  },
  '.cm-placeholder': { color: 'hsl(var(--muted-foreground))' },
  '.cm-directive-line': {
    backgroundColor: 'hsl(var(--primary) / 0.08)',
    borderLeft: '3px solid hsl(var(--primary))',
    color: 'hsl(var(--primary))',
    fontWeight: '600',
  },
})

// ------------------------------------------------------------------- editor

export function MarkdownEditor({ value, onChange, placeholder, editorRef }: MarkdownEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!host.current) return
    const extensions: Extension[] = [
      history(),
      drawSelection(),
      EditorView.lineWrapping,
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(highlight),
      directiveHighlighter,
      shortcuts,
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      theme,
      EditorView.updateListener.of((u) => {
        if (u.docChanged) onChangeRef.current(u.state.doc.toString())
      }),
    ]
    if (placeholder) extensions.push(placeholderExt(placeholder))
    view.current = new EditorView({ state: EditorState.create({ doc: value, extensions }), parent: host.current })
    return () => {
      view.current?.destroy()
      view.current = null
    }
    // Created once; later value changes are synced below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Value replaced from outside (e.g. reset after load)
  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    if (!editorRef) return
    editorRef.current = {
      wrap: (before, after, ph) => view.current && wrap(view.current, before, after, ph),
      prefixLines: (prefix) => view.current && prefixLines(view.current, prefix),
      insertBlock: (text) => view.current && insertBlock(view.current, text),
      focus: () => view.current?.focus(),
    }
    return () => {
      editorRef.current = null
    }
  }, [editorRef])

  return <div ref={host} className="h-full min-h-[420px] overflow-auto" />
}

export default MarkdownEditor
