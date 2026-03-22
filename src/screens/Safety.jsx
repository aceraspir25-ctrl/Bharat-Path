import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './Screens.css'

// ─── EMERGENCY CONTACTS ───────────────────────────────────
const EMERGENCY_NUMBERS = [
  { name: 'Police', number: '100', icon: '🚔', color: '#1A6BCC', bg: '#E8F0FF', desc: 'National helpline' },
  { name: 'Ambulance', number: '102', icon: '🚑', color: '#CC1A1A', bg: '#FFE8E8', desc: 'Medical emergency' },
  { name: 'Fire Brigade', number: '101', icon: '🚒', color: '#CC6B1A', bg: '#FFF0E0', desc: 'Fire emergency' },
  { name: 'Tourist Helpline', number: '1363', icon: '🏛️', color: '#1A9E8F', bg: '#E8FAF8', desc: 'India tourism support' },
  { name: 'Cyber Crime', number: '1930', icon: '💻', color: '#7C3AED', bg: '#F3F0FF', desc: 'Online fraud & crime' },
  { name: 'Women Helpline', number: '1091', icon: '👩', color: '#DB2777', bg: '#FFF0F7', desc: '24/7 women safety' },
  { name: 'Child Helpline', number: '1098', icon: '👶', color: '#059669', bg: '#ECFDF5', desc: 'Child in distress' },
  { name: 'Disaster Mgmt', number: '108', icon: '⚠️', color: '#D97706', bg: '#FFFBEB', desc: 'Natural disasters' },
]

const CYBER_CRIME_EMAIL = 'cybercrime@police.gov.in'

