import { useEffect, useState } from 'react'

// Site configuration — mirrors the design prototype's editable props.
const CITY = 'LAS VEGAS'
const FILM_GRAIN = true
const STICKY_BAR = true

function Bolt({ width = 14, height = 18, fill = 'var(--amber)', className }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} className={className} aria-hidden="true">
      <polygon points="13,2 4,13.5 11,13.5 9.5,22 20,9 12.5,9" fill={fill} />
    </svg>
  )
}

const DRINKS = [
  { img: '/img/berry-thai.jpeg', name: 'Berry Thai', desc: 'Thai basil · jasmine green tea · strawberry', price: '$6', badge: 'Green tea' },
  { img: '/img/cinna-mom.jpeg', name: 'Cinna-Mom', desc: 'Double-shot espresso · cardamom · cinnamon', price: '$7' },
  { img: '/img/miso-sweet.jpeg', name: 'Miso Sweet', desc: 'Espresso · miso brown sugar · caramel', price: '$7' },
  { img: '/img/rosemarys-baby.jpeg', name: "Rosemary's Baby", desc: 'Rosemary syrup · Moroccan mint tea', price: '$6' },
]

export default function App() {
  const [submitted, setSubmitted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const scrollToForm = () => {
    const el = document.getElementById('waitlist')
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 12, behavior: 'smooth' })
      setTimeout(() => document.getElementById('wl-email')?.focus(), 520)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const val = document.getElementById('wl-email')?.value || ''
    if (val.includes('@')) setSubmitted(true)
  }

  const showSticky = STICKY_BAR && isMobile && !submitted

  return (
    <div className="page">
      {FILM_GRAIN && <div className="grain" />}
      <div className="vignette" />

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero-top">
          <div className="hero-brand">
            <img src="/img/logo.png" alt="Double Shot Electric" />
            <span>{CITY} · EST. 2024</span>
          </div>
          <button type="button" className="btn-ghost" onClick={scrollToForm}>Get on the list</button>
        </div>

        <div className="hero-body">
          <div className="hero-copy">
            <div className="eyebrow">Delivery-first functional coffee</div>
            <h1 className="display">Energy without the jitters.<br />Focus without the crash.</h1>
            <div className="hero-tags">
              <Bolt />
              <span>Smooth · Clean · Powerful</span>
              <Bolt />
            </div>
            <p>
              Adaptogenic coffee and tea, built for the grind. Real Lion's Mane and Cordyceps,
              lab-tested. Delivered cold and fast across {CITY} — no sugar bombs, no 2 p.m. crash.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn-primary" onClick={scrollToForm}>
                <Bolt width={17} height={22} fill="var(--char)" />
                Get on the list
              </button>
              <small>First 500 get launch-day perks + a free upsize for life.</small>
            </div>
          </div>

          <div className="hero-visual">
            <img src="/img/hero-barista.png" alt="Double Shot Electric barista holding an iced fuel coffee" />
          </div>
        </div>
      </section>

      {/* ============ PROOF BAR ============ */}
      <div className="proof-bar">
        <span>Ceremonial Uji Matcha</span>
        <Bolt width={13} height={17} />
        <span>Lab-tested Lion's Mane</span>
        <Bolt width={13} height={17} />
        <span>Zero Crash</span>
      </div>

      {/* ============ THE WAKE-UP CALL ============ */}
      <section className="flex-section">
        <div className="flex-inner">
          <div className="flex-head">
            <div className="eyebrow">The wake-up call</div>
            <h2 className="display">Your chain latte: 60g of sugar and zero brain benefits.</h2>
          </div>
          <div className="compare-grid">
            <div className="compare-card">
              <div className="compare-card-title">The usual</div>
              <div className="compare-list">
                <div className="compare-row"><span className="dash">—</span>60g+ of sugar, hidden in the syrup</div>
                <div className="compare-row"><span className="dash">—</span>Mystery flavor bases, zero function</div>
                <div className="compare-row"><span className="dash">—</span>A spike, then the 2 p.m. crash</div>
                <div className="compare-row"><span className="dash">—</span>A line, a wait, a parking lot</div>
              </div>
            </div>
            <div className="compare-card compare-card--dse">
              <div className="compare-card-head">
                <Bolt width={15} height={19} />
                <div className="compare-card-title">Double Shot Electric</div>
              </div>
              <div className="compare-list">
                <div className="compare-row"><Bolt width={11} height={14} className="bolt-inline" />Real adaptogens — Lion's Mane + Cordyceps</div>
                <div className="compare-row"><Bolt width={11} height={14} className="bolt-inline" />Clean, all-day energy — zero crash</div>
                <div className="compare-row"><Bolt width={11} height={14} className="bolt-inline" />Lab-tested, handcrafted, real ingredients</div>
                <div className="compare-row"><Bolt width={11} height={14} className="bolt-inline" />Pre-order, pull up, get fueled</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ THE LINEUP ============ */}
      <section className="lineup">
        <div className="lineup-inner">
          <div className="lineup-head">
            <div className="eyebrow">The lineup</div>
            <h2 className="display">Four drinks. Pick your fuel.</h2>
          </div>
          <div className="lineup-grid">
            {DRINKS.map((d) => (
              <div className="drink-card" key={d.name}>
                <div className="drink-photo">
                  <img src={d.img} alt={d.name} />
                </div>
                <div className="drink-meta">
                  <div className="drink-meta-row">
                    <span>{d.desc}</span>
                    <span className="drink-price">{d.price}</span>
                  </div>
                  {d.badge && <span className="drink-badge">{d.badge}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WAITLIST ============ */}
      <section id="waitlist" className="waitlist">
        <div className="waitlist-inner">
          <div className="eyebrow">Pre-launch drop · {CITY}</div>
          <h2 className="display">Get on the list</h2>
          <p className="waitlist-lede">
            We're launching delivery-first across {CITY}. The first 500 on the list get launch-day
            perks, early menu access, and a free upsize for life.
          </p>

          {!submitted ? (
            <form className="waitlist-form" onSubmit={onSubmit}>
              <input id="wl-email" type="email" required placeholder="you@email.com" />
              <input id="wl-zip" type="text" inputMode="numeric" placeholder="ZIP code" />
              <button type="submit" className="btn-primary">
                <Bolt width={17} height={22} fill="var(--char)" />
                Get on the list
              </button>
              <small>No spam, ever. We'll only message you when we pull up in your zip.</small>
            </form>
          ) : (
            <div className="waitlist-success">
              <Bolt width={30} height={38} />
              <div className="waitlist-success-title">You're on the list.</div>
              <p>Your launch-day perks are locked in. Watch your inbox — we pull up soon.</p>
            </div>
          )}

          <div className="marker-note">Built different. Made to fuel you.</div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-row">
            <div className="footer-brand">
              <img src="/img/logo.png" alt="Double Shot Electric" />
              <span>Double Shot Electric</span>
            </div>
            <div className="footer-tag">
              <span className="footer-slogan">Pre-order. Pull up. Get fueled.</span>
              <span className="footer-handle">@doubleshotelectric</span>
            </div>
          </div>
          <div className="footer-legal">© 2026 Double Shot Electric — Coffee · Fuel · Focus. {CITY}, NV.</div>
        </div>
      </footer>

      {/* ============ STICKY MOBILE CTA ============ */}
      {showSticky && (
        <div className="sticky-cta">
          <div className="sticky-cta-label">First 500<br />get perks</div>
          <button type="button" onClick={scrollToForm}>
            <Bolt width={15} height={19} />
            Pre-order now
          </button>
        </div>
      )}
    </div>
  )
}
