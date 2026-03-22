import { useState, useEffect, useRef } from 'react'
import './Dashboard.css'
import { fetchSpiritualNews, getApiStatus } from '../services/newsService.js'

/* ── mock news data ── */
const NEWS_DATA = [
  {
    id: 1, category: 'Spiritual',
    title: 'Kedarnath Yatra 2025: Online Registration Begins from April 15',
    source: 'Dainik Bhaskar', time: '12 min ago',
    emoji: '🏔️', color: '#F97316',
    desc: 'The Uttarakhand government has announced the opening of online portal for Kedarnath pilgrimage registration. Over 2 lakh devotees expected.'
  },
  {
    id: 2, category: 'Tourism',
    title: 'New Varanasi-Tirthankar Corridor Inaugurated by PM Modi',
    source: 'Aaj Tak', time: '38 min ago',
    emoji: '🕌', color: '#A78BFA',
    desc: 'A grand 800-meter heritage corridor connecting Kashi Vishwanath temple to the Ganges ghats has been expanded for pilgrims.'
  },
  {
    id: 3, category: 'Travel Alerts',
    title: 'Vande Bharat Express Now Connects Prayagraj ↔ Puri Daily',
    source: 'NDTV India', time: '1 hr ago',
    emoji: '🚄', color: '#34D399',
    desc: 'Indian Railways launches dedicated Vande Bharat service for Mahakumbh pilgrims with 60% concessional fares for senior citizens.'
  },
  {
    id: 4, category: 'Spiritual',
    title: 'Ganga Aarti at Haridwar Attracts 50,000 Pilgrims This Week',
    source: 'Amar Ujala', time: '2 hr ago',
    emoji: '🪔', color: '#F7C948',
    desc: 'The evening Ganga Aarti at Har Ki Pauri ghat continues to draw massive crowds as Chaitra Navratri approaches.'
  },
  {
    id: 5, category: 'Tourism',
    title: 'Ram Mandir Ayodhya: New Dharamshala Complex Ready for Devotees',
    source: 'Hindustan Times', time: '3 hr ago',
    emoji: '🛕', color: '#F97316',
    desc: 'A new 500-room Dharamshala complex adjacent to Ram Mandir in Ayodhya will house pilgrims free of cost during major festivals.'
  },
  {
    id: 6, category: 'Travel Alerts',
    title: 'Weather Advisory: Heavy Rain Expected near Char Dham Route',
    source: 'IMD India', time: '4 hr ago',
    emoji: '⛈️', color: '#60A5FA',
    desc: 'IMD issues orange alert for Uttarakhand hills. Pilgrims are advised to check route conditions before proceeding to Badrinath and Gangotri.'
  },
  {
    id: 7, category: 'Spiritual',
    title: 'Mahashivaratri: Over 1 Crore Devotees Visit Kashi Vishwanath',
    source: 'Zee News', time: '5 hr ago',
    emoji: '🕉️', color: '#A78BFA',
    desc: 'Record-breaking footfall at the Kashi Vishwanath temple during Mahashivaratri 2025 with round-the-clock darshan facilitated.'
  },
  {
    id: 8, category: 'Tourism',
    title: 'Tirupati Balaji: New ₹500 Special Entry Darshan Queue System Live',
    source: 'The Hindu', time: '6 hr ago',
    emoji: '🙏', color: '#34D399',
    desc: 'TTD launches new digital queue management system for Tirupati Balaji Darshan to reduce average waiting time from 6 hours to 90 minutes.'
  },
]

/* ── News Card Component ── */
function NewsCard({ item }) {
  const [imgErr, setImgErr] = useState(false)
  const hasRealImg = item.image && !imgErr

  const handleClick = () => {
    if (item.url && item.url !== '#') window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="ns-card" onClick={handleClick} role={item.url !== '#' ? 'link' : undefined}>
      {/* Image area */}
      <div
        className="ns-card-img"
        style={hasRealImg ? {} : {
          background: `linear-gradient(135deg, ${item.color}22, ${item.color}08)`,
          border: `1px solid ${item.color}30`,
        }}
      >
        {hasRealImg ? (
          <img
            src={item.image}
            alt={item.title}
            className="ns-card-real-img"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="ns-card-emoji">{item.emoji}</span>
        )}
        <div className="ns-card-category-dot" style={{ background: item.color }} />
        {item.url && item.url !== '#' && (
          <div className="ns-card-read-overlay">Read full story ↗</div>
        )}
      </div>

      {/* Body */}
      <div className="ns-card-body">
        <div className="ns-card-meta">
          <span className="ns-card-source">{item.rawSource || item.source}</span>
          <span className="ns-card-time">{item.time}</span>
        </div>
        <div className="ns-card-title">{item.title}</div>
        <div className="ns-card-desc">{item.desc}</div>
        <div className="ns-card-tag" style={{ color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
          {item.category}
        </div>
      </div>
    </div>
  )
}

/* ── tiny hook: animated counter ── */
function useCounter(target, duration = 1500) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(id)
  }, [target, duration])
  return val
}

