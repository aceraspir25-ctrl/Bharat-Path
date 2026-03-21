import './Screens.css'
export default function Safety() {
  return (
    <div className="screen-wrap">
      <div className="grid2">
        <div className="card">
          <div className="card-title">Emergency Actions</div>
          {[
            {icon:'🆘',bg:'#FEE2E2',title:'SOS Alert',desc:'Trigger emergency — notify all contacts',btn:'Trigger',bc:'#DC2626',bkg:'#FEE2E2'},
            {icon:'📍',bg:'#E8FAF8',title:'Live Location Share',desc:'Share with family for 1 hour',btn:'Share',bc:'var(--teal)',bkg:'#E8FAF8'},
            {icon:'📶',bg:'#FEF9EC',title:'Offline Maps',desc:'AI cached maps — works without internet',btn:'Download',bc:'var(--teal)',bkg:'#E8FAF8'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:40,height:40,borderRadius:12,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:'var(--dark)'}}>{s.title}</div><div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{s.desc}</div></div>
              <button style={{background:s.bkg,border:`1px solid ${s.bc}`,color:s.bc,borderRadius:20,padding:'5px 12px',fontSize:11,fontWeight:600,cursor:'pointer'}}>{s.btn}</button>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Emergency Numbers</div>
          {[
            {icon:'🚔',bg:'#FEE2E2',title:'Police',sub:'National helpline',num:'100',c:'#DC2626'},
            {icon:'🚑',bg:'#FFF0E8',title:'Ambulance',sub:'Medical emergency',num:'102',c:'#FF6B35'},
            {icon:'🚒',bg:'#FEF9EC',title:'Fire Brigade',sub:'Fire emergency',num:'101',c:'#B45309'},
            {icon:'🏨',bg:'#E8FAF8',title:'Tourist Helpline',sub:'India tourism support',num:'1363',c:'var(--teal)'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:38,height:38,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:'var(--dark)'}}>{s.title}</div><div style={{fontSize:10,color:'var(--muted)',marginTop:1}}>{s.sub}</div></div>
              <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.num}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
