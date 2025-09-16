import type { CommunityCard, CardDef } from '../types'

export default function Lane({ idx, rule, board, isDragOver, shake, onEnter, onLeave, onDrop, bestLabel, scoreTotal } : {
  idx: number,
  rule: string,
  board: { flop: (CommunityCard|null)[]; turn: CommunityCard|null; river: CommunityCard|null },
  isDragOver: boolean,
  shake: boolean,
  onEnter: ()=>void,
  onLeave: ()=>void,
  onDrop: ()=>void,
  bestLabel: string,
  scoreTotal: number,
    
}) {
  return (
    <div className={`lane ${isDragOver? 'drag-over':''} ${shake? 'shake':''}`}
         onPointerEnter={onEnter}
         onPointerLeave={onLeave}
         onPointerUp={onDrop}
    >
      <div className="row" style={{justifyContent:'space-between', fontWeight:600, fontSize:14, padding:'0 4px'}}>
        <div>Lane {idx+1}</div>
        <div style={{fontSize:12, color:'#6b7280', maxWidth:'60%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{rule}</div>
      </div>
      <div className="row community">
        {board.flop.map((c,i)=> <Mini key={`flop-${i}`} c={c ?? null} />)}
        <Mini key='turn' c={board.turn} />
        <Mini key='river' c={board.river} />
      </div>
      <div className="score">
        <div><strong>Your best:</strong> {bestLabel}</div>
        <div><strong>Score:</strong> {scoreTotal}</div>
      </div>
    </div>
  )
}

function Mini({ c }:{ c: CommunityCard|null }) {
  if (!c) return <div className="mini" />
  return (
    <div className="mini">
      <div className="rk">{c.rank}</div>
      <div className="si">{suitChar(c.suit)}</div>
    </div>
  )
}
function suitChar(suit: string){ const m:Record<string,string>={heart:'♥', spade:'♠', club:'♣', diamond:'♦'}; return m[suit] || '?' }
