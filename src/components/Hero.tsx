import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BASE, useEnv } from '../env'

const PointField = lazy(() => import('./PointField'))

const WORDS = ['Small', 'language', 'models', 'for', 'the', 'apps', 'you', 'already', 'use.']

/** CSS-only stand-in for reduced motion and no WebGL: a still field of dots and the finished thread. */
function StillField() {
  return <div className="still-field" aria-hidden="true" />
}

export default function Hero() {
  const env = useEnv()
  const ref = useRef<HTMLElement>(null)
  const scroll = useRef(0)
  const [active, setActive] = useState(true)
  const use3d = env.webgl && !env.reduced
  const anim = !env.reduced

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting && !document.hidden), { threshold: 0 })
    io.observe(el)
    const onScroll = () => {
      scroll.current = Math.min(1.5, window.scrollY / window.innerHeight)
    }
    const onVis = () => document.hidden && setActive(false)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <header className="hero" ref={ref}>
      <nav className="hero-nav" aria-label="Sections">
        <a href="#what">Small models</a>
        <a href="#calls">How it works</a>
        <a href="#family">Products</a>
        <a href="#get">Get it</a>
        <a href="#about">About</a>
        <a href="#licences">Licences</a>
      </nav>
      <div className="hero-stage" aria-hidden="true">
        {use3d ? (
          <Suspense fallback={<StillField />}>
            <PointField eventSource={ref} scrollRef={scroll} active={active} small={env.small} />
          </Suspense>
        ) : (
          <StillField />
        )}
      </div>
      <div className="hero-ui">
        <img className="hero-logo" src={`${BASE}brand/slm4apps-mark-dark.svg`} width={72} height={72} alt="slm4apps" />
        <p className="eyebrow">slm4apps</p>
        <h1>
          {WORDS.map((w, i) => (
            <motion.span
              key={w}
              className="word"
              initial={anim ? { opacity: 0, y: 24, filter: 'blur(8px)' } : false}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.28, ease: 'easeOut' }}
            >
              {w}{' '}
            </motion.span>
          ))}
          <br />
          <motion.span
            className="gold"
            initial={anim ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.4 }}
          >
            Open. Local. Yours.
          </motion.span>
        </h1>
        <svg className="headline-thread" viewBox="0 0 900 90" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M0 70 C 90 10, 160 90, 250 45 S 420 10, 520 50 S 700 85, 790 40 S 870 25, 900 30"
            fill="none"
            stroke="#FF5A1F"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={anim ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.6, delay: 0.3, ease: 'easeInOut' }}
          />
        </svg>
        <p className="lede">
          slm4apps builds small language models for the apps you already use. They run on your own computer, with no cloud and no account.
        </p>
        <div className="hero-actions">
          <a className="btn" href="https://slm4apps.github.io/maris3d/">Meet Maris3D</a>
          <a className="btn ghost" href="#get">Downloads</a>
          <a className="btn ghost" href="#what">What we do</a>
        </div>
      </div>
      <p className="hero-hint">{use3d ? 'Move the mouse: the field bends.' : ''}</p>
    </header>
  )
}
