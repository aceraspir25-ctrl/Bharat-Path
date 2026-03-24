import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './Subscription.css'

export default function Subscription() {
  const [particles, setParticles] = useState([])
  const [upiModal, setUpiModal] = useState({ open: false, plan: '', amount: 0 })
  const [txnId, setTxnId] = useState('')

  const UPI_ID = "shashankm887@okicici"
  const MERCHANT_NAME = "BharatPath Subscription"

  useEffect(() => {
    // Generate particle positions dynamically
    const newParticles = Array.from({ length: 40 }).map(() => ({
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 15 + 's',
      animationDuration: (Math.random() * 10 + 10) + 's'
    }))
    setParticles(newParticles)
  }, [])

  const initiateUPI = (plan, amount) => {
    setUpiModal({ open: true, plan, amount })
  }

  const closeModal = () => {
    setUpiModal({ open: false, plan: '', amount: 0 })
    setTxnId('')
  }

  const verifyPayment = () => {
    if (txnId.length < 5) {
      alert("Please enter a valid Transaction ID (UTR) from your UPI app.")
      return
    }

    alert(`Payment Verification Request Sent for ID: ${txnId}\n\nWe will activate your plan shortly!`)
    closeModal()
  }

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${upiModal.amount}&cu=INR`

  return (
    <div className="subscription-page">
      {/* Background Lottie Elements */}
      <div className="lottie-bg">
        <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_qh5z6wqj.json" background="transparent" speed="1" loop autoplay></lottie-player>
      </div>
      <div className="lottie-bg" style={{ opacity: 0.6 }}>
        <lottie-player src="https://assets1.lottiefiles.com/packages/lf20_5spq6xqr.json" background="transparent" speed="1" loop autoplay></lottie-player>
      </div>

      <div className="particle-container">
        {particles.map((style, i) => (
          <div key={i} className="particle" style={style}></div>
        ))}
      </div>
      <div className="light-rays"></div>

      {/* Payment Modal */}
      {upiModal.open && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>&times;</button>
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="upi-logo" />
            <h3 className="modal-title">Pay via UPI</h3>
            <p className="modal-text">
              Click below to open your UPI App (GPay, PhonePe, Paytm).<br />
              Send <strong>₹{upiModal.amount}</strong> to:<br />
              <strong style={{ color: '#FFD700', fontSize: '16px' }}>{UPI_ID}</strong>
            </p>

            <a href={upiUrl} className="verify-btn" style={{ background: '#2563eb', textDecoration: 'none', display: 'block', marginBottom: '15px' }}>
              Open UPI App
            </a>

            <div style={{ borderTop: '1px solid #333', margin: '15px 0', paddingTop: '15px' }}>
              <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '10px' }}>After payment, enter Transaction ID to activate:</p>
              <div className="input-group">
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="Ex: 123456789012"
                />
              </div>
              <button className="verify-btn" onClick={verifyPayment}>I Have Paid</button>
            </div>
          </div>
        </div>
      )}

      <div className="sub-container">
        {/* Silver Card */}
        <motion.div className="sub-card silver-card" whileTap={{ scale: 0.95 }} whileHover={{ y: -10 }}>
          <div className="card-header">
            <lottie-player src="https://assets10.lottiefiles.com/packages/lf20_meqxvzwp.json" className="lottie-icon" loop autoplay></lottie-player>
            <h2 className="card-title">Silver Membership</h2>
            <div className="price">₹49<span className="period">/month</span></div>
          </div>
          <ul className="features">
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Detailed Manual Itinerary</li>
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Google News RSS Updates</li>
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Basic Budget Calculator</li>
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Ads Will Be Shown</li>
          </ul>
          <button className="cta-button" onClick={() => initiateUPI('silver', 49)}>Choose Silver</button>
        </motion.div>

        {/* Gold Card */}
        <motion.div className="sub-card gold-card" whileTap={{ scale: 0.95 }} whileHover={{ y: -10 }}>
          <div className="badge">🏆 MOST POPULAR</div>
          <div className="card-header">
            <lottie-player src="https://assets5.lottiefiles.com/packages/lf20_g8zpkqtb.json" className="lottie-icon" loop autoplay></lottie-player>
            <h2 className="card-title">Gold Membership</h2>
            <div className="price">₹99<span className="period">/month</span></div>
          </div>
          <ul className="features">
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Ad-Free Experience</li>
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Budget PDF/Excel Download</li>
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> AI Custom Itinerary</li>
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Smart Location Alerts</li>
            <li><lottie-player src="https://assets9.lottiefiles.com/packages/lf20_8jhbBq.json" className="check-lottie" loop autoplay></lottie-player> Exclusive Affiliate Deals</li>
          </ul>
          <button className="cta-button" onClick={() => initiateUPI('gold', 99)}>Get Gold Now</button>
        </motion.div>
      </div>
    </div>
  )
}
