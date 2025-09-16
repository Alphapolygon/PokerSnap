import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Card from './components/Card'
import Lane from './components/Lane'
import { CARD_DEFS } from './config/cards'
import { shuffle } from './lib/shuffle'
import { bestFrom, labelFor, yahtzeeScore } from './lib/poker'
import type { CommunityCard, CardDef } from './types'
import { accumulateOngoing, applyOnReveal } from './lib/effects'

type LaneBoard = { flop: (CommunityCard|null)[], turn: CommunityCard|null, river: CommunityCard|null }

const SUITS = ['heart','spade','club','diamond'] as const
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'] as const

function createCommunityDeck(): CommunityCard[] {
  const deck: CommunityCard[] = []
  for (const s of SUITS) for (const r of RANKS) deck.push({ id: r + s[0], rank: r as any, suit: s as any })
  return shuffle(deck)
}
function predealBoards(deck: CommunityCard[]): LaneBoard[] {
  const lanes: LaneBoard[] = [0,1,2].map(()=>({ flop:[null,null,null], turn:null, river:null }))
  for (let i=0;i<3;i++) lanes[i].flop = [deck.pop()!, deck.pop()!, deck.pop()!]
  for (let i=0;i<3;i++) lanes[i].turn = deck.pop()!
  for (let i=0;i<3;i++) lanes[i].river = deck.pop()!
  return lanes
}

type DragState = {
  active: boolean
  card: CardDef | null
  x: number
  y: number
  over: number | null
  grabX: number
  grabY: number
}

// Ghost rendered to <body> so fixed coords match clientX/Y regardless of ancestors
function DragGhost({ drag, card }: { drag: DragState, card: CardDef }) {
  if (!drag.active || !drag.card) return null
  return createPortal(
    <div
      className="drag-ghost"
      style={{
        position: 'fixed',
        left: drag.x - drag.grabX,
        top:  drag.y - drag.grabY,
        width: 112, height: 160,
        pointerEvents: 'none',
        zIndex: 2147483647,
        transform: 'rotate(2deg)'
      }}
    >
      <Card card={card} />
    </div>,
    document.body
  )
}

export default function App() {

// Opponent (demo): mirror lanes structure but separate state
const [opponentLanes, setOpponentLanes] = useState<Record<number, CardDef[]>>({0:[],1:[],2:[]})
const [oppRevealed, setOppRevealed] = useState(false)

// Deck & FX overlay
const deckRef = useRef<HTMLDivElement|null>(null)
const [flights, setFlights] = useState<Array<{id:string, card: CardDef, x:number, y:number, dx:number, dy:number}>>([])
  // Community
  const [community] = useState(()=>predealBoards(createCommunityDeck()))
  const [revealStage, setRevealStage] = useState(0) // 0:none,1:flop,2:turn,3:river

  // Player deck
  const [shoe, setShoe] = useState<CardDef[]>(()=>shuffle([...CARD_DEFS]))
  const [discard, setDiscard] = useState<CardDef[]>([])

  // Player state
  const [hand, setHand] = useState<CardDef[]>([])
  const [lanes, setLanes] = useState<Record<number, CardDef[]>>({0:[],1:[],2:[]})
  const [selected, setSelected] = useState<CardDef|null>(null)
  const [turn, setTurn] = useState(1)
  const energyMax = Math.min(turn, 6)
  const [energy, setEnergy] = useState(1)
  const [snap, setSnap] = useState(false)

  // Drag state with grab offset
  const [drag, setDrag] = useState<DragState>({
    active:false, card:null, x:0, y:0, over:null, grabX:56, grabY:80
  })
  const moveRef = useRef<((ev: PointerEvent)=>void) | null>(null)
  const upRef   = useRef<((ev: PointerEvent)=>void) | null>(null)

  const [shakeLane, setShakeLane] = useState<number|null>(null)
  const [energyNextTurn, setEnergyNextTurn] = useState(0)

// Spawn a simple flight animation from (x,y) to (tx,ty) in viewport coords
function spawnFlight(card: CardDef, from:{x:number,y:number}, to:{x:number,y:number}){
  const id = card.id + '-' + Math.random().toString(36).slice(2)
  const dx = to.x - from.x
  const dy = to.y - from.y
  setFlights(f => [...f, { id, card, x: from.x, y: from.y, dx, dy }])
  // Remove after animation ends (~360ms)
  setTimeout(()=> setFlights(f=> f.filter(fl=> fl.id!==id)), 420)
}

  useEffect(()=> { startTurn(1) }, [])

  // Optional body class while dragging (cursor UX)
  useEffect(() => {
    const c = document.body.classList
    drag.active ? c.add('dragging') : c.remove('dragging')
  }, [drag.active])

  
//  DOM rect helpers ----
  function getViewportCenterOf(el: HTMLElement|null){
    if (!el) return { x: innerWidth - 40, y: innerHeight/2 }
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width/2, y: r.top + r.height/2 }
  }

