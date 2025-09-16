import type { CommunityCard, PlayedCard, Rank, Suit } from '../types'

export const SUITS: Suit[] = ['heart','spade','club','diamond']
export const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
export const RANK_VAL: Record<Rank, number> = RANKS.reduce((acc, r, i) => {
  acc[r] = i + 2;
  return acc;
}, {} as Record<Rank, number>)

export type Eval = { cat: number; kicks: number[]; five?: (PlayedCard|CommunityCard)[] }
export const CAT_NAMES = ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush']

export function combos5<T>(arr: T[]): T[][] {
  const res: T[][] = []
  const n = arr.length; if (n < 5) return res
  for (let a=0;a<n-4;a++) for (let b=a+1;b<n-3;b++) for (let c=b+1;c<n-2;c++) for (let d=c+1;d<n-1;d++) for (let e=d+1;e<n;e++) res.push([arr[a],arr[b],arr[c],arr[d],arr[e]])
  return res
}

export function eval5(cards: (PlayedCard|CommunityCard)[]): Eval {
  const ranks = cards.map(c=>RANK_VAL[c.rank]).sort((a,b)=>b-a)
  const suits = cards.map(c=>c.suit)
  const counts = new Map<number, number>(); ranks.forEach(v=>counts.set(v,(counts.get(v)||0)+1))
  const byCount = [...counts.entries()].sort((a,b)=> b[1]-a[1] || b[0]-a[0])

  // straight
  let unique = [...new Set(ranks)].sort((a,b)=>b-a)
  let straightHigh = 0
  for (let i=0;i<=unique.length-5;i++) {
    if (unique[i]-1===unique[i+1] && unique[i+1]-1===unique[i+2] && unique[i+2]-1===unique[i+3] && unique[i+3]-1===unique[i+4]) { straightHigh = unique[i]; break }
  }
  if (!straightHigh && unique.includes(14) && unique.includes(5) && unique.includes(4) && unique.includes(3) && unique.includes(2)) straightHigh = 5

  const flushSuit = SUITS.find(s => suits.filter(x=>x===s).length===5)

  if (flushSuit && straightHigh) return { cat:8, kicks:[straightHigh] }
  if (byCount[0][1]===4) return { cat:7, kicks:[byCount[0][0], byCount[1][0]] }
  if (byCount[0][1]===3 && byCount[1][1]===2) return { cat:6, kicks:[byCount[0][0], byCount[1][0]] }
  if (flushSuit) return { cat:5, kicks:ranks }
  if (straightHigh) return { cat:4, kicks:[straightHigh] }
  if (byCount[0][1]===3) {
    const kickers = unique.filter(v=>v!==byCount[0][0]).slice(0,2)
    return { cat:3, kicks:[byCount[0][0], ...kickers] }
  }
  if (byCount[0][1]===2 && byCount[1][1]===2) {
    const highPair = Math.max(byCount[0][0], byCount[1][0])
    const lowPair = Math.min(byCount[0][0], byCount[1][0])
    const kicker = unique.filter(v=>v!==highPair && v!==lowPair)[0]
    return { cat:2, kicks:[highPair, lowPair, kicker] }
  }
  if (byCount[0][1]===2) {
    const kickers = unique.filter(v=>v!==byCount[0][0]).slice(0,3)
    return { cat:1, kicks:[byCount[0][0], ...kickers] }
  }
  return { cat:0, kicks:ranks }
}

export function bestFrom(cards: (PlayedCard|CommunityCard)[]): Eval|null {
  if (!cards || cards.length < 5) return null
  let best: Eval & { five?: (PlayedCard|CommunityCard)[] } | null = null
  for (const five of combos5(cards)) {
    const e = eval5(five)
    if (!best) { best = { ...e, five }; continue }
    const cmp = compareEval(e, best)
    if (cmp > 0) best = { ...e, five }
  }
  return best
}

export function compareEval(a: Eval, b: Eval): number {
  if (a.cat !== b.cat) return a.cat - b.cat
  const len = Math.max(a.kicks.length, b.kicks.length)
  for (let i=0;i<len;i++) {
    const va = a.kicks[i]||0, vb = b.kicks[i]||0
    if (va !== vb) return va - vb
  }
  return 0
}

export function labelFor(e: Eval|null): string {
  if (!e) return '—'
  const name = CAT_NAMES[e.cat]
  if (e.cat===4 || e.cat===8) {
    // map kick value back to rank
    const entry = Object.entries(RANK_VAL).find(([,n])=>n===e.kicks[0])
    return `${name} to ${entry?.[0] ?? e.kicks[0]}`
  }
  return name
}

// Yahtzee-style scoring: category base dominates, sum of ranks as tie-breaker
const YAHTZEE_BASE = [0,10,20,30,40,45,50,60,80]
export function yahtzeeScore(e: Eval|null): { base:number, sum:number, total:number } {
  if (!e) return { base:0, sum:0, total:0 }
  const base = YAHTZEE_BASE[e.cat]
  const sum = (e.five ?? []).reduce((acc,c)=> acc + RANK_VAL[c.rank], 0)
  return { base, sum, total: base*100 + sum }
}
