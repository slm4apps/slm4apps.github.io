import { useEffect } from 'react'
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
      <Hero />
      <Sections />
    </>
  )
}
