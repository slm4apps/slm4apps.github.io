import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { motion, useScroll } from 'framer-motion'
import Hero from './components/Hero'
import { Sections } from './components/Sections'
import { useEnv } from './env'

/** The gold thread follows the page down the left edge. */
function ScrollThread() {
  const { scrollYProgress } = useScroll()
  return (
    <svg className="rail" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true">
      <path d="M20 0 C 38 120, 2 220, 20 340 S 38 560, 20 680 S 2 880, 20 1000" fill="none" stroke="rgba(242,181,68,.15)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <motion.path d="M20 0 C 38 120, 2 220, 20 340 S 38 560, 20 680 S 2 880, 20 1000" fill="none" stroke="#F2B544" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ pathLength: scrollYProgress }} />
    </svg>
  )
}

const THEMES: [string, string, string][] = [['ink', 'Ink', '#15130F'], ['paper', 'Paper', '#F6F1E7'], ['signal', 'Signal', '#FF5A1F'], ['sand', 'Sand', '#D9D0BD']]

function Themes() {
  const [t, setT] = useState(() => { try { const v = localStorage.getItem('theme') || ''; return ['ink', 'paper', 'signal', 'sand'].includes(v) ? v : '' } catch { return '' } })
  useEffect(() => { if (t) document.documentElement.dataset.theme = t }, [t])
  return (
    <div className="themes" role="group" aria-label="Colour theme"><span className="themes-label">Theme</span>
      {THEMES.map(([k, n, c]) => (
        <button key={k} style={{ background: c }} aria-label={n} title={n} aria-pressed={t === k} onClick={() => { setT(k); try { localStorage.setItem('theme', k) } catch { /* ignore */ } }} />
      ))}
    </div>
  )
}

export default function App() {
  const env = useEnv()
  useEffect(() => {
    if (env.reduced) return
    const lenis = new Lenis({ lerp: 0.1 })
    let id = 0
    const raf = (t: number) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [env.reduced])

  return (
    <>
      <a className="skip" href="#story">Skip to the story</a>
      {!env.reduced && <ScrollThread />}
      <Themes />
      <Hero />
      <Sections />
    </>
  )
}
