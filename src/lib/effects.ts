import type { CardDef } from '../types'

export type LaneModifiers = {
  multAll: number;
  multFlush: number;
  multStraight: number;
  add: number; // additive
}

export function baseLaneMods(): LaneModifiers {
  return { multAll: 1, multFlush: 1, multStraight: 1, add: 0 }
}

export function accumulateOngoing(cards: CardDef[]): LaneModifiers {
  const mods = baseLaneMods()
  for (const c of cards) {
    if (!c.effect) continue
    if (c.effect.type === 'laneMult') {
      if (c.effect.scope === 'all') mods.multAll *= c.effect.mult
      if (c.effect.scope === 'flush') mods.multFlush *= c.effect.mult
      if (c.effect.scope === 'straight') mods.multStraight *= c.effect.mult
    }
    if (c.effect.type === 'laneAdd') mods.add += c.effect.add
  }
  return mods
}

export type PendingFlags = {
  energyNextTurn: number
}

export function baseFlags(): PendingFlags { return { energyNextTurn: 0 } }

export type OnRevealContext = {
  draw: (n:number)=>void;
  discard: (n:number)=>void;
  revealEarly: (stage:'flop'|'turn'|'river')=>void;
  grantEnergyNextTurn: (n:number)=>void;
  addLaneMult: (scope:'all'|'flush'|'straight', mult:number)=>void;
  addLaneAdd: (n:number)=>void;
}

export function applyOnReveal(card: CardDef, ctx: OnRevealContext) {
  const ef = card.effect
  if (!ef) return
  switch (ef.type) {
    case 'draw': ctx.draw(ef.n); break
    case 'drawThenDiscard': ctx.draw(ef.draw); ctx.discard(ef.discard); break
    case 'energyNextTurn': ctx.grantEnergyNextTurn(ef.n); break
    case 'revealEarly': ctx.revealEarly(ef.stage); break
    case 'laneMult': ctx.addLaneMult(ef.scope, ef.mult); break
    case 'laneAdd': ctx.addLaneAdd(ef.add); break
  }
}
