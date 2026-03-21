import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './Screens.css'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const SPIRITUAL_PLACES = [
  { id: 1, name: 'Kashi Vishwanath', city: 'Varanasi', lat: 25.3109, lng: 83.0107, type: 'temple', desc: 'Jyotirlinga — Shiva ka pavitra dham', rating: '4.9', tag: 'Spiritual' },
  { id: 2, name: 'Dashashwamedh Ghat', city: 'Varanasi', lat: 25.3047, lng: 83.0147, type: 'ghat', desc: 'Ganga Aarti ka pavitra sthal', rating: '4.8', tag: 'Ghat' },
  { id: 3, name: 'Triveni Sangam', city: 'Prayagraj', lat: 25.4358, lng: 81.8463, type: 'river', desc: 'Teen nadiyon ka pavitra milan', rating: '4.9', tag: 'Sacred' },
  { id: 4, name: 'Kedarnath Temple', city: 'Kedarnath', lat: 30.7346, lng: 79.0669, type: 'temple', desc: 'Char Dham — Himalaya mein Shiva', rating: '5.0', tag: 'Char Dham' },
  { id: 5, name: 'Ram Janmabhoomi', city: 'Ayodhya', lat: 26.7952, lng: 82.1942, type: 'temple', desc: 'Shri Ram ki janmabhoomi', rating: '5.0', tag: 'Sacred' },
  { id: 6, name: 'Laxman Jhula', city: 'Rishikesh', lat: 30.1273, lng: 78.3217, type: 'heritage', desc: 'Ganga ke upar iconic bridge', rating: '4.7', tag: 'Heritage' },
  { id: 7, name: 'Triveni Ghat', city: 'Rishikesh', lat: 30.1087, lng: 78.2991, type: 'ghat', desc: 'Rishikesh ki Ganga Aarti', rating: '4.8', tag: 'Ghat' },
  { id: 8, name: 'Tirupati Balaji', city: 'Tirupati', lat: 13.6288, lng: 79.4192, type: 'temple', desc: 'Saat pahaadiyon pe Balaji ka dham', rating: '4.9', tag: 'Spiritual' },
  { id: 9, name: 'Golden Temple', city: 'Amritsar', lat: 31.6200, lng: 74.8765, type: 'temple', desc: 'Sikkhon ka pavitra Harmandir Sahib', rating: '5.0', tag: 'Sacred' },
  { id: 10, name: 'Vaishno Devi', city: 'Katra', lat: 33.0298, lng: 74.9480, type: 'temple', desc: 'Mata Vaishno Devi ka dham', rating: '4.9', tag: 'Spiritual' },
  { id: 11, name: 'Somnath Temple', city: 'Somnath', lat: 20.8880, lng: 70.4015, type: 'temple', desc: 'Pahela Jyotirlinga — Arabian Sea ke paas', rating: '4.8', tag: 'Jyotirlinga' },
  { id: 12, name: 'Badrinath Temple', city: 'Badrinath', lat: 30.7433, lng: 79.4938, type: 'temple', desc: 'Char Dham — Vishnu ka dham', rating: '5.0', tag: 'Char Dham' },
]

const TYPE_COLORS = {
  temple: '#FF6B35',
  ghat: '#1A9E8F',
  river: '#2563EB',
  heritage: '#7C3AED',
}

function createIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function FlyTo({ position }) {
  const map = useMap()
  if (position) map.flyTo(position, 13, { duration: 1.2 })
  return null
}

export default function MapView() {
  const [filter, setFilter] = useState('all')
  const [flyTo, setFlyTo] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filteredPlaces = filter === 'all'
    ? SPIRITUAL_PLACES
    : SPIRITUAL_PLACES.filter(p => p.type === filter)

  const goToPlace = (place) => {
    setFlyTo([place.lat, place.lng])
    setTimeout(() => setFlyTo(null), 2000)
  }

  const planRoute = () => {
    if (!from || !to) return
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`
    window.open(url, '_blank')
  }

  return (
    <div className="map-screen">
      {/* LEFT — Map */}
      <div className="map-left">
        {/* Filter Bar */}
        <div className="map-filters">
          {[
            { key: 'all', label: '🕉️ All' },
            { key: 'temple', label: '🛕 Temples' },
            { key: 'ghat', label: '🌊 Ghats' },
            { key: 'river', label: '💧 Rivers' },
            { key: 'heritage', label: '🏛️ Heritage' },
          ].map(f => (
            <div
              key={f.key}
              className={`map-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </div>
          ))}
        </div>

        {/* Map */}
        <MapContainer
          center={[22.5937, 80.9629]}
          zoom={5}
          style={{ flex: 1, width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {flyTo && <FlyTo position={flyTo} />}

          {filteredPlaces.map(place => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createIcon(TYPE_COLORS[place.type] || '#FF6B35')}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', marginBottom: 3 }}>{place.name}</div>
                  <div style={{ fontSize: 11, color: '#8B8FA8', marginBottom: 6 }}>📍 {place.city}</div>
                  <div style={{ fontSize: 12, color: '#444', marginBottom: 8, lineHeight: 1.5 }}>{place.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ background: '#FFF0E8', color: '#FF6B35', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{place.tag}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>⭐ {place.rating}</span>
                  </div>
                  <button
                    onClick={() => setTo(place.name + ', ' + place.city)}
                    style={{ width: '100%', background: 'linear-gradient(135deg,#FF6B35,#F7C948)', color: 'white', border: 'none', borderRadius: 8, padding: '7px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Route Plan Karo →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* RIGHT — Controls */}
      <div className="map-right">
        {/* Route Planner */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-title">🗺️ Route Planner</div>
          <div style={{ marginBottom: 10 }}>
            <div className="input-label">FROM</div>
            <input
              value={from}
              onChange={e => setFrom(e.target.value)}
              placeholder="e.g. Varanasi"
              style={{ width: '100%', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontFamily: 'DM Sans,sans-serif', outline: 'none', color: 'var(--dark)' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="input-label">TO</div>
            <input
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="e.g. Rishikesh"
              style={{ width: '100%', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', fontSize: 12, fontFamily: 'DM Sans,sans-serif', outline: 'none', color: 'var(--dark)' }}
            />
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', borderRadius: 10, padding: 10 }}
            onClick={planRoute}
          >
            Plan Route →
          </button>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
            Google Maps mein route dikhega
          </div>
        </div>

        {/* Legend */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-title">Legend</div>
          {[
            ['#FF6B35', 'Temples'],
            ['#1A9E8F', 'Ghats'],
            ['#2563EB', 'Rivers'],
            ['#7C3AED', 'Heritage'],
          ].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: c, flexShrink: 0 }}></div>
              <div style={{ fontSize: 12, color: 'var(--dark)' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Places List */}
        <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">Sacred Places ({filteredPlaces.length})</div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredPlaces.map(place => (
              <div
                key={place.id}
                onClick={() => goToPlace(place)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = '#FFF8F4'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: TYPE_COLORS[place.type], flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark)' }}>{place.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{place.city}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>⭐ {place.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}