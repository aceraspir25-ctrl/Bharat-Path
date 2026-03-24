import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Dashboard from '../screens/Dashboard'
import MapView from '../screens/MapView'
import Booking from '../screens/Booking'
import Itinerary from '../screens/Itinerary'
import Budget from '../screens/Budget'
import Community from '../screens/Community'
import AIChat from '../screens/AIChat'
import Safety from '../screens/Safety'
import Subscription from '../screens/Subscription'
import '../App.css'

function LoginCard() {
  const { loginWithGoogle, loading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '40px 36px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          maxWidth: 380,
          width: '90%',
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 12 }}>🧭</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
          Bharat Path
        </div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
          Spiritual India
        </div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 28, lineHeight: 1.6 }}>
          AI-powered spiritual travel companion — sacred paths, smart routes & real-time intelligence
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy || loading}
          style={{
            width: '100%',
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: busy || loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: '#0F172A',
            transition: 'all 0.2s',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--saffron)')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
          {busy ? 'Signing in...' : 'Continue with Google'}
        </button>

        {error && <div style={{ marginTop: 12, fontSize: 12, color: '#B91C1C', lineHeight: 1.4 }}>{error}</div>}
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 16 }}>By Shashank Mishra · v1.0.4</div>
      </div>
    </div>
  )
}

export default function MainApp() {
  const { user, logout, loading } = useAuth()
  const [activeScreen, setActiveScreen] = useState('dashboard')

  const screens: Record<string, ReactNode> = useMemo(
    () => ({
      dashboard: <Dashboard />,
      map: <MapView />,
      booking: <Booking />,
      community: <Community />,
      route: <Itinerary />,
      itinerary: <Itinerary />,
      translator: <Budget />,
      media: <Community />,
      chat: <AIChat />,
      utility: <Budget />,
      budget: <Budget />,
      safety: <Safety />,
      subscription: <Subscription />,
    }),
    []
  )

  const titles: Record<string, string> = useMemo(
    () => ({
      dashboard: 'Dashboard',
      map: 'Interactive Map',
      translator: 'BhashaSangam',
      media: 'AI Media Studio',
      chat: 'AI Chatbot',
      route: 'Itinerary Planner',
      itinerary: 'Itinerary Planner',
      booking: 'Booking Center',
      community: 'Community Hub',
      utility: 'Budget Hub',
      budget: 'Budget Hub',
      safety: 'Safety Center',
      subscription: 'Premium Plans',
    }),
    []
  )

  // Keep this logic here so the TS routing file is self-contained.
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ textAlign: 'center', background: 'white', borderRadius: 18, padding: '26px 22px', border: '1px solid var(--border)', maxWidth: 380, width: '90%' }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🧭</div>
          <div style={{ fontSize: 13, color: '#64748B' }}>Checking your login...</div>
        </div>
      </div>
    )
  }

  if (!user) return <LoginCard />

  return (
    <div className="app">
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} user={user} logout={logout} />
      <div className="main">
        <Topbar title={titles[activeScreen] || 'Bharat Path'} />
        <div className="content">{screens[activeScreen] || <Dashboard />}</div>
      </div>
    </div>
  )
}

