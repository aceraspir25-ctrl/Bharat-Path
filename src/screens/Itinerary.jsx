import { useMemo, useState } from 'react'
import './Screens.css'

const baseDays = [
  {
    n: 1,
    title: 'Varanasi - City of Light',
    desc: 'Kashi Vishwanath darshan, Dashashwamedh Ghat Aarti, sunrise boat ride, Banaras chai trail.',
    focus: 'Spiritual',
    travel: 'Walk + Local Auto',
    est: 1700,
  },
  {
    n: 2,
    title: 'Sarnath + Prayagraj Transfer',
    desc: 'Sarnath monastery circuit, museum, afternoon road transfer, evening Sangam visit.',
    focus: 'Heritage',
    travel: 'Cab / Bus',
    est: 2600,
  },
  {
    n: 3,
    title: 'Prayagraj to Rishikesh',
    desc: 'Anand Bhawan and fort point, overnight rail journey to Rishikesh.',
    focus: 'Transit',
    travel: 'Rail',
    est: 2100,
  },
  {
    n: 4,
    title: 'Rishikesh Wellness Day',
    desc: 'Morning yoga, Ganga aarti, Laxman Jhula walk, optional rafting adventure.',
    focus: 'Wellness',
    travel: 'Walk + Bike',
    est: 2300,
  },
  {
    n: 5,
    title: 'Ashram + Local Craft + Return',
    desc: 'Beatles Ashram, local shopping, temple visit, departure prep.',
    focus: 'Reflection',
    travel: 'Auto + Walk',
    est: 1800,
  },
]

const addonOptions = [
  { id: 'vip-darshan', label: 'VIP Darshan Pass', price: 900 },
  { id: 'guide', label: 'Local Spiritual Guide', price: 1600 },
  { id: 'wellness', label: 'Yoga and Meditation Session', price: 1200 },
  { id: 'pro-photo', label: 'Travel Memory Photoshoot', price: 1400 },
]

const packingListSeed = [
  { id: 'id-proof', label: 'ID Proof', checked: true },
  { id: 'meds', label: 'Medicines and First Aid', checked: false },
  { id: 'shawl', label: 'Shawl / Temple Cover', checked: false },
  { id: 'powerbank', label: 'Power Bank', checked: true },
  { id: 'water', label: 'Refillable Water Bottle', checked: false },
]

export default function Itinerary() {
  const [tripName, setTripName] = useState('Sacred Ganga Circuit')
  const [travelers, setTravelers] = useState(2)
  const [pace, setPace] = useState('balanced')
  const [activeDay, setActiveDay] = useState(1)
  const [addons, setAddons] = useState([])
  const [packing, setPacking] = useState(packingListSeed)
  const [note, setNote] = useState('')

  const dayMultiplier = pace === 'slow' ? 1.2 : pace === 'fast' ? 0.92 : 1
  const itineraryCost = useMemo(
    () => Math.round(baseDays.reduce((sum, d) => sum + d.est, 0) * travelers * dayMultiplier),
    [travelers, dayMultiplier]
  )
  const addonCost = useMemo(
    () =>
      addons.reduce((sum, id) => {
        const addon = addonOptions.find((a) => a.id === id)
        return sum + (addon?.price ?? 0)
      }, 0) * travelers,
    [addons, travelers]
  )
  const total = itineraryCost + addonCost
  const completion = Math.round((packing.filter((p) => p.checked).length / packing.length) * 100)

  const toggleAddon = (id) => {
    setAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const togglePacking = (id) => {
    setPacking((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  return (
    <div className="screen-wrap" style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="neon-popup">Neon Aura: Pilgrim Path Synced</div>
      </div>

      <div
        className="card"
        style={{
          background: 'linear-gradient(120deg, rgba(249,115,22,0.17), rgba(15,23,42,0.88))',
          border: '1px solid rgba(249,115,22,0.38)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title" style={{ marginBottom: 6 }}>AI Itinerary Command Deck</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Personalize pace, travelers, add-ons and daily flow for a premium spiritual journey.
            </div>
          </div>
          <button className="btn-primary" style={{ borderRadius: 12 }}>Regenerate with AI ✨</button>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">Trip Configurator</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <input value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="Trip name" style={fieldStyle} />
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value) || 1)}
                style={fieldStyle}
              />
              <select value={pace} onChange={(e) => setPace(e.target.value)} style={fieldStyle}>
                <option value="slow">Slow and mindful</option>
                <option value="balanced">Balanced</option>
                <option value="fast">Fast explorer</option>
              </select>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Special note: temple slots, food preference, mobility support..."
              style={{ ...fieldStyle, minHeight: 72, resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Budget and Utility Addons</div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
            {addonOptions.map((addon) => (
              <label key={addon.id} style={addonStyle}>
                <input type="checkbox" checked={addons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} />
                <span>{addon.label}</span>
                <span style={{ marginLeft: 'auto', color: '#FDBA74' }}>Rs. {addon.price}</span>
              </label>
            ))}
          </div>
          <div style={{ ...miniPanelStyle, marginBottom: 8 }}>Base Trip: Rs. {itineraryCost.toLocaleString('en-IN')}</div>
          <div style={{ ...miniPanelStyle, marginBottom: 8 }}>Addons: Rs. {addonCost.toLocaleString('en-IN')}</div>
          <div style={{ ...miniPanelStyle, color: '#FDBA74', fontWeight: 700 }}>Grand Total: Rs. {total.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">Dynamic Day Planner</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {baseDays.map((d) => (
              <button
                key={d.n}
                type="button"
                onClick={() => setActiveDay(d.n)}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${activeDay === d.n ? 'rgba(249,115,22,0.6)' : 'rgba(148,163,184,0.26)'}`,
                  background: activeDay === d.n ? 'rgba(249,115,22,0.18)' : 'rgba(15,23,42,0.7)',
                  color: '#E2E8F0',
                  padding: '6px 11px',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Day {d.n}
              </button>
            ))}
          </div>

          {baseDays
            .filter((d) => d.n === activeDay)
            .map((d) => (
              <div key={d.n} style={miniPanelStyle}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>{d.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.7 }}>{d.desc}</div>
                <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
                  <span className="tag tag-saffron">{d.focus}</span>
                  <span className="tag tag-teal">{d.travel}</span>
                  <span className="tag tag-gold">Est. Rs. {Math.round(d.est * travelers * dayMultiplier)}</span>
                </div>
              </div>
            ))}
        </div>

        <div className="card">
          <div className="card-title">Packing and Readiness Meter</div>
          <div style={{ ...miniPanelStyle, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>Readiness</span>
              <span>{completion}%</span>
            </div>
            <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: 'rgba(148,163,184,0.2)' }}>
              <div style={{ width: `${completion}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(135deg,#F97316,#F7C948)' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {packing.map((item) => (
              <label key={item.id} style={addonStyle}>
                <input type="checkbox" checked={item.checked} onChange={() => togglePacking(item.id)} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const fieldStyle = {
  width: '100%',
  background: 'rgba(15,23,42,0.78)',
  border: '1px solid rgba(148,163,184,0.25)',
  borderRadius: 10,
  padding: '9px 12px',
  color: '#F8FAFC',
  outline: 'none',
  fontSize: 12,
}

const miniPanelStyle = {
  background: 'linear-gradient(135deg, rgba(30,41,59,0.55), rgba(15,23,42,0.72))',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: 12,
  padding: '10px 12px',
}

const addonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: 'rgba(15,23,42,0.75)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 12,
  color: '#E2E8F0',
}