//  Draw helpers
 ----
  function drawFromPiles(want: number, handStart: CardDef[]) {
    let h = [...handStart]
    let shoeLocal = [...shoe]
    let discardLocal = [...discard]
    while (want > 0) {
      if (shoeLocal.length === 0 && discardLocal.length > 0) {
        shoeLocal = shuffle(discardLocal)
        discardLocal = []
      }
      const c = shoeLocal.pop()
      if (!c) break
      h.push(c); want -= 1
    }
    setShoe(shoeLocal)
    setDiscard(discardLocal)
    return h
  }
  function drawTo(n: number) { setHand(prev => drawFromPiles(Math.max(0, n - prev.length), prev)) }
  
function draw(n: number){
  // visual: spawn n flights from deck to hand tray center
  const from = getViewportCenterOf(deckRef.current)
  const handTray = document.querySelector('.hand-tray') as HTMLElement | null
  const to = getViewportCenterOf(handTray)
  for (let i=0;i<n;i++){
    setTimeout(()=> {
      const c = (shoe[shoe.length-1-i]) || hand[0] || CARD_DEFS[0]
      spawnFlight(c, from, to)
    }, i*70)
  }
  setHand(prev => drawFromPiles(n, prev))
}


  function doDiscard(n:number) {
    setHand(prev => {
      const h = [...prev]
      const d = h.splice(0, n)
      setDiscard(old=>[...old, ...d])
      return h
    })
    draw(n)
  }

  function revealEarly(stage:'flop'|'turn'|'river') {
    if (stage==='flop') setRevealStage(s=> Math.max(s,1))
    if (stage==='turn') setRevealStage(s=> Math.max(s,2))
    if (stage==='river') setRevealStage(s=> Math.max(s,3))
  }

  function startTurn(n:number) {
    setTurn(n)
    setEnergy(Math.min(n,6) + energyNextTurn)
    setEnergyNextTurn(0)
    drawTo(5)
    if (n===2) setRevealStage(s=> Math.max(s,1))
    if (n===4) setRevealStage(s=> Math.max(s,2))
    if (n===6) setRevealStage(s=> Math.max(s,3))
  }

  function canPlay(card: CardDef, laneIdx: number) {
    if (energy < card.cost) return false
    if ((lanes[laneIdx] ?? []).length >= 5) return false
    return true
  }

  function commitPlay(card: CardDef, laneIdx: number) {
    setLanes(prev => ({ ...prev, [laneIdx]: [...(prev[laneIdx]||[]), card] }))
    setHand(prev => prev.filter(c => c !== card))
    setEnergy(e => Math.max(0, e - card.cost))
    setSelected(null)

// FX: fly from current cursor (drag.x,drag.y) to lane center
try {
  const from = { x: drag.x, y: drag.y }
  const laneEl = document.querySelector(`[data-lane="${laneIdx}"]`) as HTMLElement | null
  const to = getViewportCenterOf(laneEl)
  spawnFlight(card, from, to)
} catch {}

    // Centralized effect engine
    applyOnReveal(card, {
      draw: (n)=> draw(n),
      discard: (n)=> doDiscard(n),
      revealEarly: (stage)=> revealEarly(stage),
      grantEnergyNextTurn: (n)=> setEnergyNextTurn(v=> v + n),
      addLaneMult: (_scope, _mult)=> { /* ongoing handled in accumulateOngoing */ },
      addLaneAdd: (_n)=> { /* ongoing handled in accumulateOngoing */ },
    })
  }

  function triggerShake(idx:number){ setShakeLane(idx); setTimeout(()=>setShakeLane(null), 250) }

  // cleanupDrag is component-scope so laneDrop and dragUp can both call it
  function cleanupDrag() {
    setDrag({ active:false, card:null, x:0, y:0, over:null, grabX:56, grabY:80 })
    if (moveRef.current) {
      window.removeEventListener('pointermove', moveRef.current)
      moveRef.current = null
    }
    if (upRef.current) {
      window.removeEventListener('pointerup', upRef.current)
      upRef.current = null
    }
  }

  function laneEnter(i:number){ if (!drag.active) return; setDrag(d=> ({ ...d, over:i })) }
  function laneLeave(i:number){ if (!drag.active) return; setDrag(d=> ({ ...d, over: d.over===i ? null : d.over })) }
  function laneDrop(i:number){
    if (!drag.active || !drag.card) return
    if (canPlay(drag.card, i)) commitPlay(drag.card, i)
    else triggerShake(i)
    cleanupDrag()
  }

  function laneIndexFromPoint(x:number, y:number): number|null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    let n: HTMLElement | null = el;
    while (n && !n.hasAttribute('data-lane')) n = n.parentElement as HTMLElement | null;
    if (!n) return null;
    const v = Number(n.getAttribute('data-lane'));
    return Number.isFinite(v) ? v : null;
  }

  // Drag with precise grab offset + listener refs
  function handleCardPointerDown(card: CardDef, e: React.PointerEvent) {
    e.preventDefault()
    setSelected(card)

    const host = (e.currentTarget as HTMLElement)
    const rect = host.getBoundingClientRect()
    const grabX = e.clientX - rect.left
    const grabY = e.clientY - rect.top

    setDrag({ active:true, card, x:e.clientX, y:e.clientY, over:null, grabX, grabY })

    const dragMove = (ev: PointerEvent) => {
      setDrag(d => ({
        ...d,
        x: ev.clientX,
        y: ev.clientY,
        over: laneIndexFromPoint(ev.clientX, ev.clientY)
      }))
    }
    const dragUp = (ev: PointerEvent) => {
      const over = laneIndexFromPoint(ev.clientX, ev.clientY)
      if (over != null && card && canPlay(card, over)) commitPlay(card, over)
      else if (over != null) triggerShake(over)
      cleanupDrag()
    }

    moveRef.current = dragMove
    upRef.current = dragUp
    window.addEventListener('pointermove', dragMove)
    window.addEventListener('pointerup', dragUp)
  }

  function discardSelected() {
    if (!selected) return
    setHand(prev => prev.filter(c => c !== selected))
    setDiscard(d => [...d, selected!])
    setSelected(null)

// FX: fly from current cursor (drag.x,drag.y) to lane center
try {
  const from = { x: drag.x, y: drag.y }
  const laneEl = document.querySelector(`[data-lane="${laneIdx}"]`) as HTMLElement | null
  const to = getViewportCenterOf(laneEl)
  spawnFlight(card, from, to)
} catch {}
    draw(1)
  }

  