export default function Safety() {
  const { user } = useAuth()
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [sosActive, setSosActive] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [sending, setSending] = useState(false)
  const [shareActive, setShareActive] = useState(false)
  const [tab, setTab] = useState('emergency')

  // Get location on mount
  useEffect(() => {
    getLocation()
  }, [])

  // Countdown timer for SOS
  useEffect(() => {
    if (!sosActive) return
    if (countdown === 0) {
      triggerSOS()
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [sosActive, countdown])

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser location support nahi hai')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
      }),
      err => setLocationError('Location access denied — manually enable karo'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const getMapsLink = () => {
    if (!location) return null
    return `https://maps.google.com/?q=${location.lat},${location.lng}`
  }

  // ── TRIGGER SOS ──────────────────────────────────────────
  const triggerSOS = async () => {
    setSending(true)
    const mapsLink = getMapsLink()
    const locText = mapsLink
      ? `📍 Location: ${mapsLink}`
      : '📍 Location: Not available'

    const message = `🆘 EMERGENCY SOS from BharatPath!\n\nUser: ${user?.displayName || 'Unknown'}\nEmail: ${user?.email || 'Unknown'}\n${locText}\nTime: ${new Date().toLocaleString('en-IN')}\n\nPlease respond immediately!`

    try {
      // Save to Firestore
      await addDoc(collection(db, 'sosAlerts'), {
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Unknown',
        userEmail: user?.email || 'Unknown',
        location: location || null,
        mapsLink: mapsLink || null,
        message,
        sentAt: serverTimestamp(),
        status: 'active',
      })

      // Try SMS via tel: link (mobile pe kaam karta hai)
      // Open Police on mobile
      if (/Mobi/i.test(navigator.userAgent)) {
        window.location.href = `sms:100?body=${encodeURIComponent(message)}`
      }

      setSosSent(true)
      setSosActive(false)
      setCountdown(5)
    } catch (e) {
      console.error('SOS error:', e)
    }
    setSending(false)
  }

  const cancelSOS = () => {
    setSosActive(false)
    setCountdown(5)
  }

  const startSOS = () => {
    setSosActive(true)
    setCountdown(5)
    setSosSent(false)
  }

  // ── REPORT CYBER CRIME ───────────────────────────────────
  const reportCyberCrime = () => {
    const mapsLink = getMapsLink()
    const subject = encodeURIComponent('Cyber Crime Report — BharatPath User')
    const body = encodeURIComponent(
      `Cyber Crime Report\n\nReported by: ${user?.displayName || 'Unknown'}\nEmail: ${user?.email || 'Unknown'}\n${mapsLink ? `Location: ${mapsLink}` : ''}\nTime: ${new Date().toLocaleString('en-IN')}\n\nPlease describe your incident below:\n[DESCRIBE YOUR ISSUE HERE]`
    )
    window.open(`mailto:${CYBER_CRIME_EMAIL}?subject=${subject}&body=${body}`)
  }

  // ── SHARE LOCATION ───────────────────────────────────────
  const shareLocation = async () => {
    const mapsLink = getMapsLink()
    if (!mapsLink) { alert('Location allow karo pehle!'); return }

    const shareText = `📍 Meri current location:\n${mapsLink}\n\n— ${user?.displayName || 'BharatPath User'}`

    if (navigator.share) {
      await navigator.share({ title: 'My Location', text: shareText, url: mapsLink })
    } else {
      await navigator.clipboard.writeText(shareText)
      alert('✅ Location link copied! Kisi ko bhi bhej do.')
    }
    setShareActive(true)
    setTimeout(() => setShareActive(false), 3000)
  }

  // ── CALL EMERGENCY ───────────────────────────────────────
  const callNumber = (number) => {
    window.location.href = `tel:${number}`
  }

  const tabs = [
    { id: 'emergency', label: '🆘 Emergency' },
    { id: 'report', label: '📋 Report Crime' },
    { id: 'tips', label: '💡 Safety Tips' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: '-24px -28px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#CC1A1A,#991414)',
        padding: '20px 24px 16px', flexShrink: 0
      }}>
        <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
          🛡️ Safety Center
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
          Emergency help, crime reporting & safety tools
        </div>

        {/* Location status */}
        <div style={{
          marginTop: 12, background: 'rgba(255,255,255,0.15)',
          borderRadius: 10, padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 16 }}>{location ? '📍' : '⚠️'}</span>
          <span style={{ fontSize: 12, color: '#fff' }}>
            {location
              ? `Location active — ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} (±${location.accuracy}m)`
              : locationError || 'Location loading...'
            }
          </span>
          {!location && (
            <button onClick={getLocation} style={{
              marginLeft: 'auto', padding: '4px 10px', borderRadius: 8,
              background: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color: '#CC1A1A',
              fontFamily: 'DM Sans,sans-serif'
            }}>Enable</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: '#fff',
        borderBottom: '1px solid var(--border)', flexShrink: 0
      }}>
        {tabs.map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '11px 20px', fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? '#CC1A1A' : 'var(--muted)',
            borderBottom: `2.5px solid ${tab === t.id ? '#CC1A1A' : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}>{t.label}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* ── EMERGENCY TAB ── */}
        {tab === 'emergency' && (
          <div>
            {/* SOS Button */}
            <div style={{
              background: '#fff', border: '2px solid #CC1A1A',
              borderRadius: 20, padding: 24, textAlign: 'center', marginBottom: 20
            }}>
              {sosSent ? (
                <div>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#059669', marginBottom: 6 }}>
                    SOS Alert Sent!
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                    Teri location aur details emergency services ko bhej di gayi hai
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={() => callNumber('100')} style={{
                      padding: '10px 20px', borderRadius: 20, background: '#CC1A1A',
                      color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      fontFamily: 'DM Sans,sans-serif'
                    }}>📞 Call Police (100)</button>
                    <button onClick={() => setSosSent(false)} style={{
                      padding: '10px 20px', borderRadius: 20, background: '#eee',
                      color: '#666', border: 'none', cursor: 'pointer', fontSize: 13,
                      fontFamily: 'DM Sans,sans-serif'
                    }}>Reset</button>
                  </div>
                </div>
              ) : sosActive ? (
                <div>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: '#CC1A1A', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, fontWeight: 900, margin: '0 auto 16px',
                    animation: 'pulse-sos 1s infinite',
                    boxShadow: '0 0 0 10px rgba(204,26,26,0.2)'
                  }}>
                    {countdown}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#CC1A1A', marginBottom: 6 }}>
                    SOS {countdown} seconds mein send hoga...
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                    Police + Cyber Crime ko teri location bhej raha hai
                  </div>
                  <button onClick={cancelSOS} style={{
                    padding: '12px 32px', borderRadius: 20, background: '#eee',
                    color: '#333', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans,sans-serif'
                  }}>✕ Cancel</button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={startSOS}
                    style={{
                      width: 120, height: 120, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#CC1A1A,#991414)',
                      color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 900, fontFamily: 'DM Sans,sans-serif',
                      boxShadow: '0 8px 32px rgba(204,26,26,0.4)',
                      transition: 'all 0.2s', margin: '0 auto 16px', display: 'block',
                      letterSpacing: 1
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🆘<br />SOS
                  </button>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                    Emergency SOS Button
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                    Press karo — 5 second countdown ke baad<br />
                    <strong>Police + Cyber Crime</strong> ko teri location automatically bhej dega
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={shareLocation} style={{
                      padding: '9px 18px', borderRadius: 20,
                      background: shareActive ? '#059669' : '#E8FAF8',
                      color: shareActive ? '#fff' : '#1A9E8F',
                      border: `1px solid ${shareActive ? '#059669' : '#1A9E8F'}`,
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s'
                    }}>
                      {shareActive ? '✅ Copied!' : '📍 Share Location'}
                    </button>
                    <button onClick={() => callNumber('112')} style={{
                      padding: '9px 18px', borderRadius: 20,
                      background: '#FFF0E8', color: '#FF6B35',
                      border: '1px solid #FF6B35',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      fontFamily: 'DM Sans,sans-serif'
                    }}>📞 Call 112 (All Emergency)</button>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Numbers Grid */}
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 12 }}>
              Emergency Numbers
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
              {EMERGENCY_NUMBERS.map((e, i) => (
                <div key={i}
                  onClick={() => callNumber(e.number)}
                  style={{
                    background: '#fff', border: `1px solid ${e.color}22`,
                    borderRadius: 14, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={el => { el.currentTarget.style.transform = 'translateY(-2px)'; el.currentTarget.style.boxShadow = `0 4px 16px ${e.color}22` }}
                  onMouseLeave={el => { el.currentTarget.style.transform = 'none'; el.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: e.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, flexShrink: 0
                  }}>{e.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{e.desc}</div>
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 900, color: e.color,
                    fontFamily: 'Playfair Display,serif'
                  }}>{e.number}</div>
                </div>
              ))}
            </div>

            {/* Location share card */}
            {location && getMapsLink() && (
              <div style={{
                marginTop: 16, background: '#E8FAF8',
                border: '1px solid #1A9E8F', borderRadius: 14, padding: 16,
                display: 'flex', alignItems: 'center', gap: 14
              }}>
                <div style={{ fontSize: 28 }}>📍</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A9E8F', marginBottom: 4 }}>
                    Teri Current Location Active Hai
                  </div>
                  <div style={{ fontSize: 11, color: '#555' }}>
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </div>
                </div>
                <button
                  onClick={() => window.open(getMapsLink(), '_blank')}
                  style={{
                    padding: '8px 14px', borderRadius: 10, background: '#1A9E8F',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans,sans-serif'
                  }}
                >Maps →</button>
              </div>
            )}
          </div>
        )}

        {/* ── REPORT CRIME TAB ── */}
        {tab === 'report' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginBottom: 4 }}>
                📋 Crime Report Karo
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Online ya offline crime — seedha authorities ko report karo
              </div>
            </div>

            {/* Report options */}
            {[
              {
                icon: '💻', title: 'Cyber Crime Report',
                desc: 'Online fraud, hacking, harassment, fake profiles',
                color: '#7C3AED', bg: '#F3F0FF',
                action: reportCyberCrime,
                btn: 'Report via Email'
              },
              {
                icon: '🌐', title: 'National Cyber Crime Portal',
                desc: 'Official government portal — cybercrime.gov.in',
                color: '#1A6BCC', bg: '#E8F0FF',
                action: () => window.open('https://cybercrime.gov.in', '_blank'),
                btn: 'Open Portal →'
              },
              {
                icon: '🚔', title: 'Online FIR',
                desc: 'File FIR online — UP, Delhi, Maharashtra etc.',
                color: '#CC1A1A', bg: '#FFE8E8',
                action: () => window.open('https://www.trackncatch.com/', '_blank'),
                btn: 'File FIR Online →'
              },
              {
                icon: '📞', title: 'Cyber Crime Helpline',
                desc: '1930 — 24/7 cyber fraud helpline',
                color: '#059669', bg: '#ECFDF5',
                action: () => callNumber('1930'),
                btn: 'Call 1930'
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 16, padding: 18, marginBottom: 12,
                display: 'flex', gap: 14, alignItems: 'center'
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: item.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, flexShrink: 0
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
                <button onClick={item.action} style={{
                  padding: '8px 14px', borderRadius: 12, background: item.color,
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  fontFamily: 'DM Sans,sans-serif'
                }}>{item.btn}</button>
              </div>
            ))}

            {/* Location info for report */}
            {location && (
              <div style={{
                background: '#FFF8E0', border: '1px solid #F7C948',
                borderRadius: 14, padding: 14, marginTop: 8
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#B8860B', marginBottom: 6 }}>
                  💡 Report mein location include hogi:
                </div>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>
                  {getMapsLink()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SAFETY TIPS TAB ── */}
        {tab === 'tips' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginBottom: 16 }}>
              💡 Spiritual Travel Safety Tips
            </div>
            {[
              {
                category: '🕌 Temple & Religious Sites',
                tips: [
                  'Valuables temple ke bahar locker mein rakho',
                  'Authorized guides hi lo — ID check karo',
                  'Bheed mein bag aage rakho',
                  'Photography rules follow karo',
                ]
              },
              {
                category: '🚂 Train Travel',
                tips: [
                  'Bag chain se lock karo overnight trains mein',
                  'Fellow passengers ko PNR mat batao',
                  'Emergency chain sirf genuine emergency mein kheencho',
                  'Railway helpline: 139',
                ]
              },
              {
                category: '💻 Online Safety',
                tips: [
                  'Fake booking websites se bachao — sirf official sites use karo',
                  'Hotel advance payment UPI se karo — cash avoid karo',
                  'Public WiFi pe banking mat karo',
                  'Cyber fraud hua toh 1930 pe turant call karo',
                ]
              },
              {
                category: '🏔️ Trek & Adventure',
                tips: [
                  'Family ko route aur return time batao',
                  'Offline maps download karo — network nahi hota',
                  'First aid kit saath rakho hamesha',
                  'Weather forecast check karo pehle',
                ]
              },
            ].map((section, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 16, padding: 18, marginBottom: 12
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginBottom: 12 }}>
                  {section.category}
                </div>
                {section.tips.map((tip, j) => (
                  <div key={j} style={{
                    display: 'flex', gap: 8, marginBottom: 8,
                    padding: '6px 0', borderBottom: j < section.tips.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <span style={{ color: '#FF6B35', fontWeight: 700, flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: 13, color: '#444', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SOS pulse animation */}
      <style>{`
        @keyframes pulse-sos {
          0%, 100% { box-shadow: 0 0 0 0 rgba(204,26,26,0.4); }
          50% { box-shadow: 0 0 0 20px rgba(204,26,26,0); }
        }
      `}</style>
    </div>
  )
}