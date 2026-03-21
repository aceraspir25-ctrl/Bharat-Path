import { useState } from 'react'
import './Screens.css'

export default function Booking() {
  const [tab, setTab] = useState('hotel')
  const [hotel, setHotel] = useState({ location: '', name: '', checkin: '', checkout: '' })
  const [flight, setFlight] = useState({ from: '', to: '', date: '', passengers: '1' })
  const [train, setTrain] = useState({ from: '', to: '', date: '', class: 'SL' })
  const [activity, setActivity] = useState({ city: '', type: '' })

  const bookHotel = () => {
    if (!hotel.location) return alert('Location daalo!')
    const url = `https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.location)}&checkin=${hotel.checkin}&checkout=${hotel.checkout}`
    window.open(url, '_blank')
  }

  const bookFlight = () => {
    if (!flight.from || !flight.to) return alert('From aur To daalo!')
    const url = `https://www.goindigo.in/flight-booking.html?origin=${encodeURIComponent(flight.from)}&destination=${encodeURIComponent(flight.to)}&travelDate=${flight.date}&adult=${flight.passengers}`
    window.open(url, '_blank')
  }

  const bookTrain = () => {
    if (!train.from || !train.to) return alert('From aur To daalo!')
    const url = `https://www.irctc.co.in/nget/train-search`
    window.open(url, '_blank')
  }

  const bookActivity = () => {
    if (!activity.city) return alert('City daalo!')
    window.open(`https://www.tripadvisor.in/Search?q=${encodeURIComponent(activity.city + ' ' + activity.type)}`, '_blank')
  }

  return (
    <div className="screen-wrap">
      <div className="grid2">
        {/* Booking Form */}
        <div className="card">
          <div className="card-title">Book Your Travel</div>
          <div className="book-tabs">
            {[
              { key: 'hotel', icon: '🏨', label: 'Hotel' },
              { key: 'flight', icon: '✈️', label: 'Flight' },
              { key: 'train', icon: '🚂', label: 'Train' },
              { key: 'activity', icon: '🎭', label: 'Activity' },
            ].map(t => (
              <div key={t.key} className={`book-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>

          {/* HOTEL */}
          {tab === 'hotel' && (
            <div>
              <div className="input-group">
                <div className="input-label">DESTINATION CITY</div>
                <input
                  value={hotel.location}
                  onChange={e => setHotel({ ...hotel, location: e.target.value })}
                  placeholder="e.g. Varanasi, Rishikesh"
                  style={inputStyle}
                />
              </div>
              <div className="input-group">
                <div className="input-label">HOTEL NAME (Optional)</div>
                <input
                  value={hotel.name}
                  onChange={e => setHotel({ ...hotel, name: e.target.value })}
                  placeholder="e.g. The Taj Ganges"
                  style={inputStyle}
                />
              </div>
              <div className="grid2-sm">
                <div className="input-group">
                  <div className="input-label">CHECK IN</div>
                  <input type="date" value={hotel.checkin} onChange={e => setHotel({ ...hotel, checkin: e.target.value })} style={inputStyle} />
                </div>
                <div className="input-group">
                  <div className="input-label">CHECK OUT</div>
                  <input type="date" value={hotel.checkout} onChange={e => setHotel({ ...hotel, checkout: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button className="btn-primary" style={{ width: '100%', borderRadius: 12, padding: 11, marginTop: 4 }} onClick={bookHotel}>
                Book on Booking.com →
              </button>
            </div>
          )}

          {/* FLIGHT */}
          {tab === 'flight' && (
            <div>
              <div className="grid2-sm">
                <div className="input-group">
                  <div className="input-label">FROM CITY</div>
                  <input value={flight.from} onChange={e => setFlight({ ...flight, from: e.target.value })} placeholder="e.g. Delhi" style={inputStyle} />
                </div>
                <div className="input-group">
                  <div className="input-label">TO CITY</div>
                  <input value={flight.to} onChange={e => setFlight({ ...flight, to: e.target.value })} placeholder="e.g. Mumbai" style={inputStyle} />
                </div>
              </div>
              <div className="grid2-sm">
                <div className="input-group">
                  <div className="input-label">DATE</div>
                  <input type="date" value={flight.date} onChange={e => setFlight({ ...flight, date: e.target.value })} style={inputStyle} />
                </div>
                <div className="input-group">
                  <div className="input-label">PASSENGERS</div>
                  <select value={flight.passengers} onChange={e => setFlight({ ...flight, passengers: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn-primary" style={{ flex: 1, borderRadius: 12, padding: 11 }}
                  onClick={bookFlight}>
                  IndiGo →
                </button>
                <button className="btn-primary" style={{ flex: 1, borderRadius: 12, padding: 11, background: 'linear-gradient(135deg,#1A9E8F,#06D6A0)' }}
                  onClick={() => window.open(`https://www.airindia.com/in/en/book/flights.html`, '_blank')}>
                  Air India →
                </button>
              </div>
              <button className="btn-secondary" style={{ width: '100%', borderRadius: 12, padding: 10, marginTop: 8 }}
                onClick={() => window.open(`https://www.makemytrip.com/flights/`, '_blank')}>
                Compare on MakeMyTrip →
              </button>
            </div>
          )}

          {/* TRAIN */}
          {tab === 'train' && (
            <div>
              <div className="grid2-sm">
                <div className="input-group">
                  <div className="input-label">FROM STATION</div>
                  <input value={train.from} onChange={e => setTrain({ ...train, from: e.target.value })} placeholder="e.g. Varanasi" style={inputStyle} />
                </div>
                <div className="input-group">
                  <div className="input-label">TO STATION</div>
                  <input value={train.to} onChange={e => setTrain({ ...train, to: e.target.value })} placeholder="e.g. Prayagraj" style={inputStyle} />
                </div>
              </div>
              <div className="grid2-sm">
                <div className="input-group">
                  <div className="input-label">DATE</div>
                  <input type="date" value={train.date} onChange={e => setTrain({ ...train, date: e.target.value })} style={inputStyle} />
                </div>
                <div className="input-group">
                  <div className="input-label">CLASS</div>
                  <select value={train.class} onChange={e => setTrain({ ...train, class: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {['SL', '3A', '2A', '1A', 'CC', '2S'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-primary" style={{ width: '100%', borderRadius: 12, padding: 11, marginTop: 4 }} onClick={bookTrain}>
                Book on IRCTC →
              </button>
              <button className="btn-secondary" style={{ width: '100%', borderRadius: 12, padding: 10, marginTop: 8 }}
                onClick={() => window.open('https://www.confirmtkt.com/', '_blank')}>
                Check PNR / Status →
              </button>
            </div>
          )}

          {/* ACTIVITY */}
          {tab === 'activity' && (
            <div>
              <div className="input-group">
                <div className="input-label">CITY</div>
                <input value={activity.city} onChange={e => setActivity({ ...activity, city: e.target.value })} placeholder="e.g. Varanasi, Rishikesh" style={inputStyle} />
              </div>
              <div className="input-group">
                <div className="input-label">ACTIVITY TYPE</div>
                <select value={activity.type} onChange={e => setActivity({ ...activity, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select Type</option>
                  <option value="temple tour">Temple Tour</option>
                  <option value="river rafting">River Rafting</option>
                  <option value="yoga retreat">Yoga Retreat</option>
                  <option value="trekking">Trekking</option>
                  <option value="boat ride">Boat Ride</option>
                  <option value="spiritual tour">Spiritual Tour</option>
                </select>
              </div>
              <button className="btn-primary" style={{ width: '100%', borderRadius: 12, padding: 11, marginTop: 4 }} onClick={bookActivity}>
                Search on TripAdvisor →
              </button>
              <button className="btn-secondary" style={{ width: '100%', borderRadius: 12, padding: 10, marginTop: 8 }}
                onClick={() => window.open(`https://www.viator.com/India/${encodeURIComponent(activity.city || 'India')}/d690-ttd`, '_blank')}>
                Book on Viator →
              </button>
            </div>
          )}
        </div>

        {/* Active Bookings */}
        <div>
          <div className="section-header">
            <div className="section-title">Active Bookings</div>
            <div className="view-all">+ Add Booking</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🏨', name: 'Hotel Ganges View', sub: 'Varanasi · Mar 18–20', price: '₹2,400 · 2 nights · Ganga view', status: 'Confirmed', sc: 'teal',
                link: 'https://www.booking.com' },
              { icon: '🚂', name: '12560 Shiv Ganga Exp', sub: 'Varanasi → Prayagraj · Mar 20', price: '₹485 · Sleeper · PNR: 2847561934', status: 'Pending', sc: 'gold',
                link: 'https://www.irctc.co.in' },
              { icon: '✈️', name: 'IndiGo 6E-204', sub: 'Delhi → Mumbai · Mar 25', price: '₹3,200 · Economy · 1 Adult', status: 'Confirmed', sc: 'teal',
                link: 'https://www.goindigo.in' },
            ].map((b, i) => (
              <div key={i} className="card" style={{ padding: '14px 16px', cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
                onClick={() => window.open(b.link, '_blank')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 26 }}>{b.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.sub}</div>
                  </div>
                  <span className={`tag tag-${b.sc}`}>{b.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.price}</div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-title">Quick Book Links</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '🏨', label: 'Booking.com', url: 'https://www.booking.com', color: '#003580' },
                { icon: '✈️', label: 'MakeMyTrip', url: 'https://www.makemytrip.com', color: '#E74C3C' },
                { icon: '🚂', label: 'IRCTC', url: 'https://www.irctc.co.in', color: '#1A9E8F' },
                { icon: '🎭', label: 'TripAdvisor', url: 'https://www.tripadvisor.in', color: '#34E0A1' },
              ].map((l, i) => (
                <div key={i}
                  onClick={() => window.open(l.url, '_blank')}
                  style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ fontSize: 20 }}>{l.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark)' }}>{l.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: 'var(--cream)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '9px 14px',
  fontSize: 12,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  color: 'var(--dark)',
  boxSizing: 'border-box',
}