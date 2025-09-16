import React, { type PointerEvent } from 'react'
import { CardDef } from '../types'

export default function Card({ card, selected=false, onSelect, onPointerDown }: {
  card: CardDef,
  selected?: boolean,
  onSelect?: (c:CardDef)=>void,
  onPointerDown?: (c:CardDef, e:PointerEvent)=>void
}) {
  return (
    <div className={`card anim-pop ${selected? 'selected':''}`}
         onPointerDown={(e)=>onPointerDown?.(card, e)}
         onClick={()=>onSelect?.(card)}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontSize:18, fontWeight:800}}>{card.rank}</div>
        <div className="si">{suitIcon(card.suit)}</div>
      </div>
      <div className="art">Art</div>
      <div style={{fontSize:10, textAlign:'center'}}>{card.text}</div>
      <div style={{display:'flex', justifyContent:'center'}}>
        <span className="pill">⚡ {card.cost}</span>
      </div>
    </div>
  )
}

function suitIcon(suit: string) {
  const m: Record<string,string> = { heart:'♥', spade:'♠', club:'♣', diamond:'♦' }
  return m[suit] || '?'
}
