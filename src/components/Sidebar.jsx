import './Sidebar.css'

const navItems = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard', section: 'Main' },
  { id: 'map', icon: '◎', label: 'Map View', section: null },
  { id: 'booking', icon: '✈', label: 'Booking', badge: '3', section: null },
  { id: 'itinerary', icon: '☰', label: 'Itinerary Planner', section: null },
  { id: 'budget', icon: '₹', label: 'Utility Addons', section: 'Features' },
  { id: 'subscription', icon: '💎', label: 'Pro Plans', section: null },
  { id: 'community', icon: '◉', label: 'Community', badge: '5', section: null },
  { id: 'chat', icon: '◈', label: 'AI Chatbot', section: null },
  { id: 'safety', icon: '⚑', label: 'Safety', section: null },
]

export default function Sidebar({ activeScreen, setActiveScreen, logout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🧭</div>
          <div className="logo-text">Bharat Path</div>
        </div>
        <div className="logo-sub">Spiritual India</div>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <div key={item.id}>
            {item.section && <div className="nav-section">{item.section}</div>}
            <div
              className={`nav-item ${activeScreen === item.id ? 'active' : ''}`}
              onClick={() => setActiveScreen(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-user">
        <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, background: 'linear-gradient(135deg,#FF6B35,#F7C948)' }}>SM</div>
        <div>
          <div className="u-name">Shashank Mishra</div>
          <div className="u-role">Founder · Traveler</div>
        </div>
        <button
          type="button"
          onClick={() => logout?.()}
          style={{
            marginLeft: 'auto',
            background: 'var(--cream)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '6px 10px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            color: 'var(--dark)',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
