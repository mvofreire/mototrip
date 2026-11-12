'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GPXPoint } from '@/lib/gpx-parser'
import {
  anchorsFromLine,
  buildDraft,
  fetchRoutedSegment,
  nearestPointIndex,
  newId,
  reverseSegment,
  splitSegment,
  straightSegment,
  type Anchor,
  type BuilderStop,
  type LatLng,
  type RouteDraft,
  type RoutingError,
  type Segment,
} from '@/lib/routing/route-builder'

interface Snapshot {
  anchors: Anchor[]
  segments: Segment[]
  stops: BuilderStop[]
}

export type BuilderNotice = RoutingError | 'max_points'

const EMPTY: Snapshot = { anchors: [], segments: [], stops: [] }
const HISTORY_LIMIT = 50
export const MAX_ANCHORS = 50

interface Options {
  /** Edit mode: the stored route line, turned into anchors */
  initialLine?: GPXPoint[]
  initialDurationMin?: number
  /** New routes: localStorage key that keeps the drawing across reloads */
  storageKey?: string
}

/**
 * State of the map route builder: anchors placed by the rider, the road
 * segments between them, the recommended stops, and undo/redo.
 */
export function useRouteBuilder({ initialLine, initialDurationMin, storageKey }: Options = {}) {
  const [present, setPresent] = useState<Snapshot>(() =>
    initialLine && initialLine.length > 1
      ? { ...anchorsFromLine(initialLine, { durationMin: initialDurationMin }), stops: [] }
      : EMPTY,
  )
  const [past, setPast] = useState<Snapshot[]>([])
  const [future, setFuture] = useState<Snapshot[]>([])
  const [followRoads, setFollowRoads] = useState(true)
  const [busy, setBusy] = useState(false)
  /** Position being routed to, shown on the map while waiting */
  const [pending, setPending] = useState<LatLng | null>(null)
  const [notice, setNotice] = useState<BuilderNotice | null>(null)
  /** The rider changed something since the builder was opened */
  const [dirty, setDirty] = useState(false)
  const [hydrated, setHydrated] = useState(!storageKey)

  // Async operations read the latest state from refs
  const presentRef = useRef(present)
  presentRef.current = present
  const busyRef = useRef(false)
  const followRoadsRef = useRef(followRoads)
  followRoadsRef.current = followRoads

  // Restore the saved drawing (new routes)
  useEffect(() => {
    if (!storageKey) return
    try {
      const raw = window.localStorage.getItem(storageKey)
      const saved = raw ? (JSON.parse(raw) as Snapshot) : null
      if (
        saved &&
        Array.isArray(saved.anchors) &&
        Array.isArray(saved.segments) &&
        Array.isArray(saved.stops) &&
        saved.segments.length === Math.max(0, saved.anchors.length - 1)
      ) {
        setPresent(saved)
        if (saved.anchors.length || saved.stops.length) setDirty(true)
      }
    } catch {
      // Unreadable draft: start empty
    }
    setHydrated(true)
  }, [storageKey])

  useEffect(() => {
    if (!storageKey || !hydrated) return
    try {
      if (present.anchors.length === 0 && present.stops.length === 0) {
        window.localStorage.removeItem(storageKey)
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(present))
      }
    } catch {
      // Storage full or blocked: the drawing just isn't kept across reloads
    }
  }, [present, storageKey, hydrated])

  const commit = useCallback((next: Snapshot) => {
    // Read now: the updater below runs later, after the ref has moved on
    const previous = presentRef.current
    setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), previous])
    setFuture([])
    setPresent(next)
    presentRef.current = next
    setDirty(true)
  }, [])

  /** Segment between two positions; a straight line when roads are off or routing fails */
  const connect = useCallback(async (from: LatLng, to: LatLng): Promise<Segment> => {
    if (!followRoadsRef.current) return straightSegment(from, to)
    try {
      return await fetchRoutedSegment(from, to)
    } catch (e) {
      setNotice(
        e === 'no_route' || e === 'rate_limited' || e === 'unavailable' ? e : 'unavailable',
      )
      return straightSegment(from, to)
    }
  }, [])

  /** Runs one operation at a time; taps made while routing are ignored */
  const run = useCallback(async (target: LatLng | null, operation: () => Promise<void>) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setPending(target)
    setNotice(null)
    try {
      await operation()
    } finally {
      busyRef.current = false
      setBusy(false)
      setPending(null)
    }
  }, [])

  const end = (segment: Segment, which: 'first' | 'last'): LatLng => {
    const p = which === 'first' ? segment.points[0] : segment.points[segment.points.length - 1]
    return { lat: p.lat, lng: p.lng }
  }

  const addPoint = useCallback(
    (position: LatLng) =>
      run(position, async () => {
        const { anchors, segments, stops } = presentRef.current
        if (anchors.length >= MAX_ANCHORS) {
          setNotice('max_points')
          return
        }
        if (anchors.length === 0) {
          commit({ anchors: [{ id: newId(), ...position }], segments, stops })
          return
        }
        const last = anchors[anchors.length - 1]
        const segment = await connect(last, position)
        const nextAnchors = [...anchors, { id: newId(), ...end(segment, 'last') }]
        // The very first point snaps to the road once it has a segment
        if (anchors.length === 1) nextAnchors[0] = { ...anchors[0], ...end(segment, 'first') }
        commit({ anchors: nextAnchors, segments: [...segments, segment], stops })
      }),
    [commit, connect, run],
  )

  const moveAnchor = useCallback(
    (index: number, position: LatLng) =>
      run(position, async () => {
        const { anchors, segments, stops } = presentRef.current
        if (!anchors[index]) return
        const nextAnchors = [...anchors]
        const nextSegments = [...segments]
        let snapped: LatLng = position

        const [before, after] = await Promise.all([
          index > 0 ? connect(anchors[index - 1], position) : null,
          index < anchors.length - 1 ? connect(position, anchors[index + 1]) : null,
        ])
        if (before) {
          nextSegments[index - 1] = before
          snapped = end(before, 'last')
        }
        if (after) {
          nextSegments[index] = after
          if (!before) snapped = end(after, 'first')
        }
        nextAnchors[index] = { ...anchors[index], ...snapped }
        commit({ anchors: nextAnchors, segments: nextSegments, stops })
      }),
    [commit, connect, run],
  )

  const removeAnchor = useCallback(
    (index: number) =>
      run(null, async () => {
        const { anchors, segments, stops } = presentRef.current
        if (!anchors[index]) return
        const nextAnchors = anchors.filter((_, i) => i !== index)
        let nextSegments: Segment[]
        if (index === 0) {
          nextSegments = segments.slice(1)
        } else if (index === anchors.length - 1) {
          nextSegments = segments.slice(0, -1)
        } else {
          const bridge = await connect(anchors[index - 1], anchors[index + 1])
          nextSegments = [...segments.slice(0, index - 1), bridge, ...segments.slice(index + 1)]
        }
        commit({ anchors: nextAnchors, segments: nextSegments, stops })
      }),
    [commit, connect, run],
  )

  /** New anchor on an existing segment (tap on the line); the geometry is kept */
  const insertAnchor = useCallback(
    (segmentIndex: number, position: LatLng) => {
      if (busyRef.current) return
      const { anchors, segments, stops } = presentRef.current
      const segment = segments[segmentIndex]
      if (!segment) return
      if (anchors.length >= MAX_ANCHORS) {
        setNotice('max_points')
        return
      }
      const { first, second, anchor } = splitSegment(segment, position)
      commit({
        anchors: [
          ...anchors.slice(0, segmentIndex + 1),
          { id: newId(), ...anchor },
          ...anchors.slice(segmentIndex + 1),
        ],
        segments: [
          ...segments.slice(0, segmentIndex),
          first,
          second,
          ...segments.slice(segmentIndex + 1),
        ],
        stops,
      })
    },
    [commit],
  )

  /** Route back to the first point */
  const closeLoop = useCallback(() => {
    const { anchors } = presentRef.current
    if (anchors.length < 2) return
    return addPoint({ lat: anchors[0].lat, lng: anchors[0].lng })
  }, [addPoint])

  const reverse = useCallback(() => {
    if (busyRef.current) return
    const { anchors, segments, stops } = presentRef.current
    if (anchors.length < 2) return
    commit({
      anchors: [...anchors].reverse(),
      segments: [...segments].reverse().map(reverseSegment),
      stops,
    })
  }, [commit])

  const clear = useCallback(() => {
    if (busyRef.current) return
    const { anchors, stops } = presentRef.current
    if (anchors.length === 0 && stops.length === 0) return
    commit(EMPTY)
  }, [commit])

  const saveStop = useCallback(
    (stop: Omit<BuilderStop, 'id'> & { id?: string }) => {
      const current = presentRef.current
      const stops = stop.id
        ? current.stops.map((s) => (s.id === stop.id ? { ...s, ...stop, id: s.id } : s))
        : [...current.stops, { ...stop, id: newId() }]
      commit({ ...current, stops })
    },
    [commit],
  )

  const removeStop = useCallback(
    (id: string) => {
      const current = presentRef.current
      commit({ ...current, stops: current.stops.filter((s) => s.id !== id) })
    },
    [commit],
  )

  const undo = useCallback(() => {
    if (busyRef.current || past.length === 0) return
    const current = presentRef.current
    setFuture((f) => [current, ...f])
    setPresent(past[past.length - 1])
    setPast(past.slice(0, -1))
    setNotice(null)
  }, [past])

  const redo = useCallback(() => {
    if (busyRef.current || future.length === 0) return
    const current = presentRef.current
    setPast((p) => [...p, current])
    setPresent(future[0])
    setFuture(future.slice(1))
    setNotice(null)
  }, [future])

  /** Forget everything, including the saved drawing (after the route is submitted) */
  const reset = useCallback(() => {
    setPresent(EMPTY)
    setPast([])
    setFuture([])
    setDirty(false)
    setNotice(null)
  }, [])

  const draft: RouteDraft = useMemo(() => {
    const base = buildDraft(present.anchors, present.segments, present.stops)
    // Stops follow the direction of travel
    const stops =
      base.points.length > 1
        ? base.stops
            .map((stop) => ({ stop, order: nearestPointIndex(base.points, stop) }))
            .sort((a, b) => a.order - b.order)
            .map((s) => s.stop)
        : base.stops
    return { ...base, stops }
  }, [present])

  return {
    anchors: present.anchors,
    segments: present.segments,
    stops: present.stops,
    draft,
    followRoads,
    setFollowRoads,
    busy,
    pending,
    notice,
    dismissNotice: () => setNotice(null),
    dirty,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    addPoint,
    moveAnchor,
    removeAnchor,
    insertAnchor,
    closeLoop,
    reverse,
    clear,
    saveStop,
    removeStop,
    undo,
    redo,
    reset,
  }
}

export type RouteBuilderState = ReturnType<typeof useRouteBuilder>
