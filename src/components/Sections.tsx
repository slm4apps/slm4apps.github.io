import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { BASE, useExamples, type Example } from '../env'

const REPO = 'https://github.com/slm4apps/maris3d'
const RELEASE = `${REPO}/blob/main/docs/release-v0.1.md`
const LICENSING = `${REPO}/blob/main/docs/LICENSING.md`
const HF_MODEL = 'https://huggingface.co/slm4apps/Maris3D-Blender'
const HF_ORG = 'https://huggingface.co/slm4apps'
const GH_ORG = 'https://github.com/slm4apps'
const MARIS3D = 'https://slm4apps.github.io/maris3d/'
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

function Section({ id, n, title, children }: { id?: string; n: string; title: string; children: ReactNode }) {
  return (
    <section className="sec" id={id}>
      <Reveal>
        <p className="eyebrow">{n}</p>
        <h2>{title}</h2>
      </Reveal>
      {children}
    </section>
  )
}

/* ---------- three flip cards ---------- */

function WifiOff() {
  return (
    <svg viewBox="0 0 64 48" width="72" height="54" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M6 18 Q32 -2 58 18" /><path d="M16 28 Q32 15 48 28" /><circle cx="32" cy="38" r="2.5" fill="currentColor" />
      <path d="M8 44 L56 4" stroke="#FF5A1F" />
    </svg>
  )
}

function MiniCall() {
  const text = '{"tool":"add_primitive"}'
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref)
  const [n, setN] = useState(text.length)
  useEffect(() => {
    if (!inView || reduced()) return
    setN(0)
    const id = setInterval(() => setN((v) => (v >= text.length + 12 ? 0 : v + 1)), 90)
    return () => clearInterval(id)
  }, [inView])
  return <span ref={ref} className="minicall">{text.slice(0, n)}<i className="caret" /></span>
}

const CARDS = [
  {
    key: 'Small',
    front: 'Small',
    tag: 'Half a billion parameters.',
    back: (
      <>
        <div className="sizebar"><i /></div>
        <p>The first model has 0.5 billion parameters. Its main file is 531 MB and it needs about 0.58 GB of memory to run.</p>
      </>
    ),
  },
  {
    key: 'Local',
    front: 'Local',
    tag: 'Offline. No account.',
    back: (
      <>
        <div className="icon"><WifiOff /></div>
        <p>It runs on an 8 GB laptop with no network, no account and no API key. On an 8 GB Mac an answer takes about 0.6 seconds and a cold load 1.3 seconds. Your prompts and your files stay on your machine.</p>
      </>
    ),
  },
  {
    key: 'Tools',
    front: 'Tools, not text',
    tag: 'It answers with calls.',
    back: (
      <>
        <div className="icon"><MiniCall /></div>
        <p>It was trained on a fixed set of 26 tools. It returns a tool call; the host runs it in the app and tells the model what happened.</p>
      </>
    ),
  },
]

function Flip({ c }: { c: (typeof CARDS)[number] }) {
  const [on, setOn] = useState(false)
  return (
    <button className={on ? 'flip on' : 'flip'} aria-pressed={on} onClick={() => setOn((v) => !v)} aria-label={`${c.front}: ${c.tag} Press to turn the card.`}>
      <span className="face front">
        <b>{c.front}</b>
        <span>{c.tag}</span>
        <em>tap to turn</em>
      </span>
      <span className="face back">{c.back}</span>
    </button>
  )
}

