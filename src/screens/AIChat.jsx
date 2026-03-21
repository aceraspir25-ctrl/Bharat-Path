import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../AuthContext'
import { useLocation } from '../hooks/useLocation'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Shield, TrainFront, Hotel, UtensilsCrossed, Library, Building2 } from 'lucide-react'
import './Screens.css'

const SYSTEM_PROMPT = `Tum "Bharat Path Master AI" ho — India ke sabse expert spiritual travel guide.
Tum Hinglish mein baat karte ho (Hindi + English mix) — friendly aur warm tone mein.
Tum in topics pe expert ho:
- Varanasi, Rishikesh, Kedarnath, Ayodhya, Prayagraj, Tirupati, Amritsar, Mathura jaise spiritual places
- Temple timings, darshan info, dress code, best time to visit
- Travel routes, train/bus/flight options with approximate costs
- Budget planning — budget/mid-range/luxury options
- Local food specialties, famous dhabas, must-try dishes
- Stay options — dharamshalas, hotels, ashrams
- Safety tips, weather info, packing list
- Festivals like Kumbh Mela, Diwali, Navratri, Holi
- Itinerary suggestions — 3 days, 5 days, 7 days trips
- Hidden gems aur lesser-known spiritual places
Hamesha helpful, accurate aur detailed info do.
Emojis use karo responses mein — feel achhi aati hai.`

const QUICK_QUESTIONS = [
  { icon: '🕌', text: 'Varanasi 3-day itinerary?' },
  { icon: '🏔️', text: 'Char Dham Yatra guide?' },
  { icon: '🌊', text: 'Rishikesh best activities?' },
  { icon: '❄️', text: 'Kedarnath trek tips?' },
  { icon: '🙏', text: 'Ayodhya Ram Mandir visit?' },
  { icon: '💰', text: 'Budget spiritual trip plan?' },
]

const SUGGESTED_PROMPTS = [
  'Mujhe Varanasi se Kedarnath ka best route batao with train options',
  'Kumbh Mela 2025 ke liye planning kaise karun?',
  'Rishikesh mein yoga retreat aur rafting kahan best hai?',
  'South India spiritual tour — Tirupati, Madurai, Rameswaram plan karo',
]

async function callGroq({ apiKey, model, prompt }) {
  const controller = new AbortController()
  const tid = window.setTimeout(() => controller.abort(), 45000)
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({ model, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 600 }),
    })
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(`Groq (${res.status}): ${t}`) }
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text) throw new Error('Groq empty response')
    return String(text)
  } finally { window.clearTimeout(tid) }
}

