import { useMemo, useState, useRef } from 'react'

/* ─────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────── */
const RATES = { USD: 83.5, EUR: 90.2, GBP: 105.6, AED: 22.7, JPY: 0.56, SGD: 62.1 }
const GST_RATES = { '0%': 0, '5%': 5, '12%': 12, '18%': 18, '28%': 28 }
const EXPENSE_CATS = ['Accommodation', 'Transport', 'Food & Dining', 'Entertainment', 'Medical', 'Shopping', 'Office', 'Miscellaneous']

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtINR = (n) => `₹${fmt(n)}`
const today = () => new Date().toISOString().split('T')[0]
const invoiceNo = () => `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

const COLORS = {
  primary: '#F97316',
  success: '#22C55E',
  danger: '#EF4444',
  info: '#60A5FA',
  warning: '#FBBF24',
  purple: '#A78BFA',
  cyan: '#22D3EE',
  bg: 'rgba(15,23,42,0.95)',
  card: 'rgba(15,23,42,0.85)',
  border: 'rgba(148,163,184,0.18)',
  text: '#E2E8F0',
  muted: 'rgba(148,163,184,0.7)',
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

// Progress Bar
const ProgressBar = ({ pct, color = COLORS.primary, height = 7 }) => (
  <div style={{ background: 'rgba(148,163,184,0.15)', borderRadius: 99, height, overflow: 'hidden', width: '100%' }}>
    <div
      style={{
        width: `${Math.min(100, pct)}%`,
        height: '100%',
        background: pct > 90 ? COLORS.danger : pct > 70 ? COLORS.warning : color,
        borderRadius: 99,
        transition: 'width 0.6s ease',
        boxShadow: `0 0 8px ${pct > 90 ? COLORS.danger : color}88`,
      }}
    />
  </div>
)

// Stat Card
const StatCard = ({ icon, value, label, color = COLORS.primary, sub }) => (
  <div style={{
    background: COLORS.card,
    border: `1px solid ${color}33`,
    borderRadius: 16,
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 4,
    boxShadow: `0 0 18px ${color}11`,
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`, borderRadius: '0 16px 0 100%' }} />
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: 0.5 }}>{value}</div>
    <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
    {sub && <div style={{ fontSize: 10, color: COLORS.muted }}>{sub}</div>}
  </div>
)

// Badge
const Badge = ({ children, color = COLORS.primary }) => (
  <span style={{
    background: `${color}22`, color, border: `1px solid ${color}55`,
    borderRadius: 99, padding: '2px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
  }}>{children}</span>
)

// Section Header
const SectionHeader = ({ icon, title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 3, height: 22, background: `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.warning})`, borderRadius: 99 }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon && <span>{icon}</span>} {title}
        </div>
        {subtitle && <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
)