function nextTurn(){
  if (turn>=6) return
  setOppRevealed(true)
  setTimeout(()=> {
    setOppRevealed(false)
    startTurn(turn+1)
  }, 800)
}


  function revealedBoard(i:number) {
    const arr: CommunityCard[] = []
    if (revealStage>=1) arr.push(...community[i].flop as CommunityCard[])
    if (revealStage>=2 && community[i].turn) arr.push(community[i].turn!)
    if (revealStage>=3 && community[i].river) arr.push(community[i].river!)
    return arr
  }

  function laneScore(i:number) {
    const pool = [...(lanes[i]||[]), ...revealedBoard(i)]
    const evaled = bestFrom(pool)
    const base = yahtzeeScore(evaled)
    const mods = accumulateOngoing(lanes[i]||[])
    let total = base.total
    if (evaled) {
      if (evaled.cat===5) total = Math.floor(total * (mods.multFlush ?? 1))
      if (evaled.cat===4 || evaled.cat===8) total = Math.floor(total * (mods.multStraight ?? 1))
      total = Math.floor(total * (mods.multAll ?? 1))
    }
    total += (mods.add ?? 0)
    return { label: labelFor(evaled), total }
  }

  return (
    <div className="app">
      <header>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span className="pill">⚡ {energy}/{energyMax}</span>
        </div>
        <div style={{color:'#4b5563'}}>Turn {turn} / 6 • {snap? 'Stakes x2' : 'Stakes x1'}</div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn snap" onClick={()=> setSnap(s=>!s)}>{snap? 'Un-Snap':'Snap'}</button>
          <button className="btn reset" onClick={()=>{ location.reload() }}>Reset</button>
        </div>
      </header>

      <main className="lanes">
        {[0,1,2].map(i => {
          const sc = laneScore(i)
          return (
            <Lane key={i}
              idx={i}
              rule={['Flushes x2','Winner +10','Straight x2'][i]}
              board={{
                flop: revealStage>=1? community[i].flop : [null,null,null],
                turn: revealStage>=2? community[i].turn : null,
                river: revealStage>=3? community[i].river : null,
              }}
              isDragOver={drag.over===i}
              shake={shakeLane===i}
              onEnter={()=>laneEnter(i)}
              onLeave={()=>laneLeave(i)}
              onDrop={()=>laneDrop(i)}
              bestLabel={sc.label}
              scoreTotal={sc.total}
            />
          )
        })}
      </main>

      <section style={{padding:'0 12px 8px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {[0,1,2].map(i=> (
            <div key={i} style={{background:'rgba(255,255,255,.7)', border:'1px solid #e6e2d9', borderRadius:12, padding:8}}>
              <div style={{fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6}}>
                <span>🖐️</span> Your cards in Lane {i+1}
              </div>
              <div style={{display:'flex', gap:6, marginTop:4}}>
                {(lanes[i]||[]).map((c, idx) => (
                  <div className="mini" key={c.id + '@' + idx}>
                    <div className="rk">{c.rank}</div>
                    <div className="si">{suitChar(c.suit)}</div>
                  </div>
                ))}
                {(lanes[i]||[]).length===0 && <div style={{fontSize:11, color:'#9ca3af'}}>No cards played yet.</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
          <div style={{color:'#4b5563'}}>Draw pile: {shoe.length} • Discard: {discard.length}</div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={discardSelected} disabled={!selected}>🗑️ Discard</button>
            <button className="btn end" onClick={nextTurn} disabled={turn>=6}>End Turn</button>
          </div>
        </div>

        <div className="hand">
          {hand.map((c, idx) => (
            <div key={c.id + '@' + idx} style={{position:'relative'}}>
              <div style={drag.active && drag.card === c
                ? { opacity:.35, transform:'scale(.96) rotate(-2deg)', transition:'transform .1s, opacity .1s' }
                : undefined
              }>
                <Card card={c} selected={selected === c} onSelect={(x)=>setSelected(x)} onPointerDown={handleCardPointerDown} />
              </div>
            </div>
          ))}
          {hand.length===0 && <div style={{color:'#6b7280'}}>Drawing…</div>}
        </div>

  {/* FX flights */}
  <div className="fx-layer">
    {flights.map(f => (
      <div key={f.id} className="fly" style={{
        left: f.x, top: f.y,
        transform: `translate(${f.dx}px, ${f.dy}px)`
      }}>
        <Card card={f.card} />
      </div>
    ))}
  </div>
</footer>


      {/* Drag ghost to <body> so it always matches clientX/Y */}
      {drag.active && drag.card && <DragGhost drag={drag} card={drag.card} />}
    </div>
  )
}

function suitChar(suit: string){ const m:Record<string,string>={heart:'♥', spade:'♠', club:'♣', diamond:'♦'}; return m[suit] || '?' }