/* ── Floating Particle ── */
function Particle({ style }) {
  return <div className="db-particle" style={style} />
}

/* ── Stat Card ── */
function StatCard({ icon, val, label, change, up, color, delay }) {
  const num = parseFloat(val)
  const counted = useCounter(isNaN(num) ? 0 : num, 1800)
  const display = isNaN(num) ? val : (val.includes('k') ? (counted / 1000).toFixed(1) + 'k' : counted)

  return (
    <div className="db-stat-card" style={{ animationDelay: delay }}>
      <div className="db-stat-orb" style={{ '--orb-color': color }}>
        <span className="db-stat-icon-inner">{icon}</span>
      </div>
      <div className="db-stat-val">{display}</div>
      <div className="db-stat-label">{label}</div>
      <div className={`db-stat-change ${up ? 'up' : 'down'}`}>{change}</div>
    </div>
  )
}

/* ── Journey Stop ── */
function JourneyStop({ dot, name, date, isLast }) {
  return (
    <div className="db-stop-row">
      <div className="db-stop-timeline">
        <div className={`db-stop-marker ${dot}`} />
        {!isLast && <div className="db-stop-line" />}
      </div>
      <div className="db-stop-body">
        <div className="db-stop-name">{name}</div>
        <div className="db-stop-date">{date}</div>
      </div>
    </div>
  )
}