function WhatWeDo() {
  return (
    <Section id="what" n="01 / small local models" title="Small, local, and built for tools.">
      <Reveal>
        <div className="prose muted">
          <p>
            Most assistants are large models in someone else&apos;s data centre. We go the other way. Pick one app, teach a small
            model that app&apos;s tools, and let it run on the machine you already own.
          </p>
          <p>
            The model does not write essays. It answers with a tool call, the host program runs the call inside the app, a check
            reads the result back, and the model is told what happened. The work that needs exact numbers is done by code, not by the model.
          </p>
        </div>
      </Reveal>
      <div className="flips">
        {CARDS.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.12}>
            <Flip c={c} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ---------- sentence to tool call ---------- */

function Glyph({ kind, flash }: { kind: string; flash: number }) {
  const common = { fill: 'rgba(255,90,31,.15)', stroke: '#FF5A1F', strokeWidth: 2.5 }
  const shape =
    kind === 'cylinder' ? (
      <><ellipse cx="60" cy="30" rx="30" ry="10" {...common} /><path d="M30 30 V70 A30 10 0 0 0 90 70 V30" {...common} /></>
    ) : kind === 'torus' ? (
      <><ellipse cx="60" cy="50" rx="36" ry="22" {...common} /><ellipse cx="60" cy="50" rx="14" ry="7" {...common} /></>
    ) : kind === 'cube' ? (
      <><path d="M30 38 L60 22 L90 38 L60 54 Z" {...common} /><path d="M30 38 V72 L60 88 V54 M90 38 V72 L60 88" {...common} /></>
    ) : kind === 'sphere' ? (
      <><circle cx="60" cy="50" r="32" {...common} /><ellipse cx="60" cy="50" rx="32" ry="10" {...common} /></>
    ) : (
      <path d="M60 14 L92 82 H28 Z" {...common} />
    )
  return (
    <motion.svg key={flash} viewBox="0 0 120 100" className="glyph" aria-hidden="true" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
      {shape}
    </motion.svg>
  )
}

function SentenceToCall() {
  const examples = useExamples()
  const [sel, setSel] = useState(0)
  const [typed, setTyped] = useState(Infinity)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })
  const ex: Example | undefined = examples?.[sel]
  const json = ex ? JSON.stringify({ tool: ex.call.tool, part: ex.call.part, t_ms: ex.call.t_ms, corrected_by_check: ex.call.corrected }) : ''
  const total = ex ? ex.sentence.length + 8 + json.length : 0

  useEffect(() => {
    if (!ex || !inView || reduced()) return
    setTyped(0)
    const id = setInterval(() => setTyped((v) => (v >= total + 6 ? (clearInterval(id), v) : v + 2)), 22)
    return () => clearInterval(id)
  }, [ex, inView, sel, total])

  const s = ex ? ex.sentence.slice(0, typed) : ''
  const done = ex ? typed >= ex.sentence.length : false
  const j = ex ? json.slice(0, Math.max(0, typed - ex.sentence.length - 8)) : ''
  const finished = ex ? typed >= total : false

  return (
    <Section id="calls" n="02 / how it works" title="A sentence goes in. A tool call comes out.">
      <Reveal>
        <p className="muted">
          These are real sentences from our recorded Christmas street build, each with the tool call the model made for it.
          The call fields are copied from the recording, not written for this page.
        </p>
      </Reveal>
      <div ref={ref} className="calls">
        <div className="picker" role="tablist" aria-label="Pick a recorded example">
          {(examples ?? []).map((e, i) => (
            <button key={e.kind} role="tab" aria-selected={i === sel} className={i === sel ? 'chip on' : 'chip'} onClick={() => setSel(i)}>
              {e.kind}
            </button>
          ))}
        </div>
        {ex && (
          <div className="demo">
            <div className="pane">
              <h3>You type</h3>
              <p className="said">{s}{!done && <i className="caret" />}</p>
            </div>
            <div className="pane">
              <h3>The model returns</h3>
              <pre className="json">{done ? j : ''}{done && !finished && <i className="caret" />}</pre>
              <p className="small">Recorded fields only: the tool and the part name.</p>
            </div>
            <div className="pane view">
              <h3>The app reacts</h3>
              {finished ? <Glyph kind={ex.kind} flash={sel} /> : <div className="glyph" />}
              <p className="small">{finished ? `${ex.call.tool}: ${ex.call.part} added (drawing is a sketch of the shape).` : ' '}</p>
            </div>
          </div>
        )}
        {/* no-JS-animation readers get the whole thing as text */}
        {ex && <p className="sr">{ex.sentence} Tool call: {json}</p>}
      </div>
    </Section>
  )
}

/* ---------- family ---------- */

function TiltCard() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [9, -9]), { stiffness: 200, damping: 18 })
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 18 })
  return (
    <motion.a
      className="model-card live"
      href={MARIS3D}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left) / r.width - 0.5)
        y.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      <img src={`${BASE}brand/maris3d-icon.svg`} width={64} height={64} alt="" />
      <span className="status">Live</span>
      <b>Maris3D, SLM for Blender</b>
      <span>A 0.5B model and a copilot add-on that build and edit Blender scenes by calling Blender tools. Offline.</span>
      <em>Open the Maris3D site</em>
    </motion.a>
  )
}

