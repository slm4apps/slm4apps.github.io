import { useEffect, useState } from 'react'

export const BASE = import.meta.env.BASE_URL

export function useEnv() {
  const [env] = useState(() => {
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    let webgl = false
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      webgl = false
    }
    return { reduced, webgl, small: window.innerWidth < 700 }
  })
  return env
}

export type Call = { tool: string; part: string; t_ms: number; corrected: boolean }
export type Example = { kind: string; sentence: string; call: Call }

/** Real recorded examples, written by tools/make_calls.py from the christmas-street run. */
export function useExamples(): Example[] | null {
  const [ex, setEx] = useState<Example[] | null>(null)
  useEffect(() => {
    let live = true
    fetch(`${BASE}replay/calls.json`)
      .then((r) => r.json())
      .then((j) => live && setEx(j.examples))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])
  return ex
}