/* ── Sacred Place Card ── */
function SacredPlace({ icon, bg, name, loc, rating, index }) {
  return (
    <div className="db-place-item" style={{ animationDelay: `${index * 0.12}s` }}>
      <div className="db-place-icon-wrap" style={{ '--place-bg': bg }}>
        <span className="db-place-icon">{icon}</span>
        <div className="db-place-ring" />
      </div>
      <div className="db-place-info">
        <div className="db-place-name">{name}</div>
        <div className="db-place-loc">{loc}</div>
      </div>
      <div className="db-place-rating">
        <span className="db-star">✦</span> {rating}
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const canvasRef = useRef(null)
  const [time, setTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')

  /* live clock */
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  /* greeting */
  useEffect(() => {
    const h = new Date().getHours()
    if (h < 5) setGreeting('🌙 Shubh Ratri')
    else if (h < 12) setGreeting('🌅 Shubh Prabhat')
    else if (h < 17) setGreeting('☀️ Shubh Madhyanha')
    else if (h < 20) setGreeting('🌇 Shubh Sandhya')
    else setGreeting('🌙 Shubh Sandhya')
  }, [])

  /* mandala canvas */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 340; canvas.height = 340
    const cx = 170, cy = 170
    const draw = (t) => {
      ctx.clearRect(0, 0, 340, 340)
      const layers = [
        { petals: 8, r: 48, pr: 22, alpha: 0.18, rot: t * 0.003 },
        { petals: 12, r: 80, pr: 18, alpha: 0.12, rot: -t * 0.002 },
        { petals: 16, r: 112, pr: 14, alpha: 0.09, rot: t * 0.0015 },
        { petals: 24, r: 148, pr: 10, alpha: 0.06, rot: -t * 0.001 },
      ]
      layers.forEach(({ petals, r, pr, alpha, rot }) => {
        for (let i = 0; i < petals; i++) {
          const angle = (i / petals) * Math.PI * 2 + rot
          const px = cx + r * Math.cos(angle)
          const py = cy + r * Math.sin(angle)
          const grad = ctx.createRadialGradient(px, py, 0, px, py, pr)
          grad.addColorStop(0, `rgba(249,201,72,${alpha * 2})`)
          grad.addColorStop(0.5, `rgba(249,115,22,${alpha})`)
          grad.addColorStop(1, `rgba(249,115,22,0)`)
          ctx.beginPath()
          ctx.arc(px, py, pr, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        }
      })
      /* center orb */
      const cgrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 36)
      cgrad.addColorStop(0, 'rgba(249,201,72,0.55)')
      cgrad.addColorStop(0.5, 'rgba(249,115,22,0.25)')
      cgrad.addColorStop(1, 'rgba(249,115,22,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, 36, 0, Math.PI * 2)
      ctx.fillStyle = cgrad
      ctx.fill()
    }
    let raf, start = performance.now()
    const loop = (now) => { draw(now - start); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* particles */
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 8}px`,
    height: `${4 + Math.random() * 8}px`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${5 + Math.random() * 8}s`,
    opacity: 0.3 + Math.random() * 0.4,
  }))

  const stats = [
    { icon: '🗺️', val: '12', label: 'Trips Planned', change: '↑ 3 this month', up: true, color: '#F97316', delay: '0s' },
    { icon: '🕉️', val: '7', label: 'Sacred Sites', change: '↑ 2 new added', up: true, color: '#A78BFA', delay: '0.1s' },
    { icon: '₹', val: '8.4k', label: 'Budget Left', change: '↓ ₹1.2k spent', up: false, color: '#F7C948', delay: '0.2s' },
    { icon: '👥', val: '1.2k', label: 'Followers', change: '↑ 48 new', up: true, color: '#34D399', delay: '0.3s' },
  ]

  const stops = [
    { dot: 'done', name: 'Kashi Vishwanath · Varanasi', date: 'Mar 10 ✓' },
    { dot: 'active', name: 'Triveni Sangam · Prayagraj', date: 'Today' },
    { dot: 'pending', name: 'Triveni Ghat · Rishikesh', date: 'Mar 20' },
  ]

  const places = [
    { icon: '🕌', bg: 'rgba(249,115,22,0.15)', name: 'Kashi Vishwanath Temple', loc: 'Varanasi · 0.8 km', rating: '4.9' },
    { icon: '🌊', bg: 'rgba(167,139,250,0.15)', name: 'Dashashwamedh Ghat', loc: 'Varanasi · 1.2 km', rating: '4.8' },
    { icon: '🏔️', bg: 'rgba(247,201,72,0.15)', name: "Sarnath — Buddha's Site", loc: 'Varanasi · 8 km', rating: '4.7' },
  ]

  const clockStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="db-root">
      {/* Floating particles */}
      <div className="db-particles-layer" aria-hidden>
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* ══ HERO BANNER ══ */}
      <div className="db-hero">
        {/* mandala canvas */}
        <div className="db-mandala-wrap" aria-hidden>
          <canvas ref={canvasRef} className="db-mandala-canvas" />
        </div>

        {/* light rays */}
        <div className="db-rays" aria-hidden>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="db-ray" style={{ transform: `rotate(${i * 45}deg)` }} />
          ))}
        </div>

        <div className="db-hero-content">
          <div className="db-hero-left">
            <div className="db-hero-greeting">{greeting}</div>
            <h1 className="db-hero-name">Namaste, Shashank 🙏</h1>
            <p className="db-hero-sub">Your sacred journey through<br />
              <span className="db-hero-route">Varanasi → Prayagraj → Rishikesh</span>
            </p>
            <div className="db-hero-meta">
              <span className="db-meta-pill">🛕 5 Days · 3 Dhams</span>
              <span className="db-meta-pill">🕰 {clockStr}</span>
            </div>
            <div className="db-hero-cta-row">
              <button className="db-btn-divine">Begin Sacred Journey →</button>
              <span className="db-hero-date">{dateStr}</span>
            </div>
          </div>

          {/* Circular progress ring */}
          <div className="db-progress-circle-wrap">
            <svg className="db-ring-svg" viewBox="0 0 120 120">
              <circle className="db-ring-bg" cx="60" cy="60" r="50" />
              <circle className="db-ring-fill" cx="60" cy="60" r="50"
                strokeDasharray={`${2 * Math.PI * 50 * 0.62} ${2 * Math.PI * 50}`} />
              <text x="60" y="56" className="db-ring-pct">62%</text>
              <text x="60" y="70" className="db-ring-sub">complete</text>
            </svg>
            <div className="db-ring-label">Journey</div>
          </div>
        </div>

        {/* Ganga Aarti alert */}
        <div className="db-aarti-alert">
          <span className="db-aarti-flame">🪔</span>
          <span>Ganga Aarti tonight at <strong>6:30 PM</strong> — crowd level <span className="db-aarti-low">Low</span></span>
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="db-stats-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ══ MIDDLE ROW ══ */}
      <div className="db-mid-grid">

        {/* Current Journey */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">🛤️ Current Journey</span>
            <span className="db-panel-link">View all</span>
          </div>
          <div className="db-journey-route">
            {['Varanasi', 'Prayagraj', 'Rishikesh'].map((c, i, arr) => (
              <span key={i} className="db-route-segment">
                <span className="db-route-city">{c}</span>
                {i < arr.length - 1 && <span className="db-route-sep">⟶</span>}
              </span>
            ))}
          </div>
          <div className="db-journey-tags">
            <span className="db-tag db-tag-saffron">Spiritual</span>
            <span className="db-tag db-tag-violet">AI Optimized</span>
            <span className="db-tag db-tag-gold">Char Dham</span>
          </div>

          <div className="db-progress-bar-wrap">
            <div className="db-progress-label">
              <span>Journey Progress</span><span className="db-pct-label">62%</span>
            </div>
            <div className="db-progress-track">
              <div className="db-progress-fill" style={{ width: '62%' }}>
                <div className="db-progress-glow" />
              </div>
            </div>
          </div>

          <div className="db-stops">
            {stops.map((s, i) => (
              <JourneyStop key={i} {...s} isLast={i === stops.length - 1} />
            ))}
          </div>
        </div>

        {/* Sacred Places */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">🕌 Sacred Places Nearby</span>
            <span className="db-panel-link">View map</span>
          </div>
          <div className="db-places-list">
            {places.map((p, i) => <SacredPlace key={i} {...p} index={i} />)}
          </div>
          <div className="db-blessings-strip">
            <span>✦</span> <span>ॐ नमः शिवाय</span> <span>✦</span>
            <span>जय माता दी</span> <span>✦</span> <span>हर हर महादेव</span> <span>✦</span>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ROW ══ */}
      <div className="db-bottom-grid">

        {/* AI Suggestion */}
        <div className="db-ai-panel">
          <div className="db-ai-glow-orb" />
          <div className="db-ai-header">
            <span className="db-ai-badge">✨ Gemini AI · Google</span>
          </div>
          <p className="db-ai-msg">
            Based on your <span className="db-hl">spiritual route</span>, I recommend visiting{' '}
            <span className="db-hl">Kashi Vishwanath</span> before sunset. Crowd level is{' '}
            <span className="db-hl-green">Very Low</span>. Weather is clear — perfect time for{' '}
            <span className="db-hl">Ganga Aarti</span> at 6:30 PM!
          </p>
          <div className="db-ai-chips">
            <span className="db-ai-chip">🙏 Add to Itinerary</span>
            <span className="db-ai-chip">📍 Navigate There</span>
          </div>
          <button className="db-btn-divine" style={{ width: '100%', marginTop: 16 }}>
            Ask AI Anything →
          </button>
        </div>

        {/* Budget */}
        <div className="db-panel">
          <div className="db-panel-header">
            <span className="db-panel-title">💰 Budget Overview</span>
            <span className="db-panel-link">Details</span>
          </div>
          <div className="db-budget-total">
            <span className="db-budget-amount">₹15,000</span>
            <span className="db-budget-sub">Total Budget</span>
          </div>
          <div className="db-budget-donut-wrap">
            <svg viewBox="0 0 100 100" className="db-donut-svg">
              <circle cx="50" cy="50" r="38" className="db-donut-bg" />
              {[
                { pct: 32, color: '#F97316', offset: 0 },
                { pct: 14, color: '#F7C948', offset: 32 },
                { pct: 10, color: '#A78BFA', offset: 46 },
                { pct: 44, color: 'rgba(148,163,184,0.15)', offset: 56 },
              ].map(({ pct, color, offset }) => (
                <circle key={offset} cx="50" cy="50" r="38"
                  fill="none" stroke={color} strokeWidth="14"
                  strokeDasharray={`${2 * Math.PI * 38 * pct / 100} ${2 * Math.PI * 38}`}
                  strokeDashoffset={`${-2 * Math.PI * 38 * offset / 100}`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
              ))}
              <text x="50" y="47" textAnchor="middle" className="db-donut-inner-val">₹6.6k</text>
              <text x="50" y="58" textAnchor="middle" className="db-donut-inner-lbl">Remaining</text>
            </svg>
            <div className="db-budget-legend">
              {[
                { color: '#F97316', label: 'Hotel', val: '₹4,800' },
                { color: '#F7C948', label: 'Travel', val: '₹2,100' },
                { color: '#A78BFA', label: 'Food', val: '₹1,500' },
                { color: 'rgba(148,163,184,0.4)', label: 'Left', val: '₹6,600' },
              ].map((l, i) => (
                <div key={i} className="db-legend-item">
                  <span className="db-legend-dot" style={{ background: l.color }} />
                  <span className="db-legend-name">{l.label}</span>
                  <span className="db-legend-val">{l.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Verse */}
        <div className="db-verse-panel">
          <div className="db-verse-glow" />
          <div className="db-verse-header">📿 Daily Shloka</div>
          <div className="db-verse-sanskrit">
            कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।
          </div>
          <div className="db-verse-translation">
            "You have a right to perform your prescribed duties, but never to the fruits of your actions."
          </div>
          <div className="db-verse-src">— Bhagavad Gita 2.47</div>
          <div className="db-verse-divider">✦ ✦ ✦</div>
          <div className="db-verse-quote">
            Let your pilgrimage be an offering, not an expectation.
          </div>
        </div>
      </div>

      {/* ══ LIVE NEWS SECTION ══ */}
      <LiveNewsSection />
    </div>
  )
}

/* ══════════════════════════════════════
   LIVE NEWS SECTION  — Dual-API powered
   NewsAPI + GNews with mock fallback
══════════════════════════════════════ */
function LiveNewsSection() {
  const FILTERS = ['All', 'Spiritual', 'Tourism', 'Travel Alerts']
  const [active, setActive] = useState('All')
  const [tick, setTick] = useState(true)
  const [articles, setArticles] = useState(NEWS_DATA)   // starts with mock
  const [status, setStatus] = useState({ label: 'Loading...', color: '#94A3B8' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  /* blinking live dot */
  useEffect(() => {
    const id = setInterval(() => setTick(t => !t), 900)
    return () => clearInterval(id)
  }, [])

  /* ── Dual-API fetch ── */
  const loadNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSpiritualNews()
      setArticles(data)
      setStatus(getApiStatus(data))
    } catch (err) {
      /* Both APIs failed — keep mock data already in state */
      setError('Live feed unavailable — showing curated stories')
      setStatus({ label: 'Mock Data', color: '#94A3B8' })
      console.warn('[Dashboard] News fallback to mock:', err.message)
    } finally {
      setLoading(false)
    }
  }

  /* fetch on mount + auto-refresh every 5 min */
  useEffect(() => {
    loadNews()
    const id = setInterval(loadNews, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const filtered = active === 'All'
    ? articles
    : articles.filter(n => n.category === active)

  return (
    <div className="ns-root">
      {/* gradient bar at top */}
      <div className="ns-top-bar" />

      {/* Header */}
      <div className="ns-header">
        <div className="ns-title-group">
          <span className="ns-live-dot" style={{ opacity: tick ? 1 : 0.15 }} />
          <span className="ns-live-badge">LIVE</span>
          <h2 className="ns-title">Bharat Live Updates</h2>
        </div>
        <div className="ns-header-right">
          {/* API source badge */}
          <span className="ns-api-badge" style={{ color: status.color, borderColor: `${status.color}40`, background: `${status.color}12` }}>
            <span className="ns-api-dot" style={{ background: status.color }} />
            {status.label}
          </span>
          {/* Refresh button */}
          <button className={`ns-refresh-btn ${loading ? 'ns-refreshing' : ''}`} onClick={loadNews} title="Refresh news" disabled={loading}>
            &#8635;
          </button>
          <span className="ns-subtitle">Spiritual &amp; Tourism · India</span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="ns-error-bar">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Filter chips */}
      <div className="ns-chips">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`ns-chip ${active === f ? 'ns-chip-active' : ''}`}
            onClick={() => setActive(f)}
          >
            {f === 'All' && '🌐 '}
            {f === 'Spiritual' && '🕉️ '}
            {f === 'Tourism' && '🗺️ '}
            {f === 'Travel Alerts' && '⚠️ '}
            {f}
          </button>
        ))}
        <span className="ns-count">
          {loading ? 'Fetching...' : `${filtered.length} stories`}
        </span>
      </div>

      {/* Scrollable cards */}
      <div className="ns-scroll-wrap" ref={scrollRef}>
        {loading ? (
          /* Skeleton loaders */
          <div className="ns-cards-row">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="ns-card ns-skeleton">
                <div className="ns-skel-img" />
                <div className="ns-card-body">
                  <div className="ns-skel-line ns-skel-short" />
                  <div className="ns-skel-line" />
                  <div className="ns-skel-line" />
                  <div className="ns-skel-line ns-skel-short" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ns-cards-row">
            {filtered.map((item, i) => (
              <div key={item.id} style={{ animationDelay: `${i * 0.07}s` }} className="ns-card-anim">
                <NewsCard item={item} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="ns-empty">
                <span>🙏</span>
                <span>No stories in this category right now</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticker tape at bottom */}
      <div className="ns-ticker-wrap" aria-hidden>
        <div className="ns-ticker">
          {[...articles, ...articles].map((n, i) => (
            <span key={i} className="ns-ticker-item">
              <span className="ns-ticker-dot" style={{ background: n.color }} />
              {n.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
