import React, { useEffect, useRef, useState, useCallback } from 'react';
import './LandingPage.css';

/* ─────────────────────────────────────────
   INLINE SVG ICONS (geometric, no emoji)
───────────────────────────────────────── */
const IconTfIdf = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="10" width="2.5" height="6" rx="1" fill="currentColor" opacity="0.35"/>
    <rect x="5" y="6.5" width="2.5" height="9.5" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="9" y="3" width="2.5" height="13" rx="1" fill="currentColor"/>
    <rect x="13" y="5" width="2.5" height="11" rx="1" fill="currentColor" opacity="0.75"/>
    <path d="M1.5 6 Q5 3.5 9 5.5 Q13 8 16.5 3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
  </svg>
);
const IconSkillGap = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" opacity="0.25"/>
    <circle cx="9" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.4" opacity="0.55"/>
    <circle cx="9" cy="9" r="1.8" fill="currentColor"/>
    <path d="M9 2 L9 4 M9 14 L9 16 M2 9 L4 9 M14 9 L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45"/>
  </svg>
);
const IconWhatIf = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 9 L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M7 9 L11 5.5 L16 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 9 L11 12.5 L16 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="5.5" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="12.5" r="1.5" fill="currentColor"/>
    <circle cx="2" cy="9" r="1.5" fill="currentColor"/>
  </svg>
);
const IconFilter = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2.5 4.5 L15.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M5 9 L13 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M7.5 13.5 L10.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconScore = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" opacity="0.3"/>
    <path d="M9 1.5 A7.5 7.5 0 0 1 16.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M9 1.5 L9 9 L14.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDecide = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="3.5" width="6" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" opacity="0.45"/>
    <rect x="10.5" y="3.5" width="6" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M13.5 7 L13.5 11 M12 9 L15 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M4.5 7.5 L4.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.45"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7 L12 7 M8.5 3.5 L12 7 L8.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2 L7 12 M3.5 8.5 L7 12 L10.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5 L6 7.5 L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPlus = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M5 2 L5 8 M2 5 L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconInfo = () => (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
    <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 3 L5 5.5 M5 6.8 L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const FEATURES = [
  { Icon: IconTfIdf,    accent: 'v', title: 'TF-IDF Matching',     desc: 'Keyword-weighted cosine similarity across 55+ curated projects finds precise semantic matches in milliseconds.' },
  { Icon: IconSkillGap, accent: 'c', title: 'Skill Gap Detection',  desc: 'Pinpoints exactly which skills you need to start each project. No guesswork — just a clear, actionable path forward.' },
  { Icon: IconWhatIf,   accent: 'v', title: 'What-If Mode',         desc: 'Simulate adding skills you don\'t have yet. Unlock hidden project matches before committing to learning anything.' },
  { Icon: IconFilter,   accent: 'c', title: 'Difficulty Filtering', desc: 'Strict beginner-to-advanced filtering so you only see projects calibrated precisely to your current level.' },
  { Icon: IconScore,    accent: 'v', title: 'Hybrid Scoring',       desc: '70% semantic similarity + 30% popularity weighting delivers balanced results that are both relevant and battle-tested.' },
  { Icon: IconDecide,   accent: 'c', title: 'Decide Mode',          desc: 'Side-by-side top-3 comparison view strips the noise. Pick one, commit, and start building — without the paralysis.' },
];

const STEPS = [
  { num: '01', title: 'Enter Your Stack',       desc: 'Input your skills, interests, and experience level. The engine maps your developer profile against a curated project corpus.' },
  { num: '02', title: 'Run the Engine',          desc: 'TF-IDF vectorization + cosine similarity scores every project instantly. Hybrid scoring surfaces the best matches for you specifically.' },
  { num: '03', title: 'Build with Confidence',  desc: 'See ranked matches, skill gaps, and difficulty ratings. Use Decide Mode to commit to exactly one project and start shipping.' },
];

