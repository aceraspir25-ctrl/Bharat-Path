import { useMemo, useState } from 'react'
import './Screens.css'

const rates = { USD: 83, EUR: 90, GBP: 105, AED: 22.6 }

export default function Budget() {
  const [inrAmount, setInrAmount] = useState('5000')
  const [currency, setCurrency] = useState('USD')
  const [splitBy, setSplitBy] = useState('2')
  const [distance, setDistance] = useState('22')
  const [rateKm, setRateKm] = useState('18')
  const [days, setDays] = useState('4')
  const [dailyCap, setDailyCap] = useState('1800')

  const converted = useMemo(() => {
    const amount = Number(inrAmount) || 0
    const divisor = rates[currency] || 83
    return (amount / divisor).toFixed(2)
  }, [inrAmount, currency])

  const split = useMemo(() => {
    const amount = Number(inrAmount) || 0
    const members = Math.max(1, Number(splitBy) || 1)
    return Math.round(amount / members)
  }, [inrAmount, splitBy])

  const localFare = useMemo(() => Math.round((Number(distance) || 0) * (Number(rateKm) || 0)), [distance, rateKm])
  const capTotal = useMemo(() => (Number(days) || 0) * (Number(dailyCap) || 0), [days, dailyCap])

  return (
    <div className="screen-wrap" style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="neon-popup">Neon Mode Active: Budget Shield +12%</div>
      </div>

      <div className="grid4" style={{ marginBottom: 2 }}>
        {[
          { icon: '💰', val: 'Rs. 15,000', label: 'Trip Budget' },
          { icon: '📉', val: 'Rs. 8,400', label: 'Spent' },
          { icon: '💚', val: 'Rs. 6,600', label: 'Balance' },
          { icon: '📅', val: '3 Days', label: 'Left' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.2)' }}>{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">Utility Addons Hub</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={toolRow}>
              <span>INR to Currency</span>
              <input value={inrAmount} onChange={(e) => setInrAmount(e.target.value)} style={fieldStyle} />
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={fieldStyle}>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>AED</option>
              </select>
              <strong style={{ color: '#FDBA74' }}>{converted} {currency}</strong>
            </div>

            <div style={toolRow}>
              <span>Group Split</span>
              <input value={inrAmount} onChange={(e) => setInrAmount(e.target.value)} style={fieldStyle} />
              <input value={splitBy} onChange={(e) => setSplitBy(e.target.value)} style={fieldStyle} />
              <strong style={{ color: '#4ADE80' }}>Rs. {split}/person</strong>
            </div>

            <div style={toolRow}>
              <span>Local Fare Estimator</span>
              <input value={distance} onChange={(e) => setDistance(e.target.value)} style={fieldStyle} />
              <input value={rateKm} onChange={(e) => setRateKm(e.target.value)} style={fieldStyle} />
              <strong style={{ color: '#60A5FA' }}>Rs. {localFare}</strong>
            </div>

            <div style={toolRow}>
              <span>Daily Cap Planner</span>
              <input value={days} onChange={(e) => setDays(e.target.value)} style={fieldStyle} />
              <input value={dailyCap} onChange={(e) => setDailyCap(e.target.value)} style={fieldStyle} />
              <strong style={{ color: '#FBBF24' }}>Rs. {capTotal}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Smart Expense Insights</div>
          {[
            ['Hotel (3 nights)', '-Rs. 4,800', '#F97316'],
            ['Train Tickets', '-Rs. 970', '#FB7185'],
            ['Food and Dining', '-Rs. 1,800', '#FBBF24'],
            ['Local Transport', '-Rs. 830', '#60A5FA'],
            ['Projected Savings', '+Rs. 1,250', '#4ADE80'],
          ].map(([label, amount, color]) => (
            <div key={label} style={expenseRow}>
              <span>{label}</span>
              <strong style={{ color }}>{amount}</strong>
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              borderRadius: 12,
              padding: 12,
              border: '1px solid rgba(249,115,22,0.28)',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(15,23,42,0.68))',
              fontSize: 12,
              color: 'rgba(255,255,255,0.84)',
              lineHeight: 1.6,
            }}
          >
            AI Suggestion: Shift one premium stay to a trusted dharamshala + pre-book local commute. Estimated savings: <strong style={{ color: '#FDBA74' }}>Rs. 1,200 to Rs. 1,800</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}

const fieldStyle = {
  background: 'rgba(15,23,42,0.8)',
  border: '1px solid rgba(148,163,184,0.24)',
  borderRadius: 10,
  color: '#E2E8F0',
  padding: '7px 10px',
  width: 92,
  fontSize: 12,
  outline: 'none',
}

const toolRow = {
  display: 'grid',
  gridTemplateColumns: '1.4fr repeat(2,auto) 1fr',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  color: '#E2E8F0',
  background: 'rgba(15,23,42,0.5)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: 10,
  padding: '8px 10px',
}

const expenseRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '9px 0',
  borderBottom: '1px solid rgba(148,163,184,0.2)',
  fontSize: 12,
  color: '#E2E8F0',
}