function Family() {
  return (
    <Section id="family" n="03 / products" title="One model per app. The first is on the shelf.">
      <div className="shelf">
        <Reveal><TiltCard /></Reveal>
        {[0, 1, 2].map((i) => (
          <Reveal key={i} delay={0.1 * (i + 1)}>
            <div className="model-card empty" aria-label="An empty slot for the next model">
              <span className="status">Next</span>
              <b>Not yet named</b>
              <span>Empty on purpose. A slot opens only when a model passes its own tests.</span>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="small">Independent community project. Blender is a trademark of the Blender Foundation; we are not affiliated with it.</p>
      </Reveal>
    </Section>
  )
}

/* ---------- how we build ---------- */

const STEPS = [
  { h: 'Start from a small base', t: 'Qwen2.5-Coder-0.5B-Instruct, an open model from the Qwen team, used as the starting point.' },
  { h: 'Teach it one app\'s tools', t: 'Small adapters are trained on top of the base so it learns the tools of one app and nothing else.' },
  { h: 'Let code do the exact work', t: 'The model plans in words. Code computes positions and sizes and makes each part, so the numbers are exact.' },
  { h: 'Check the result in the app', t: 'Every call runs in the real app, and a check reads the finished scene back and corrects it.' },
  { h: 'Report it plainly', t: 'Results, limits and failures are written in the release notes, with how each was measured.' },
]

function Timeline() {
  return (
    <Section id="build" n="04 / how we build" title="From a small base to a working copilot.">
      <ol className="timeline">
        {STEPS.map((s, i) => (
          <motion.li key={s.h} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay: 0.05 }}>
            <span className="dot">{i + 1}</span>
            <h3>{s.h}</h3>
            <p>{s.t}</p>
          </motion.li>
        ))}
      </ol>
      <p className="small">Details, limits and how each step was measured are in the <a href={RELEASE}>v0.1 release notes</a>.</p>
    </Section>
  )
}

function Downloads() {
  return (
    <Section id="get" n="05 / get it" title="Downloads and code.">
      <div className="cols">
        <Reveal>
          <div className="box">
            <h3>Maris3D model</h3>
            <p>The GGUF model file on Hugging Face.</p>
            <div className="links">
              <a className="btn" href={HF_MODEL}>Model on Hugging Face</a>
              <a className="btn ghost" href={HF_ORG}>slm4apps on Hugging Face</a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="box">
            <h3>Code, add-on and docs</h3>
            <p>Install with the command line tool from the repository:</p>
            <pre className="cmd">{`git clone ${REPO} && cd maris3d
pip install -e .
maris3d install`}</pre>
            <div className="links">
              <a className="btn" href={REPO}>Maris3D on GitHub</a>
              <a className="btn ghost" href={GH_ORG}>slm4apps on GitHub</a>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

function About() {
  return (
    <Section id="about" n="06 / about" title="About slm4apps.">
      <Reveal>
        <div className="prose muted">
          <p>
            slm4apps is an independent open project that builds small language models for the tools of real apps.
            The aim is useful software that is private, free to run and small enough for the computer you already have.
          </p>
          <p>
            Models and documentation are published openly. Training is done on home hardware and the results are given away.
            Questions and ideas are welcome as issues on <a href={REPO}>GitHub</a>.
          </p>
        </div>
      </Reveal>
    </Section>
  )
}

function Licences() {
  return (
    <Section id="licences" n="07 / licences" title="Licences.">
      <Reveal>
        <div className="table-wrap">
          <table className="lic">
            <thead><tr><th scope="col">What</th><th scope="col">Licence</th></tr></thead>
            <tbody>
              <tr><td>Code, documentation and model weights</td><td>Apache-2.0</td></tr>
              <tr><td>Files that run inside Blender (the add-on)</td><td>GPL-3.0-or-later, like Blender</td></tr>
              <tr><td>Base model Qwen2.5-Coder-0.5B-Instruct (Alibaba Cloud / Qwen team)</td><td>Apache-2.0</td></tr>
            </tbody>
          </table>
        </div>
        <p className="small">Full terms in <a href={LICENSING}>docs/LICENSING.md</a>. Blender is a trademark of the Blender Foundation; &quot;Qwen&quot; is a trademark of Alibaba Cloud.</p>
      </Reveal>
    </Section>
  )
}

function Footer() {
  return (
    <footer className="foot">
      <p className="foot-links">
        <a href="https://github.com/slm4apps">GitHub</a>
        <a href="https://huggingface.co/slm4apps">Hugging Face</a>
        <a href={MARIS3D}>Maris3D</a>
        <a href={`${REPO}/issues`}>Issues and questions</a>
      </p>
      <p>Models and docs are Apache-2.0. The Blender add-on is GPL-3.0-or-later. See <a href="#licences">Licences</a>.</p>
      <p>Blender is a trademark of the Blender Foundation. slm4apps and Maris3D are not affiliated with or endorsed by it.</p>
      <p className="small">This page uses no trackers, no cookies and no outside servers.</p>
    </footer>
  )
}

export function Sections() {
  return (
    <main id="story">
      <WhatWeDo />
      <SentenceToCall />
      <Family />
      <Timeline />
      <Downloads />
      <About />
      <Licences />
      <Footer />
    </main>
  )
}
