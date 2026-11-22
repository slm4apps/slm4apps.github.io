// Shared "Help build it" section. Source of truth lives in slm4apps-org/shared/contribute;
// shared/sync.sh copies it into each site (org, Maris3D, Terraville). Edit here, then run the sync.
import './contribute.css'

export type ContributeItem = { h: string; t: string; cta: string; href: string }

export function Contribute({ id = 'contribute', n, title = 'Help build it', intro, items }: {
  id?: string
  n?: string
  title?: string
  intro?: string
  items: ContributeItem[]
}) {
  return (
    <section className="sec contribute" id={id} aria-labelledby={`${id}-h`}>
      {n && <p className="eyebrow">{n}</p>}
      <h2 id={`${id}-h`}>{title}</h2>
      {intro && <p className="contribute-intro">{intro}</p>}
      <ul className="contribute-grid">
        {items.map((it) => (
          <li key={it.h} className="contribute-card">
            <h3>{it.h}</h3>
            <p>{it.t}</p>
            <a href={it.href}>{it.cta} <span aria-hidden="true">&rarr;</span></a>
          </li>
        ))}
      </ul>
    </section>
  )
}
