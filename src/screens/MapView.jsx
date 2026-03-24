import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './Screens.css'
import { useLocation } from '../hooks/useLocation'
import { useSpiritualPlaces } from '../hooks/useSpiritualPlaces'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TYPE_MAPPING = {
  temple: { color: '#FF6B35', emoji: '🛕', label: 'Temples' },
  ghat: { color: '#2563EB', emoji: '🌊', label: 'Ghats & Rivers' },
  gurudwara: { color: '#F7C948', emoji: '🕌', label: 'Gurdwaras' },
  mosque: { color: '#10B981', emoji: '☪️', label: 'Mosques/Dargahs' },
  church: { color: '#A78BFA', emoji: '⛪', label: 'Churches' },
  heritage: { color: '#7C3AED', emoji: '🏛️', label: 'Heritage/Museums' },
}

function createEmojiIcon(type) {
  const meta = TYPE_MAPPING[type] || { color: '#FF6B35', emoji: '📍' }
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${meta.color};border:2px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);font-size:16px;">${meta.emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function FlyTo({ position }) {
  const map = useMap()
  if (position) map.flyTo(position, 13, { duration: 1.2 })
  return null
}

export default function MapView() {
  const { coords, detectLocation } = useLocation()
  const { places, loading } = useSpiritualPlaces(coords)

  const [filter, setFilter] = useState('all')
  const [flyTo, setFlyTo] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Automatically request location
  useEffect(() => {
    if (!coords) detectLocation()
    else setFlyTo([coords.latitude, coords.longitude])
  }, [coords, detectLocation])

  const filteredPlaces = filter === 'all'
    ? places
    : places.filter(p => {
        if (filter === 'ghats') return ['ghat'].includes(p.type)
        if (filter === 'museums') return ['heritage'].includes(p.type)
        return p.type === filter
      })

  const goToPlace = (place) => {
    if (!place.lat || !place.lng) return
    setFlyTo([place.lat, place.lng])
    setTimeout(() => setFlyTo(null), 2000)
  }

  const getDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
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
            { key: 'all', label: '📍 All' },
            { key: 'temple', label: '🛕 Temples' },
            { key: 'ghats', label: '🌊 Ghats & Rivers' },
            { key: 'museums', label: '🏛️ Heritage & Museums' },
            { key: 'gurudwara', label: '🕌 Gurdwaras' },
            { key: 'mosque', label: '☪️ Mosques & Dargahs' },
            { key: 'church', label: '⛪ Churches' },
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
          center={coords ? [coords.latitude, coords.longitude] : [22.5937, 80.9629]}
          zoom={coords ? 13 : 5}
          style={{ flex: 1, width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {flyTo && <FlyTo position={flyTo} />}

          {filteredPlaces.map(place => {
            if (!place.lat || !place.lng) return null;
            return (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={createEmojiIcon(place.type)}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1A2E', marginBottom: 4 }}>{place.name}</div>
                    <div style={{ fontSize: 11, color: '#8B8FA8', marginBottom: 8 }}>📍 {place.city}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ background: 'var(--cream)', color: '#FF6B35', fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'capitalize' }}>{place.type}</span>
                      <span style={{ fontSize: 13, fontWeight: 800 }}>⭐ {place.rating}</span>
                    </div>
                    <button
                      onClick={() => getDirections(place.lat, place.lng)}
                      style={{ width: '100%', background: 'linear-gradient(135deg,#FF6B35,#F7C948)', color: 'white', border: 'none', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}
                    >
                      Get Directions ↳
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          })}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.values(TYPE_MAPPING).map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{m.emoji}</div>
                <div style={{ fontSize: 11, color: 'var(--text)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Places List */}
        <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            Nearby Sacred Places {loading ? '⏳' : `(${filteredPlaces.length})`}
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: 6 }}>
            {loading && <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 20 }}>Ruhani jagahon ko khoj rahe hain...</div>}
            
            {filteredPlaces.map(place => {
              const meta = TYPE_MAPPING[place.type] || TYPE_MAPPING.temple
              return (
                <div
                  key={place.id}
                  onClick={() => goToPlace(place)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderBottom: '1px solid var(--border)', cursor: 'pointer', borderRadius: 8, transition: 'all 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: meta.color, display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {meta.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{place.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{place.city}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>⭐ {place.rating}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}