/* ─────────────────────────────────────────────
   TABS
───────────────────────────────────────────── */
const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'expenses', label: '🧾 Expenses' },
  { id: 'invoice', label: '📄 Invoice' },
  { id: 'ledger', label: '📒 Ledger' },
  { id: 'tools', label: '🛠️ Tools' },
]

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Budget() {
  const [tab, setTab] = useState('dashboard')

  // Budget state
  const [totalBudget, setTotalBudget] = useState(50000)
  const [expenses, setExpenses] = useState([
    { id: 1, date: '2025-06-01', desc: 'Hotel Deluxe (3 Nights)', cat: 'Accommodation', amount: 12000, gst: '12%', paid: true, payMode: 'Card' },
    { id: 2, date: '2025-06-02', desc: 'Train Tickets (2 pax)', cat: 'Transport', amount: 2450, gst: '5%', paid: true, payMode: 'UPI' },
    { id: 3, date: '2025-06-02', desc: 'Restaurant Dinner', cat: 'Food & Dining', amount: 3800, gst: '18%', paid: true, payMode: 'Cash' },
    { id: 4, date: '2025-06-03', desc: 'Cab Local Transport', cat: 'Transport', amount: 1200, gst: '5%', paid: false, payMode: 'UPI' },
    { id: 5, date: '2025-06-03', desc: 'Museum Entry Tickets', cat: 'Entertainment', amount: 800, gst: '0%', paid: true, payMode: 'Cash' },
    { id: 6, date: '2025-06-04', desc: 'Pharmacy & Medical', cat: 'Medical', amount: 650, gst: '12%', paid: true, payMode: 'Card' },
  ])

  // New expense form
  const [newExp, setNewExp] = useState({ date: today(), desc: '', cat: 'Transport', amount: '', gst: '18%', payMode: 'UPI' })

  // Invoice state
  const [invoice, setInvoice] = useState({
    no: invoiceNo(),
    date: today(),
    dueDate: '',
    fromName: 'Wanderlust Travel Co.',
    fromGST: '27AABCU9603R1ZM',
    fromPAN: 'AABCU9603R',
    fromAddr: '301, Orbit Mall, Andheri West, Mumbai – 400053',
    fromPhone: '+91 98765 43210',
    fromEmail: 'billing@wanderlust.in',
    toName: '',
    toGST: '',
    toPAN: '',
    toAddr: '',
    toPhone: '',
    toEmail: '',
    items: [
      { desc: 'Hotel Accommodation (3 Nights, Deluxe Room)', qty: 3, rate: 4000, gst: '12%' },
      { desc: 'Train Tickets – Mumbai to Goa (2 Passengers)', qty: 2, rate: 1225, gst: '5%' },
      { desc: 'Tour Guide Services (Full Day)', qty: 1, rate: 3500, gst: '18%' },
    ],
    notes: 'Payment due within 15 days. NEFT/UPI accepted.\nBank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234',
    terms: 'GST registered under CGST/SGST. E&OE.',
    showPreview: false,
  })

  // Tools state
  const [tools, setTools] = useState({
    inrAmount: '10000', currency: 'USD',
    splitAmount: '15000', splitBy: '4',
    distance: '35', rateKm: '18',
    days: '5', dailyCap: '2000',
    fromCurr: 'INR', toCurr: 'USD', convertAmt: '50000',
  })

  /* ── Derived ── */
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses])
  const totalGSTpaid = useMemo(() => expenses.reduce((s, e) => {
    const gPct = GST_RATES[e.gst] || 0
    return s + (Number(e.amount) * gPct) / (100 + gPct)
  }, 0), [expenses])
  const balance = totalBudget - totalSpent
  const pctSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const catBreakdown = useMemo(() => {
    const map = {}
    expenses.forEach(e => { map[e.cat] = (map[e.cat] || 0) + Number(e.amount) })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [expenses])

  const invoiceCalc = useMemo(() => {
    let subtotal = 0, gstTotal = 0
    const rows = invoice.items.map(item => {
      const base = (Number(item.qty) || 0) * (Number(item.rate) || 0)
      const gstAmt = base * (GST_RATES[item.gst] || 0) / 100
      subtotal += base; gstTotal += gstAmt
      return { ...item, base, gstAmt, total: base + gstAmt }
    })
    return { rows, subtotal, gstTotal, grand: subtotal + gstTotal }
  }, [invoice.items])

  /* ── Handlers ── */
  const addExpense = () => {
    if (!newExp.desc || !newExp.amount) return
    setExpenses(prev => [...prev, { ...newExp, id: Date.now(), paid: false, amount: Number(newExp.amount) }])
    setNewExp({ date: today(), desc: '', cat: 'Transport', amount: '', gst: '18%', payMode: 'UPI' })
  }
  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id))
  const togglePaid = (id) => setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e))
  const addInvoiceItem = () => setInvoice(inv => ({ ...inv, items: [...inv.items, { desc: '', qty: 1, rate: 0, gst: '18%' }] }))
  const removeInvoiceItem = (i) => setInvoice(inv => ({ ...inv, items: inv.items.filter((_, idx) => idx !== i) }))
  const updateInvoiceItem = (i, field, val) => setInvoice(inv => ({ ...inv, items: inv.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it) }))

  /* ── Styles ── */
  const card = {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 18,
    backdropFilter: 'blur(12px)',
  }
  const input = {
    background: 'rgba(15,23,42,0.9)',
    border: `1px solid rgba(148,163,184,0.25)`,
    borderRadius: 10,
    color: COLORS.text,
    padding: '9px 12px',
    fontSize: 12,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }
  const btn = (color = COLORS.primary, size = 'md') => ({
    background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
    border: `1px solid ${color}55`,
    borderRadius: 10,
    color: '#fff',
    padding: size === 'sm' ? '5px 12px' : '9px 18px',
    fontSize: size === 'sm' ? 11 : 12,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.4,
    boxShadow: `0 3px 14px ${color}44`,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  })

  /* ════════════════════════════════════════════
     RENDER TABS
  ════════════════════════════════════════════ */

  // ── DASHBOARD ──
  const renderDashboard = () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <StatCard icon="💰" value={fmtINR(totalBudget)} label="Total Budget" color={COLORS.info} sub="Overall Trip Allocation" />
        <StatCard icon="📤" value={fmtINR(totalSpent)} label="Total Spent" color={COLORS.primary} sub={`${pctSpent.toFixed(1)}% utilized`} />
        <StatCard icon="💚" value={fmtINR(balance)} label="Balance" color={balance < 0 ? COLORS.danger : COLORS.success} sub={balance < 0 ? '⚠️ Over Budget' : '✅ On Track'} />
        <StatCard icon="🧾" value={fmtINR(totalGSTpaid)} label="GST Paid" color={COLORS.purple} sub="Input Tax Credit" />
      </div>

      {/* Budget Progress */}
      <div style={card}>
        <SectionHeader icon="📈" title="Budget Utilization" subtitle="Real-time spend tracker" action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: COLORS.muted }}>Total Budget</span>
            <input
              value={totalBudget}
              onChange={e => setTotalBudget(Number(e.target.value) || 0)}
              style={{ ...input, width: 110, textAlign: 'right' }}
              type="number"
            />
          </div>
        } />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.muted, marginBottom: 6 }}>
          <span>Spent: <strong style={{ color: COLORS.primary }}>{fmtINR(totalSpent)}</strong></span>
          <span>Remaining: <strong style={{ color: balance < 0 ? COLORS.danger : COLORS.success }}>{fmtINR(Math.abs(balance))} {balance < 0 ? '(Over)' : ''}</strong></span>
          <span>Usage: <strong style={{ color: COLORS.warning }}>{pctSpent.toFixed(1)}%</strong></span>
        </div>
        <ProgressBar pct={pctSpent} color={COLORS.primary} height={10} />
      </div>

      {/* Category Breakdown + Expense List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14 }}>
        {/* Category Breakdown */}
        <div style={card}>
          <SectionHeader icon="🗂️" title="Category Analysis" subtitle="Spend by category" />
          <div style={{ display: 'grid', gap: 10 }}>
            {catBreakdown.map(([cat, amt]) => {
              const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0
              const catColors = { Accommodation: COLORS.primary, Transport: COLORS.info, 'Food & Dining': COLORS.warning, Entertainment: COLORS.purple, Medical: COLORS.success, Shopping: COLORS.cyan, Office: '#F472B6', Miscellaneous: COLORS.muted }
              const c = catColors[cat] || COLORS.info
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.text, marginBottom: 4 }}>
                    <span>{cat}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: c, fontWeight: 700 }}>{fmtINR(amt)}</span>
                      <Badge color={c}>{pct.toFixed(0)}%</Badge>
                    </div>
                  </div>
                  <ProgressBar pct={pct} color={c} height={5} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={card}>
          <SectionHeader icon="🔄" title="Recent Transactions" subtitle="Latest financial activity" action={<Badge color={COLORS.info}>{expenses.length} records</Badge>} />
          <div style={{ display: 'grid', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {expenses.slice(-5).reverse().map(e => {
              const gstAmt = (Number(e.amount) * (GST_RATES[e.gst] || 0)) / (100 + (GST_RATES[e.gst] || 0))
              return (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 12,
                  background: 'rgba(15,23,42,0.7)',
                  border: `1px solid ${e.paid ? COLORS.success + '33' : COLORS.warning + '33'}`,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{e.desc}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Badge color={COLORS.info}>{e.cat}</Badge>
                      <Badge color={COLORS.muted}>{e.payMode}</Badge>
                      <span style={{ fontSize: 10, color: COLORS.muted }}>{e.date}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.primary }}>{fmtINR(e.amount)}</span>
                    <span style={{ fontSize: 10, color: COLORS.purple }}>GST: {fmtINR(gstAmt)}</span>
                    <Badge color={e.paid ? COLORS.success : COLORS.warning}>{e.paid ? '✅ Paid' : '⏳ Pending'}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* AI Insight Banner */}
      <div style={{
        borderRadius: 16, padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(167,139,250,0.12), rgba(15,23,42,0.9))',
        border: `1px solid rgba(249,115,22,0.3)`,
        boxShadow: '0 0 24px rgba(249,115,22,0.08)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 28 }}>🤖</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary, marginBottom: 4 }}>AI Financial Advisor</div>
          <div style={{ fontSize: 11, color: COLORS.text, lineHeight: 1.6 }}>
            {pctSpent > 90
              ? `⚠️ Critical: You've used ${pctSpent.toFixed(0)}% of your budget! Consider deferring non-essential expenses and reviewing discretionary spends.`
              : pctSpent > 70
                ? `📊 Warning: ${pctSpent.toFixed(0)}% utilized. Accommodation is your top spend (${catBreakdown[0]?.[0]}). Pre-booking return transport could save ₹800–1,200.`
                : `✅ Great budgeting! ${pctSpent.toFixed(0)}% utilized. Projected savings of ${fmtINR(balance)} by end of trip. Consider investing surplus in ELSS for tax benefits under Sec 80C.`}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <span style={{ fontSize: 10, color: COLORS.muted }}>Tax Saved (Est.)</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.success }}>{fmtINR(totalGSTpaid)}</span>
          <Badge color={COLORS.success}>Input Credit</Badge>
        </div>
      </div>
    </div>
  )

  // ── EXPENSES ──
  const renderExpenses = () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Add Expense */}
      <div style={card}>
        <SectionHeader icon="➕" title="Add New Expense" subtitle="Log a transaction with GST details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.5fr 1.4fr 1fr 0.8fr 1fr auto', gap: 8, alignItems: 'end' }}>
          {[
            { label: 'Date', el: <input type="date" value={newExp.date} onChange={e => setNewExp(p => ({ ...p, date: e.target.value }))} style={input} /> },
            { label: 'Description', el: <input placeholder="Enter expense description..." value={newExp.desc} onChange={e => setNewExp(p => ({ ...p, desc: e.target.value }))} style={input} /> },
            { label: 'Category', el: <select value={newExp.cat} onChange={e => setNewExp(p => ({ ...p, cat: e.target.value }))} style={input}>{EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}</select> },
            { label: 'Amount (₹)', el: <input type="number" placeholder="0.00" value={newExp.amount} onChange={e => setNewExp(p => ({ ...p, amount: e.target.value }))} style={input} /> },
            { label: 'GST', el: <select value={newExp.gst} onChange={e => setNewExp(p => ({ ...p, gst: e.target.value }))} style={input}>{Object.keys(GST_RATES).map(r => <option key={r}>{r}</option>)}</select> },
            { label: 'Pay Mode', el: <select value={newExp.payMode} onChange={e => setNewExp(p => ({ ...p, payMode: e.target.value }))} style={input}>{['Cash', 'UPI', 'Card', 'NetBanking', 'Cheque'].map(m => <option key={m}>{m}</option>)}</select> },
          ].map(({ label, el }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
              {el}
            </div>
          ))}
          <div>
            <div style={{ fontSize: 10, color: 'transparent', marginBottom: 4 }}>.</div>
            <button onClick={addExpense} style={btn(COLORS.success)}>+ Add</button>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div style={card}>
        <SectionHeader icon="📋" title="Expense Register" subtitle="Complete financial log with GST breakdown"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge color={COLORS.success}>Paid: {fmtINR(expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0))}</Badge>
              <Badge color={COLORS.warning}>Pending: {fmtINR(expenses.filter(e => !e.paid).reduce((s, e) => s + e.amount, 0))}</Badge>
            </div>
          }
        />
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'rgba(249,115,22,0.12)' }}>
                {['#', 'Date', 'Description', 'Category', 'Base Amt', 'GST%', 'GST Amt', 'Total', 'Mode', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: COLORS.muted, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => {
                const gPct = GST_RATES[e.gst] || 0
                const base = Number(e.amount) / (1 + gPct / 100)
                const gstAmt = Number(e.amount) - base
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background 0.2s' }}>
                    <td style={{ padding: '10px 12px', color: COLORS.muted }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', color: COLORS.text, whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td style={{ padding: '10px 12px', color: COLORS.text, maxWidth: 180 }}>{e.desc}</td>
                    <td style={{ padding: '10px 12px' }}><Badge color={COLORS.info}>{e.cat}</Badge></td>
                    <td style={{ padding: '10px 12px', color: COLORS.text, textAlign: 'right', fontWeight: 600 }}>{fmtINR(base)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}><Badge color={COLORS.purple}>{e.gst}</Badge></td>
                    <td style={{ padding: '10px 12px', color: COLORS.purple, textAlign: 'right' }}>{fmtINR(gstAmt)}</td>
                    <td style={{ padding: '10px 12px', color: COLORS.primary, fontWeight: 800, textAlign: 'right' }}>{fmtINR(e.amount)}</td>
                    <td style={{ padding: '10px 12px' }}><Badge color={COLORS.cyan}>{e.payMode}</Badge></td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => togglePaid(e.id)} style={{ ...btn(e.paid ? COLORS.success : COLORS.warning, 'sm'), fontSize: 10 }}>
                        {e.paid ? '✅ Paid' : '⏳ Pending'}
                      </button>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => deleteExpense(e.id)} style={btn(COLORS.danger, 'sm')}>🗑️</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'rgba(249,115,22,0.1)', fontWeight: 800 }}>
                <td colSpan={4} style={{ padding: '12px', color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>Grand Total</td>
                <td style={{ padding: '12px', color: COLORS.text, textAlign: 'right' }}>{fmtINR(totalSpent - totalGSTpaid)}</td>
                <td />
                <td style={{ padding: '12px', color: COLORS.purple, textAlign: 'right' }}>{fmtINR(totalGSTpaid)}</td>
                <td style={{ padding: '12px', color: COLORS.primary, fontSize: 14, textAlign: 'right' }}>{fmtINR(totalSpent)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )

  // ── INVOICE ──
  const renderInvoice = () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {!invoice.showPreview ? (
        <>
          {/* Invoice Builder */}
          <div style={card}>
            <SectionHeader icon="🏢" title="Invoice Builder" subtitle="Professional GST-compliant invoice"
              action={<button onClick={() => setInvoice(p => ({ ...p, showPreview: true }))} style={btn(COLORS.primary)}>👁 Preview Invoice</button>}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* From */}
              <div style={{ display: 'grid', gap: 8, padding: 14, background: 'rgba(249,115,22,0.06)', borderRadius: 12, border: `1px solid rgba(249,115,22,0.2)` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>📤 Biller / Seller Details</div>
                {[
                  ['Business Name', 'fromName'], ['GSTIN', 'fromGST'], ['PAN', 'fromPAN'],
                  ['Address', 'fromAddr'], ['Phone', 'fromPhone'], ['Email', 'fromEmail']
                ].map(([lbl, key]) => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 3, fontWeight: 600 }}>{lbl}</div>
                    <input value={invoice[key]} onChange={e => setInvoice(p => ({ ...p, [key]: e.target.value }))} style={input} />
                  </div>
                ))}
              </div>
              {/* To */}
              <div style={{ display: 'grid', gap: 8, padding: 14, background: 'rgba(96,165,250,0.06)', borderRadius: 12, border: `1px solid rgba(96,165,250,0.2)` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.info, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>📥 Bill To / Client Details</div>
                {[
                  ['Client Name', 'toName'], ['GSTIN', 'toGST'], ['PAN', 'toPAN'],
                  ['Address', 'toAddr'], ['Phone', 'toPhone'], ['Email', 'toEmail']
                ].map(([lbl, key]) => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 3, fontWeight: 600 }}>{lbl}</div>
                    <input value={invoice[key]} onChange={e => setInvoice(p => ({ ...p, [key]: e.target.value }))} style={input} />
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 14 }}>
              {[['Invoice No.', 'no'], ['Invoice Date', 'date', 'date'], ['Due Date', 'dueDate', 'date']].map(([lbl, key, type]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>{lbl}</div>
                  <input type={type || 'text'} value={invoice[key]} onChange={e => setInvoice(p => ({ ...p, [key]: e.target.value }))} style={input} />
                </div>
              ))}
            </div>
          </div>

          {/* Line Items */}
          <div style={card}>
            <SectionHeader icon="📦" title="Line Items" subtitle="Services / Products with GST" action={<button onClick={addInvoiceItem} style={btn(COLORS.info)}>+ Add Item</button>} />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(96,165,250,0.1)' }}>
                  {['Description', 'Qty', 'Rate (₹)', 'GST%', 'Base Amt', 'GST Amt', 'Total', ''].map(h => (
                    <th key={h} style={{ padding: '9px 10px', textAlign: h === 'Description' ? 'left' : 'right', color: COLORS.muted, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoiceCalc.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '8px 10px' }}>
                      <input value={row.desc} onChange={e => updateInvoiceItem(i, 'desc', e.target.value)} style={{ ...input, minWidth: 200 }} placeholder="Item description..." />
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                      <input type="number" value={row.qty} onChange={e => updateInvoiceItem(i, 'qty', e.target.value)} style={{ ...input, width: 60, textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                      <input type="number" value={row.rate} onChange={e => updateInvoiceItem(i, 'rate', e.target.value)} style={{ ...input, width: 90, textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                      <select value={row.gst} onChange={e => updateInvoiceItem(i, 'gst', e.target.value)} style={{ ...input, width: 70 }}>
                        {Object.keys(GST_RATES).map(r => <option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: COLORS.text, fontWeight: 600 }}>{fmtINR(row.base)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: COLORS.purple }}>{fmtINR(row.gstAmt)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: COLORS.primary, fontWeight: 800 }}>{fmtINR(row.total)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <button onClick={() => removeInvoiceItem(i)} style={btn(COLORS.danger, 'sm')}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={4} style={{ padding: '10px' }} /><td colSpan={4} style={{ padding: '10px', borderTop: `2px solid ${COLORS.border}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: 220 }}><span style={{ color: COLORS.muted }}>Subtotal:</span><strong style={{ color: COLORS.text }}>{fmtINR(invoiceCalc.subtotal)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: 220 }}><span style={{ color: COLORS.muted }}>Total GST:</span><strong style={{ color: COLORS.purple }}>{fmtINR(invoiceCalc.gstTotal)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: 220, borderTop: `1px dashed ${COLORS.border}`, paddingTop: 6 }}><span style={{ color: COLORS.primary, fontWeight: 800 }}>Grand Total:</span><strong style={{ color: COLORS.primary, fontSize: 16 }}>{fmtINR(invoiceCalc.grand)}</strong></div>
                  </div>
                </td></tr>
              </tfoot>
            </table>

            {/* Notes & Terms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              {[['📝 Notes / Payment Instructions', 'notes'], ['⚖️ Terms & Conditions', 'terms']].map(([lbl, key]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>{lbl}</div>
                  <textarea value={invoice[key]} onChange={e => setInvoice(p => ({ ...p, [key]: e.target.value }))} rows={4}
                    style={{ ...input, resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ── INVOICE PREVIEW ── */
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setInvoice(p => ({ ...p, showPreview: false }))} style={btn(COLORS.muted)}>← Edit Invoice</button>
            <button onClick={() => window.print()} style={btn(COLORS.primary)}>🖨️ Print / PDF</button>
            <button onClick={() => setInvoice(p => ({ ...p, no: invoiceNo() }))} style={btn(COLORS.info)}>🔄 New Invoice No.</button>
          </div>

          {/* Professional Invoice */}
          <div style={{
            background: '#0f172a',
            border: `2px solid ${COLORS.primary}44`,
            borderRadius: 20,
            padding: '32px 36px',
            maxWidth: '860px',
            margin: '0 auto',
            width: '100%',
            boxShadow: `0 0 40px rgba(249,115,22,0.12)`,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${COLORS.primary}44`, paddingBottom: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.primary, letterSpacing: 1, marginBottom: 4 }}>TAX INVOICE</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{invoice.fromName}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.8 }}>
                  GSTIN: <strong style={{ color: COLORS.text }}>{invoice.fromGST || '—'}</strong><br />
                  PAN: <strong style={{ color: COLORS.text }}>{invoice.fromPAN || '—'}</strong><br />
                  {invoice.fromAddr}<br />
                  {invoice.fromPhone} | {invoice.fromEmail}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: `${COLORS.primary}22`, border: `1px solid ${COLORS.primary}44`, borderRadius: 12, padding: '12px 18px', display: 'inline-block' }}>
                  <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Invoice No.</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.primary }}>{invoice.no}</div>
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 10, lineHeight: 1.8 }}>
                  Date: <strong style={{ color: COLORS.text }}>{invoice.date}</strong><br />
                  {invoice.dueDate && <>Due: <strong style={{ color: COLORS.warning }}>{invoice.dueDate}</strong></>}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'rgba(96,165,250,0.08)', border: `1px solid rgba(96,165,250,0.2)`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: COLORS.info, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Bill To</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{invoice.toName || 'Client Name'}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.8 }}>
                  {invoice.toGST && <>GSTIN: <strong style={{ color: COLORS.text }}>{invoice.toGST}</strong><br /></>}
                  {invoice.toPAN && <>PAN: <strong style={{ color: COLORS.text }}>{invoice.toPAN}</strong><br /></>}
                  {invoice.toAddr}<br />
                  {invoice.toPhone} {invoice.toEmail && `| ${invoice.toEmail}`}
                </div>
              </div>
              <div style={{ background: 'rgba(34,197,94,0.06)', border: `1px solid rgba(34,197,94,0.2)`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: COLORS.success, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Payment Summary</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {[['Subtotal', fmtINR(invoiceCalc.subtotal), COLORS.text], ['Total GST', fmtINR(invoiceCalc.gstTotal), COLORS.purple], ['Amount Due', fmtINR(invoiceCalc.grand), COLORS.primary]].map(([l, v, c]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 4 }}>
                      <span style={{ fontSize: 11, color: COLORS.muted }}>{l}</span>
                      <strong style={{ fontSize: l === 'Amount Due' ? 16 : 12, color: c }}>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 24 }}>
              <thead>
                <tr style={{ background: `${COLORS.primary}18` }}>
                  {['#', 'Description of Service', 'HSN/SAC', 'Qty', 'Rate', 'Taxable Amt', 'GST%', 'GST Amt', 'Total'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 10px', textAlign: i > 2 ? 'right' : 'left', color: COLORS.muted, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, border: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoiceCalc.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '10px', color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>{i + 1}</td>
                    <td style={{ padding: '10px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>{row.desc}</td>
                    <td style={{ padding: '10px', color: COLORS.muted, border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>9985</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>{row.qty}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>{fmtINR(Number(row.rate))}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>{fmtINR(row.base)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', border: `1px solid ${COLORS.border}` }}><Badge color={COLORS.purple}>{row.gst}</Badge></td>
                    <td style={{ padding: '10px', textAlign: 'right', color: COLORS.purple, border: `1px solid ${COLORS.border}` }}>{fmtINR(row.gstAmt)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: COLORS.primary, fontWeight: 800, border: `1px solid ${COLORS.border}` }}>{fmtINR(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <div style={{ background: `${COLORS.primary}18`, border: `2px solid ${COLORS.primary}44`, borderRadius: 14, padding: '14px 22px', minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: COLORS.muted, fontSize: 12 }}>Subtotal</span>
                  <span style={{ color: COLORS.text, fontWeight: 700 }}>{fmtINR(invoiceCalc.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: COLORS.muted, fontSize: 12 }}>GST (CGST + SGST)</span>
                  <span style={{ color: COLORS.purple, fontWeight: 700 }}>{fmtINR(invoiceCalc.gstTotal)}</span>
                </div>
                <div style={{ borderTop: `2px dashed ${COLORS.primary}55`, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: COLORS.primary, fontWeight: 900, fontSize: 14 }}>TOTAL DUE</span>
                  <span style={{ color: COLORS.primary, fontWeight: 900, fontSize: 18 }}>{fmtINR(invoiceCalc.grand)}</span>
                </div>
              </div>
            </div>

            {/* Notes + Signature */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderTop: `1px dashed ${COLORS.border}`, paddingTop: 18 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.primary, textTransform: 'uppercase', marginBottom: 6 }}>Payment Details</div>
                <pre style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{invoice.notes}</pre>
                <div style={{ marginTop: 10, fontSize: 10, color: COLORS.muted }}>{invoice.terms}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 40 }}>Authorised Signatory</div>
                <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{invoice.fromName}</div>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>Chartered Accountant / Authorised Representative</div>
                  <div style={{ marginTop: 6 }}><Badge color={COLORS.success}>✅ Digitally Verified</Badge></div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: COLORS.muted, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
              This is a computer-generated invoice and does not require a physical signature • Generated via BudgetPro™
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── LEDGER ──
  const renderLedger = () => {
    let runningBalance = 0
    const ledgerRows = expenses.map(e => {
      runningBalance -= Number(e.amount)
      return { ...e, balance: totalBudget + runningBalance }
    })

    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <StatCard icon="📖" value={`${expenses.length} Entries`} label="Total Records" color={COLORS.info} />
          <StatCard icon="💳" value={fmtINR(expenses.filter(e => e.payMode === 'Card').reduce((s, e) => s + e.amount, 0))} label="Card Payments" color={COLORS.purple} />
          <StatCard icon="📲" value={fmtINR(expenses.filter(e => e.payMode === 'UPI').reduce((s, e) => s + e.amount, 0))} label="UPI Payments" color={COLORS.cyan} />
        </div>

        {/* Ledger Table */}
        <div style={card}>
          <SectionHeader icon="📒" title="Financial Ledger" subtitle="Double-entry style running balance register" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(167,139,250,0.12)' }}>
                  {['Date', 'Particulars', 'Category', 'Voucher Type', 'Dr / Cr', 'Amount', 'GST', 'Running Balance'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: COLORS.muted, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance Row */}
                <tr style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <td style={{ padding: '10px 12px', color: COLORS.muted }}>{expenses[0]?.date || today()}</td>
                  <td style={{ padding: '10px 12px', color: COLORS.success, fontWeight: 700 }}>Opening Balance</td>
                  <td colSpan={2} style={{ padding: '10px 12px', color: COLORS.muted }}>—</td>
                  <td style={{ padding: '10px 12px' }}><Badge color={COLORS.success}>Cr</Badge></td>
                  <td style={{ padding: '10px 12px', color: COLORS.success, fontWeight: 800 }}>{fmtINR(totalBudget)}</td>
                  <td style={{ padding: '10px 12px' }}>—</td>
                  <td style={{ padding: '10px 12px', color: COLORS.success, fontWeight: 800 }}>{fmtINR(totalBudget)}</td>
                </tr>
                {ledgerRows.map((e, i) => {
                  const gstAmt = (Number(e.amount) * (GST_RATES[e.gst] || 0)) / (100 + (GST_RATES[e.gst] || 0))
                  return (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? 'rgba(15,23,42,0.3)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', color: COLORS.muted, whiteSpace: 'nowrap' }}>{e.date}</td>
                      <td style={{ padding: '10px 12px', color: COLORS.text }}>{e.desc}</td>
                      <td style={{ padding: '10px 12px' }}><Badge color={COLORS.info}>{e.cat}</Badge></td>
                      <td style={{ padding: '10px 12px' }}><Badge color={COLORS.cyan}>{e.payMode}</Badge></td>
                      <td style={{ padding: '10px 12px' }}><Badge color={COLORS.danger}>Dr</Badge></td>
                      <td style={{ padding: '10px 12px', color: COLORS.danger, fontWeight: 700 }}>{fmtINR(e.amount)}</td>
                      <td style={{ padding: '10px 12px', color: COLORS.purple }}>{fmtINR(gstAmt)}</td>
                      <td style={{ padding: '10px 12px', color: e.balance >= 0 ? COLORS.success : COLORS.danger, fontWeight: 800 }}>{fmtINR(e.balance)}</td>
                    </tr>
                  )
                })}
                {/* Closing Balance */}
                <tr style={{ background: `${COLORS.primary}12`, borderTop: `2px solid ${COLORS.primary}44` }}>
                  <td colSpan={4} style={{ padding: '12px', color: COLORS.muted, fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>Closing Balance</td>
                  <td />
                  <td style={{ padding: '12px', color: COLORS.primary, fontWeight: 800 }}>{fmtINR(totalSpent)}</td>
                  <td style={{ padding: '12px', color: COLORS.purple, fontWeight: 800 }}>{fmtINR(totalGSTpaid)}</td>
                  <td style={{ padding: '12px', color: balance < 0 ? COLORS.danger : COLORS.success, fontWeight: 900, fontSize: 14 }}>{fmtINR(balance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* GST Summary */}
        <div style={card}>
          <SectionHeader icon="🏛️" title="GST Summary Statement" subtitle="Input Tax Credit breakdown by slab" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
            {Object.entries(GST_RATES).map(([rate, pct]) => {
              const slabExpenses = expenses.filter(e => e.gst === rate)
              const slabAmt = slabExpenses.reduce((s, e) => s + Number(e.amount), 0)
              const slabGST = slabAmt * pct / (100 + pct)
              return (
                <div key={rate} style={{ background: 'rgba(167,139,250,0.08)', border: `1px solid rgba(167,139,250,0.2)`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.purple }}>{rate}</div>
                  <div style={{ fontSize: 10, color: COLORS.muted, margin: '4px 0' }}>{slabExpenses.length} transactions</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{fmtINR(slabAmt)}</div>
                  <div style={{ fontSize: 11, color: COLORS.purple, marginTop: 4 }}>ITC: {fmtINR(slabGST)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── TOOLS ──
  const renderTools = () => {
    const conv = (Number(tools.inrAmount) / (RATES[tools.currency] || 83.5)).toFixed(2)
    const split = Math.round(Number(tools.splitAmount) / Math.max(1, Number(tools.splitBy)))
    const fare = Math.round(Number(tools.distance) * Number(tools.rateKm))
    const cap = Number(tools.days) * Number(tools.dailyCap)

    const fromRate = tools.fromCurr === 'INR' ? 1 : RATES[tools.fromCurr]
    const toRate = tools.toCurr === 'INR' ? 1 : RATES[tools.toCurr]
    const crossConv = ((Number(tools.convertAmt) * fromRate) / toRate).toFixed(2)

    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Currency Converter */}
          <div style={card}>
            <SectionHeader icon="💱" title="Currency Converter" subtitle="Live INR conversion rates" />
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>Amount (INR ₹)</div>
                <input type="number" value={tools.inrAmount} onChange={e => setTools(p => ({ ...p, inrAmount: e.target.value }))} style={input} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>Target Currency</div>
                <select value={tools.currency} onChange={e => setTools(p => ({ ...p, currency: e.target.value }))} style={input}>
                  {Object.keys(RATES).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ background: `${COLORS.warning}18`, border: `1px solid ${COLORS.warning}44`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>{fmtINR(Number(tools.inrAmount))} =</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.warning }}>{conv} {tools.currency}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>Rate: 1 {tools.currency} = ₹{RATES[tools.currency]}</div>
              </div>
            </div>
          </div>

          {/* Cross Currency */}
          <div style={card}>
            <SectionHeader icon="🔄" title="Cross Currency Exchange" subtitle="Convert between any two currencies" />
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>Amount</div>
                <input type="number" value={tools.convertAmt} onChange={e => setTools(p => ({ ...p, convertAmt: e.target.value }))} style={input} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'end' }}>
                <div>
                  <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>From</div>
                  <select value={tools.fromCurr} onChange={e => setTools(p => ({ ...p, fromCurr: e.target.value }))} style={input}>
                    {['INR', ...Object.keys(RATES)].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ fontSize: 18, color: COLORS.muted, paddingBottom: 6 }}>⇄</div>
                <div>
                  <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>To</div>
                  <select value={tools.toCurr} onChange={e => setTools(p => ({ ...p, toCurr: e.target.value }))} style={input}>
                    {['INR', ...Object.keys(RATES)].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ background: `${COLORS.cyan}18`, border: `1px solid ${COLORS.cyan}44`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.cyan }}>{crossConv} {tools.toCurr}</div>
              </div>
            </div>
          </div>

          {/* Group Split */}
          <div style={card}>
            <SectionHeader icon="👥" title="Group Bill Splitter" subtitle="Fair-split calculator with remainder" />
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>Total Amount (₹)</div>
                <input type="number" value={tools.splitAmount} onChange={e => setTools(p => ({ ...p, splitAmount: e.target.value }))} style={input} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4, fontWeight: 600 }}>No. of People</div>
                <input type="number" value={tools.splitBy} onChange={e => setTools(p => ({ ...p, splitBy: e.target.value }))} style={input} />
              </div>
              <div style={{ background: `${COLORS.success}18`, border: `1px solid ${COLORS.success}44`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>Each person pays</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.success }}>{fmtINR(split)}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>
                  Remainder: ₹{Number(tools.splitAmount) % Math.max(1, Number(tools.splitBy))}
                </div>
              </div>
            </div>
          </div>

          {/* Fare + Cap */}
          <div style={card}>
            <SectionHeader icon="🧮" title="Travel Calculators" subtitle="Fare estimator & daily cap planner" />
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ padding: 12, background: 'rgba(96,165,250,0.06)', borderRadius: 12, border: `1px solid rgba(96,165,250,0.2)` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.info, marginBottom: 8 }}>🚕 Fare Estimator</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>Distance (km)</div>
                    <input type="number" value={tools.distance} onChange={e => setTools(p => ({ ...p, distance: e.target.value }))} style={input} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>Rate/km (₹)</div>
                    <input type="number" value={tools.rateKm} onChange={e => setTools(p => ({ ...p, rateKm: e.target.value }))} style={input} />
                  </div>
                </div>
                <div style={{ marginTop: 8, textAlign: 'center', fontSize: 20, fontWeight: 900, color: COLORS.info }}>{fmtINR(fare)}</div>
              </div>

              <div style={{ padding: 12, background: 'rgba(251,191,36,0.06)', borderRadius: 12, border: `1px solid rgba(251,191,36,0.2)` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.warning, marginBottom: 8 }}>📅 Daily Budget Cap</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>Days</div>
                    <input type="number" value={tools.days} onChange={e => setTools(p => ({ ...p, days: e.target.value }))} style={input} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>Daily Cap (₹)</div>
                    <input type="number" value={tools.dailyCap} onChange={e => setTools(p => ({ ...p, dailyCap: e.target.value }))} style={input} />
                  </div>
                </div>
                <div style={{ marginTop: 8, textAlign: 'center', fontSize: 20, fontWeight: 900, color: COLORS.warning }}>{fmtINR(cap)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Calculator */}
        <div style={card}>
          <SectionHeader icon="🏛️" title="GST Calculator" subtitle="Forward & reverse GST computation" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
            {Object.entries(GST_RATES).filter(([, v]) => v > 0).map(([label, rate]) => {
              const base = 10000
              const gstAmt = base * rate / 100
              return (
                <div key={label} style={{ background: `${COLORS.purple}10`, border: `1px solid ${COLORS.purple}30`, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.purple, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>On ₹10,000</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, margin: '6px 0' }}>{fmtINR(gstAmt)}</div>
                  <div style={{ fontSize: 11, color: COLORS.primary }}>Total: {fmtINR(base + gstAmt)}</div>
                  <div style={{ marginTop: 6, fontSize: 10, color: COLORS.muted }}>CGST: {fmtINR(gstAmt / 2)} | SGST: {fmtINR(gstAmt / 2)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ════════════════════════════════════════════
     MAIN RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: COLORS.text, minHeight: '100vh', padding: '0 0 24px' }}>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(15,23,42,0.95))',
        borderBottom: `1px solid ${COLORS.primary}33`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.warning})`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 0 16px ${COLORS.primary}55` }}>💼</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.text, letterSpacing: 0.5 }}>BudgetPro™</div>
            <div style={{ fontSize: 10, color: COLORS.muted }}>Professional Finance & Invoice Management</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge color={COLORS.success}>✅ GST Compliant</Badge>
          <Badge color={COLORS.info}>CA / CMA Ready</Badge>
          <Badge color={COLORS.purple}>v2.0 Pro</Badge>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px', marginBottom: 16, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            ...btn(tab === t.id ? COLORS.primary : 'rgba(148,163,184,0.3)'),
            background: tab === t.id
              ? `linear-gradient(135deg, ${COLORS.primary}dd, ${COLORS.warning}88)`
              : 'rgba(15,23,42,0.6)',
            border: tab === t.id ? `1px solid ${COLORS.primary}66` : `1px solid rgba(148,163,184,0.2)`,
            boxShadow: tab === t.id ? `0 3px 14px ${COLORS.primary}44` : 'none',
            padding: '8px 18px',
            whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px' }}>
        {tab === 'dashboard' && renderDashboard()}
        {tab === 'expenses' && renderExpenses()}
        {tab === 'invoice' && renderInvoice()}
        {tab === 'ledger' && renderLedger()}
        {tab === 'tools' && renderTools()}
      </div>
    </div>
  )
}