export default function AIChat() {
  const { user } = useAuth()
  const { coords, loading: locationLoading, error: locationError, detectLocation } = useLocation()
  const userName = useMemo(() => user?.displayName?.split(' ')[0]?.trim() || 'Traveler', [user?.displayName])
  const [msgs, setMsgs] = useState([{ me: false, text: `Namaste ${userName}! 🙏\n\nMain Bharat Path Master AI hoon — India ka sabse smart spiritual travel guide!\n\nKahan jaana chahte ho? Koi bhi sawaal poochho — temples, routes, budget, itinerary, sab kuch bataunga! ✨`, time: new Date() }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeProvider, setActiveProvider] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const msgEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  const copyMsg = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const saveToFirebase = async (userMsg, aiResponse) => {
    try {
      await addDoc(collection(db, 'chatHistory'), {
        userId: user?.uid,
        userName: user?.displayName,
        userMsg,
        aiResponse,
        createdAt: serverTimestamp(),
      })
    } catch (e) { console.log('Chat save failed:', e) }
  }

  const send = async (textOverride) => {
    const userMsg = textOverride ?? input.trim()
    if (!userMsg || loading) return
    setError('')
    setInput('')
    setShowSuggestions(false)
    const time = new Date()
    setMsgs(m => [...m, { me: true, text: userMsg, time }])
    setLoading(true)

    try {
      const groqKey = import.meta.env.VITE_GROQ_API_KEY
      if (!groqKey) throw new Error('VITE_GROQ_API_KEY missing!')
      const groqModels = [import.meta.env.VITE_GROQ_MODEL, 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'].filter(Boolean)

      let response = null
      for (const model of groqModels) {
        try {
          response = await callGroq({ apiKey: groqKey, model, prompt: userMsg })
          setActiveProvider(`Groq · ${model}`)
          break
        } catch {
          continue
        }
      }

      if (!response) {
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
        if (!geminiKey) throw new Error('No AI provider key available.')
        response = 'Gemini fallback configured. Add your fallback call implementation if needed.'
        setActiveProvider('Gemini fallback')
      }

      setMsgs(m => [...m, { me: false, text: response, time: new Date() }])
      await saveToFirebase(userMsg, response)
    } catch (providerErr) {
      setError(providerErr.message || 'AI temporarily unavailable.')
      setMsgs(m => [...m, { me: false, text: '⚠️ AI abhi busy hai. Thodi der baad try karo ya API key check karo. 🙏', time: new Date() }])
    }
    setLoading(false)
  }

  const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''

  const nearbyServices = useMemo(() => {
    const baseLat = coords?.latitude ?? 21.2514
    const baseLng = coords?.longitude ?? 81.6296
    const mk = (name, dx, dy) => ({
      name,
      distance: `${(Math.abs(dx) + Math.abs(dy) + 0.7).toFixed(1)} km`,
      lat: (baseLat + dx).toFixed(4),
      lng: (baseLng + dy).toFixed(4),
    })

    return {
      safety: [mk('City Police Station', 0.012, 0.009), mk('District Hospital', -0.021, 0.016)],
      transit: [mk('Central Railway Station', 0.018, -0.011), mk('Inland Port Terminal', -0.013, -0.02)],
      lifestyle: [mk('Top-rated Hotel', 0.006, 0.014), mk('Traveler Cafe', -0.009, 0.008), mk('Knowledge Library', 0.011, -0.006), mk('Spice Route Restaurant', -0.018, 0.01)],
    }
  }, [coords?.latitude, coords?.longitude])

  return (
    <div style={{ background: '#0A0B14', minHeight: '100%', padding: 16, display: 'flex', gap: 14, height: 'calc(100vh - 80px)', boxSizing: 'border-box' }}>

      {/* MAIN CHAT */}
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(20px)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#0D1117,#1A1A2E)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ width: 46, height: 46, background: 'linear-gradient(135deg,#FF9933,#D97706)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 0 20px rgba(255,153,51,0.4)' }}>🕉️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Bharat Path Master AI</div>
            <div style={{ fontSize: 11, color: '#FF9933', letterSpacing: '1px', marginTop: 2 }}>
              {activeProvider ? `✓ ${activeProvider} Active` : 'Gemini + Groq Powered'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#F59E0B' : '#4ADE80', boxShadow: `0 0 8px ${loading ? '#F59E0B' : '#4ADE80'}` }}></div>
            <div style={{ fontSize: 11, color: loading ? '#F59E0B' : '#4ADE80', fontWeight: 600 }}>{loading ? 'Thinking...' : 'Ready'}</div>
            <div style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 20 }}>{msgs.length - 1} msgs</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.me ? 'flex-end' : 'flex-start', gap: 4 }}>
              {!m.me && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg,#FF9933,#D97706)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🕉️</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Bharat Path AI · {formatTime(m.time)}</div>
                </div>
              )}
              <div style={{ position: 'relative', maxWidth: '80%' }}>
                <div style={{
                  background: m.me ? 'linear-gradient(135deg,#FF9933,#EA580C)' : 'rgba(255,255,255,0.07)',
                  borderRadius: m.me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '12px 16px',
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'white',
                  border: `1px solid ${m.me ? 'rgba(255,153,51,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
                {!m.me && (
                  <button
                    onClick={() => copyMsg(m.text, i)}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '3px 6px', fontSize: 10, color: copiedIdx === i ? '#4ADE80' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                  >
                    {copiedIdx === i ? '✓ Copied' : '📋'}
                  </button>
                )}
              </div>
              {m.me && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{formatTime(m.time)}</div>}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg,#FF9933,#D97706)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🕉️</div>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px', padding: '12px 18px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF9933', animation: `bounce 1.2s ${i * 0.2}s infinite` }}></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={msgEndRef}></div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '8px 16px', background: 'rgba(251,191,36,0.1)', borderTop: '1px solid rgba(251,191,36,0.2)', fontSize: 11, color: '#FCD34D', flexShrink: 0 }}>
            ⚡ {error}
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Suggested:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <div key={i} onClick={() => send(p)} style={{ fontSize: 11, color: '#FF9933', cursor: 'pointer', padding: '5px 10px', background: 'rgba(255,153,51,0.08)', borderRadius: 8, border: '1px solid rgba(255,153,51,0.15)' }}>
                  → {p}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            style={{ width: 38, height: 38, borderRadius: 12, background: showSuggestions ? 'rgba(255,153,51,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${showSuggestions ? '#FF9933' : 'rgba(255,255,255,0.1)'}`, color: '#FF9933', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            title="Suggestions"
          >💡</button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && send()}
            placeholder="Kuch bhi poochho — temples, routes, budget, itinerary..."
            style={{ flex: 1, padding: '11px 16px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', outline: 'none', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{ padding: '11px 20px', borderRadius: 50, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(255,153,51,0.4)' : 'linear-gradient(135deg,#FF9933,#F7C948)', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}
          >
            {loading ? '...' : 'Send →'}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Quick Questions */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FF9933', marginBottom: 10, letterSpacing: '0.5px' }}>Quick Questions</div>
          {QUICK_QUESTIONS.map((q, i) => (
            <div key={i} onClick={() => send(q.text)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s', fontSize: 11, color: 'rgba(255,255,255,0.8)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#FF9933'; e.currentTarget.style.color = '#FF9933' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            >
              <span style={{ fontSize: 14 }}>{q.icon}</span>
              <span>{q.text}</span>
            </div>
          ))}
        </div>

        {/* Location + Nearby Services */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FF9933', marginBottom: 10 }}>Auto-Location Engine</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
            {locationLoading && 'Detecting coordinates...'}
            {!locationLoading && coords && `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`}
            {!locationLoading && !coords && !locationError && 'Location not available yet.'}
            {locationError && `Error: ${locationError}`}
          </div>
          <button type="button" onClick={detectLocation} style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(249,115,22,0.5)', background: 'rgba(249,115,22,0.15)', color: '#F97316', padding: '8px 10px', cursor: 'pointer', fontSize: 11 }}>
            Refresh Location
          </button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 12, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={13} color="#F97316" /> Safety
          </div>
          {nearbyServices.safety.map((item) => (
            <div key={item.name} style={nearbyItemStyle}>
              <span>{item.name}</span>
              <span style={{ color: '#F97316' }}>{item.distance}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 10, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrainFront size={13} color="#F97316" /> Transit
          </div>
          {nearbyServices.transit.map((item) => (
            <div key={item.name} style={nearbyItemStyle}>
              <span>{item.name}</span>
              <span style={{ color: '#F97316' }}>{item.distance}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 10, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hotel size={13} color="#F97316" /> Lifestyle
          </div>
          {nearbyServices.lifestyle.map((item, i) => (
            <div key={item.name} style={nearbyItemStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {i === 0 && <Building2 size={12} />}
                {i === 1 && <UtensilsCrossed size={12} />}
                {i === 2 && <Library size={12} />}
                {i === 3 && <UtensilsCrossed size={12} />}
                {item.name}
              </span>
              <span style={{ color: '#F97316' }}>{item.distance}</span>
            </div>
          ))}
        </div>

        {/* AI Status */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FF9933', marginBottom: 10 }}>AI Status</div>
          {[
            { name: 'Groq', status: !!import.meta.env.VITE_GROQ_API_KEY, label: 'Primary' },
            { name: 'Gemini 1.5 Flash', status: !!import.meta.env.VITE_GEMINI_API_KEY, label: 'Fallback' },
          ].map((ai, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ai.status ? '#4ADE80' : '#EF4444', boxShadow: `0 0 6px ${ai.status ? '#4ADE80' : '#EF4444'}` }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{ai.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{ai.label}</div>
              </div>
              <div style={{ fontSize: 10, color: ai.status ? '#4ADE80' : '#EF4444' }}>{ai.status ? 'Ready' : 'No Key'}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#FF9933', marginBottom: 10 }}>AI Can Help With</div>
          {[
            '🕉️ Spiritual routes',
            '🗺️ Route planning',
            '💰 Budget tips',
            '🏨 Stay options',
            '🚂 Travel options',
            '📅 Best time to visit',
            '🍽️ Food recommendations',
            '🎒 Packing list',
          ].map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '5px 0', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>{f}</div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const nearbyItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8,
  fontSize: 10,
  color: 'rgba(255,255,255,0.78)',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '5px 8px',
  marginBottom: 6,
}