const DEMO_RESULTS = [
  { name: 'Real-Time Chat App',        match: 87, tags: ['React', 'FastAPI', 'WebSocket'], gap: 'Redis',    level: 'Intermediate', accent: 'v' },
  { name: 'ML Recommendation API',     match: 81, tags: ['Python', 'FastAPI', 'scikit-learn'], gap: null,   level: 'Intermediate', accent: 'c' },
  { name: 'Dev Portfolio Generator',   match: 73, tags: ['React', 'Node.js', 'GraphQL'],  gap: 'GraphQL',  level: 'Beginner',     accent: 'v' },
];

/* ─────────────────────────────────────────
   HERO HEADING (word-by-word animation)
───────────────────────────────────────── */
function AnimatedHeading() {
  const lines = [
    ['What', 'should', 'you'],
    ['build', 'next?'],
  ];
  let globalIdx = 0;
  return (
    <h1 className="lp-hero__h1">
      {lines.map((words, li) => (
        <span key={li} style={{ display: 'block' }}>
          {words.map((word) => {
            const delay = 0.12 + globalIdx++ * 0.085;
            return (
              <React.Fragment key={word}>
                <span
                  className="lp-word"
                  style={{ animationDelay: `${delay}s` }}
                >
                  {word}
                </span>
                {' '}
              </React.Fragment>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function LandingPage({ onEnterApp }) {
  const [navSolid, setNavSolid] = useState(false);
  const blobVRef  = useRef(null);
  const blobCRef  = useRef(null);
  const rafRef    = useRef(null);

  /* Scroll: navbar + parallax */
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setNavSolid(y > 72);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (blobVRef.current) {
        blobVRef.current.style.transform = `translate(-50%, calc(-50% + ${y * 0.22}px))`;
      }
      if (blobCRef.current) {
        blobCRef.current.style.transform = `translate(-50%, calc(-50% + ${y * -0.12}px))`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  /* IntersectionObserver for .lp-reveal elements */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('lp-in');
        });
      },
      { threshold: 0.07, rootMargin: '0px 0px -70px 0px' }
    );
    document.querySelectorAll('.lp-reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp">

      {/* ══════════════════ NAVBAR ══════════════════ */}
      <nav className={`lp-nav${navSolid ? ' lp-nav--solid' : ''}`}>
        <div className="lp-nav__inner">
          <div className="lp-nav__logo" onClick={onEnterApp}>
            <span className="lp-logo-dot" />
            <span className="lp-logo-text">dev.recommender</span>
          </div>
          <div className="lp-nav__links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#demo">Demo</a>
          </div>
          <button className="lp-nav__cta" onClick={onEnterApp}>
            Get Started
            <IconArrowRight />
          </button>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="lp-hero">
        {/* Ambient blobs */}
        <div className="lp-blob lp-blob--hero-v" ref={blobVRef} />
        <div className="lp-blob lp-blob--hero-c" ref={blobCRef} />

        {/* Eyebrow badge */}
        <div className="lp-hero__eyebrow">
          <span className="lp-eyebrow-badge">
            <span className="lp-eyebrow-badge__dot" />
            AI-Powered &nbsp;·&nbsp; Open Source
          </span>
        </div>

        {/* Heading */}
        <AnimatedHeading />

        {/* Subtext */}
        <p
          className="lp-hero__sub lp-reveal"
          style={{ transitionDelay: '0.52s' }}
        >
          Enter your skills. Get AI-matched project ideas tailored to your<br />
          stack, interests, and experience level — in milliseconds.
        </p>

        {/* CTAs */}
        <div
          className="lp-hero__ctas lp-reveal"
          style={{ transitionDelay: '0.66s' }}
        >
          <button className="lp-btn lp-btn--violet" onClick={onEnterApp}>
            Launch App
          </button>
          <a className="lp-btn lp-btn--ghost" href="#how-it-works">
            See How it Works
            <IconArrowDown />
          </a>
        </div>

        {/* Floating preview card */}
        <div
          className="lp-hero__preview lp-reveal"
          style={{ transitionDelay: '0.82s' }}
        >
          <div className="lp-preview-window">
            <div className="lp-preview-window__titlebar">
              <span className="lp-tbar-dot lp-tbar-dot--r" />
              <span className="lp-tbar-dot lp-tbar-dot--y" />
              <span className="lp-tbar-dot lp-tbar-dot--g" />
              <span className="lp-tbar-label">dev.recommender — recommendations</span>
            </div>
            <div className="lp-preview-window__body">
              {/* Card 1 */}
              <div className="lp-mini-result">
                <div className="lp-mini-result__row">
                  <div>
                    <div className="lp-mini-result__name">Real-Time Chat App</div>
                    <div className="lp-mini-tags">
                      <span className="lp-tag">React</span>
                      <span className="lp-tag">FastAPI</span>
                      <span className="lp-tag">WebSocket</span>
                    </div>
                  </div>
                  <div className="lp-score-block">
                    <div className="lp-score-block__pct">87%</div>
                    <div className="lp-score-block__lbl">match</div>
                  </div>
                </div>
                <div className="lp-match-bar">
                  <div className="lp-bar-fill" style={{ width: '87%' }} />
                </div>
                <div className="lp-mini-pills">
                  <span className="lp-gap-pill"><IconInfo /> Gap: Redis</span>
                  <span className="lp-diff-badge">Intermediate</span>
                </div>
              </div>
              {/* Card 2 (dimmed) */}
              <div className="lp-mini-result lp-mini-result--dimmed">
                <div className="lp-mini-result__row">
                  <div>
                    <div className="lp-mini-result__name">ML Recommendation API</div>
                    <div className="lp-mini-tags">
                      <span className="lp-tag">Python</span>
                      <span className="lp-tag">scikit-learn</span>
                    </div>
                  </div>
                  <div className="lp-score-block">
                    <div className="lp-score-block__pct">81%</div>
                    <div className="lp-score-block__lbl">match</div>
                  </div>
                </div>
                <div className="lp-match-bar lp-match-bar--thin">
                  <div className="lp-bar-fill lp-bar-fill--cyan" style={{ width: '81%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="lp-scroll-hint">
          <div className="lp-scroll-hint__line" />
          <span className="lp-scroll-hint__label">scroll</span>
        </div>
      </section>

      {/* ══════════════════ SOCIAL PROOF ══════════════════ */}
      <div className="lp-proof">
        <div className="lp-proof__inner lp-reveal">
          <span className="lp-proof__label">Trusted by developers at</span>
          <div className="lp-proof__pills">
            {['Stripe', 'Vercel', 'Linear', 'Figma', 'Notion', 'GitHub', 'Shopify'].map((name) => (
              <span key={name} className="lp-proof__pill">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section className="lp-features-section" id="features">
        <div className="lp-container">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">Capabilities</div>
            <h2 className="lp-section-h2">Everything you need to<br />decide what to build</h2>
            <p className="lp-section-sub">
              Six precision-engineered features working in concert to surface the right project at the right time.
            </p>
          </div>

          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`lp-feature-card lp-feature-card--${f.accent} lp-reveal`}
                style={{ transitionDelay: `${(i % 3) * 0.09}s` }}
              >
                <div className={`lp-feature-icon lp-feature-icon--${f.accent}`}>
                  <f.Icon />
                </div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section className="lp-hiw-section" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">Process</div>
            <h2 className="lp-section-h2">From skills to project<br />in three steps</h2>
          </div>

          <div className="lp-hiw-steps">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="lp-step lp-reveal"
                style={{ transitionDelay: `${i * 0.14}s` }}
              >
                <div className="lp-step__num">{step.num}</div>
                <div className="lp-step__title">{step.title}</div>
                <div className="lp-step__desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ LIVE DEMO PREVIEW ══════════════════ */}
      <section className="lp-demo-section" id="demo">
        <div className="lp-container">
          <div className="lp-section-header lp-reveal">
            <div className="lp-section-tag">Live Preview</div>
            <h2 className="lp-section-h2">See it in action</h2>
            <p className="lp-section-sub">
              A realistic preview of the recommender interface. Enter your stack, run the engine, get ranked matches.
            </p>
          </div>

          <div
            className="lp-demo-panel lp-reveal lp-reveal--scale"
            style={{ transitionDelay: '0.18s' }}
          >
            <div className="lp-demo-glow" />

            {/* Left: Input form */}
            <div className="lp-demo-left">
              <div className="lp-demo-slabel">Your Profile</div>

              <div className="lp-demo-field">
                <div className="lp-demo-flabel">Skills</div>
                <div className="lp-demo-pills">
                  <span className="lp-demo-pill lp-demo-pill--skill">Python</span>
                  <span className="lp-demo-pill lp-demo-pill--skill">React</span>
                  <span className="lp-demo-pill lp-demo-pill--skill">FastAPI</span>
                  <span className="lp-demo-pill lp-demo-pill--add"><IconPlus />Add skill</span>
                </div>
              </div>

              <div className="lp-demo-field">
                <div className="lp-demo-flabel">Interests</div>
                <div className="lp-demo-pills">
                  <span className="lp-demo-pill lp-demo-pill--skill">AI</span>
                  <span className="lp-demo-pill lp-demo-pill--skill">Web Dev</span>
                  <span className="lp-demo-pill lp-demo-pill--add"><IconPlus />Add interest</span>
                </div>
              </div>

              <div className="lp-demo-field">
                <div className="lp-demo-flabel">Experience Level</div>
                <div className="lp-demo-select">
                  <span>Intermediate</span>
                  <IconChevronDown />
                </div>
              </div>

              <div className="lp-demo-field">
                <div className="lp-demo-flabel">What-If Skills</div>
                <div className="lp-demo-pills" style={{ marginBottom: 8 }}>
                  <span className="lp-demo-pill lp-demo-pill--whatif"><IconPlus />TypeScript</span>
                </div>
                <div className="lp-demo-input-fake">Add hypothetical skill...</div>
              </div>

              <button className="lp-demo-run" onClick={onEnterApp}>
                Run Recommender
                <IconArrowRight />
              </button>
            </div>

            {/* Divider */}
            <div className="lp-demo-sep" />

            {/* Right: Results */}
            <div className="lp-demo-right">
              <div className="lp-demo-slabel">
                Recommendations
                <span className="lp-demo-badge">3 matches</span>
              </div>

              {DEMO_RESULTS.map((proj) => (
                <div
                  key={proj.name}
                  className={`lp-demo-result lp-demo-result--${proj.accent}`}
                >
                  <div className="lp-demo-result__row">
                    <div>
                      <div className="lp-demo-result__name">{proj.name}</div>
                      <div className="lp-demo-result__tags">
                        {proj.tags.map((t) => (
                          <span key={t} className="lp-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div
                      className="lp-demo-result__score"
                      style={{
                        color: proj.accent === 'c'
                          ? 'var(--accent-cyan)'
                          : 'var(--accent-violet-light)',
                      }}
                    >
                      {proj.match}%
                    </div>
                  </div>
                  <div className="lp-match-bar lp-match-bar--thin">
                    <div
                      className={`lp-bar-fill${proj.accent === 'c' ? ' lp-bar-fill--cyan' : ''}`}
                      style={{ width: `${proj.match}%` }}
                    />
                  </div>
                  <div className="lp-demo-result__meta">
                    {proj.gap && (
                      <span className="lp-gap-pill">
                        <IconInfo /> Gap: {proj.gap}
                      </span>
                    )}
                    <span className="lp-diff-badge">{proj.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow" />
        <div className="lp-cta-glow-c" />
        <div className="lp-cta-inner lp-reveal">
          <div className="lp-section-tag">Get Started</div>
          <h2 className="lp-cta-h2">
            Stop wondering.<br />Start building.
          </h2>
          <p className="lp-cta-sub">Your next project is one recommendation away.</p>
          <button
            className="lp-btn lp-btn--violet lp-btn--lg"
            onClick={onEnterApp}
          >
            Launch the App
            <IconArrowRight />
          </button>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-nav__logo">
            <span className="lp-logo-dot" />
            <span className="lp-logo-text">dev.recommender</span>
          </div>
          <div className="lp-footer__links">
            <a href="#">Privacy</a>
            <a href="#">Docs</a>
            <a href="#">GitHub</a>
          </div>
          <div className="lp-footer__right">
            <div className="lp-footer__copy">Built with ML · Open Source</div>
            <div className="lp-footer__devs">
              Built by
              <span className="lp-footer__dev-name">Mihir Mandavia</span>
              <span className="lp-footer__dev-sep">&</span>
              <span className="lp-footer__dev-name">Haya Sachin</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
