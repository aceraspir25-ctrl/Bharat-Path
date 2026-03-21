import './Topbar.css'

export default function Topbar({ title }) {
  return (
    <div className="topbar">
      <div className="tb-title">{title}</div>
      <div className="tb-search">
        <span className="tb-search-icon">🔍</span>
        <span className="tb-search-text">Search places, temples, hotels...</span>
      </div>
      <div className="tb-right">
        <div className="icon-btn">
          🔔
          <div className="notif-dot"></div>
        </div>
        <div className="sos-pill">🆘 SOS</div>
      </div>
    </div>
  )
}
