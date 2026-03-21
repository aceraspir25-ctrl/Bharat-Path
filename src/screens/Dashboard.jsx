import './Dashboard.css'

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="wb-left">
          <div className="wb-greeting">Namaste, Shashank 🙏</div>
          <div className="wb-title">Your Spiritual Journey<br />Awaits You</div>
          <div className="wb-sub">Varanasi → Prayagraj → Rishikesh · 5 Days</div>
          <button className="btn-primary">Start Journey →</button>
        </div>
        <div className="wb-illustration">🧭</div>
      </div>

      {/* Stats */}
      <div className="grid4" style={{ marginBottom: 22 }}>
        {[
          { icon: '🗺️', bg: '#FFF0E8', val: '12', label: 'Trips Planned', change: '↑ 3 this month', up: true },
          { icon: '🕉️', bg: '#E8FAF8', val: '7', label: 'Spiritual Sites', change: '↑ 2 new added', up: true },
          { icon: '₹', bg: '#FEF9EC', val: '8.4k', label: 'Budget Left', change: '↓ ₹1.2k spent', up: false },
          { icon: '👥', bg: '#F3F0FF', val: '1.2k', label: 'Followers', change: '↑ 48 new', up: true },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Journey + Places */}
      <div className="grid2" style={{ marginBottom: 22 }}>
        <div>
          <div className="section-header">
            <div className="section-title">Current Journey</div>
            <div className="view-all">View all</div>
          </div>
          <div className="card">
            <div className="journey-route">
              <span className="route-city">Varanasi</span>
              <span className="route-arrow"> → </span>
              <span className="route-city">Prayagraj</span>
              <span className="route-arrow"> → </span>
              <span className="route-city">Rishikesh</span>
            </div>
            <div className="journey-tags">
              <span className="tag tag-saffron">Spiritual</span>
              <span className="tag tag-teal">AI Optimized</span>
              <span className="tag tag-gold">Char Dham</span>
            </div>
            <div className="progress-wrap">
              <div className="progress-label">
                <span>Journey Progress</span>
                <span className="pct">62%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '62%' }}></div></div>
            </div>
            <div className="stops">
              {[
                { dot: 'done', name: 'Kashi Vishwanath · Varanasi', date: 'Mar 10 ✓' },
                { dot: 'active', name: 'Triveni Sangam · Prayagraj', date: 'Today' },
                { dot: 'pending', name: 'Triveni Ghat · Rishikesh', date: 'Mar 20' },
              ].map((s, i) => (
                <div className="stop-item" key={i}>
                  <div className={`stop-dot ${s.dot}`}></div>
                  <div className="stop-name">{s.name}</div>
                  <div className="stop-date">{s.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="section-header">
            <div className="section-title">Sacred Places Nearby</div>
            <div className="view-all">View map</div>
          </div>
          <div className="card">
            {[
              { icon: '🕌', bg: '#FFF0E8', name: 'Kashi Vishwanath Temple', loc: 'Varanasi, UP · 0.8 km', rating: '4.9' },
              { icon: '🌊', bg: '#E8FAF8', name: 'Dashashwamedh Ghat', loc: 'Varanasi, UP · 1.2 km', rating: '4.8' },
              { icon: '🏔️', bg: '#FEF9EC', name: "Sarnath — Buddha's Site", loc: 'Varanasi, UP · 8 km', rating: '4.7' },
            ].map((p, i) => (
              <div className="place-item" key={i}>
                <div className="place-img" style={{ background: p.bg }}>{p.icon}</div>
                <div>
                  <div className="place-name">{p.name}</div>
                  <div className="place-loc">{p.loc}</div>
                </div>
                <div className="place-rating">⭐ {p.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI + Budget */}
      <div className="grid2">
        <div>
          <div className="section-header"><div className="section-title">AI Gemini Suggestion</div></div>
          <div className="ai-card">
            <div className="ai-label">✨ Gemini AI · Powered by Google</div>
            <div className="ai-msg">
              Based on your <span className="ai-hl">spiritual route</span>, I recommend visiting{' '}
              <span className="ai-hl">Kashi Vishwanath</span> before sunset today. Crowd level is{' '}
              <span className="ai-hl">Low</span>. Weather is clear — perfect time for Ganga Aarti at 6:30 PM!
            </div>
            <button className="btn-primary" style={{ width: '100%' }}>Ask AI Anything →</button>
          </div>
        </div>
        <div>
          <div className="section-header">
            <div className="section-title">Budget Overview</div>
            <div className="view-all">Details</div>
          </div>
          <div className="card">
            <div className="budget-total">
              <span className="budget-amount">₹15,000</span>
              <span className="budget-lbl">total budget</span>
            </div>
            <div className="budget-bar-wrap">
              <div className="budget-bar">
                <div style={{ width: '32%', background: 'var(--saffron)', height: '100%', borderRadius: 10 }}></div>
                <div style={{ width: '14%', background: 'var(--gold)', height: '100%', borderRadius: 10 }}></div>
                <div style={{ width: '10%', background: 'var(--teal)', height: '100%', borderRadius: 10 }}></div>
              </div>
            </div>
            <div className="budget-legend">
              <span className="bl-item"><span className="bl-dot" style={{ background: 'var(--saffron)' }}></span>Hotel ₹4,800</span>
              <span className="bl-item"><span className="bl-dot" style={{ background: 'var(--gold)' }}></span>Travel ₹2,100</span>
              <span className="bl-item"><span className="bl-dot" style={{ background: 'var(--teal)' }}></span>Food ₹1,500</span>
              <span className="bl-item"><span className="bl-dot" style={{ background: 'var(--border)' }}></span>Left ₹6,600</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
