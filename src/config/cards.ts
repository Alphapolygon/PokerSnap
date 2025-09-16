import type { CardDef } from '../types'

// 52-card deck. Costs scale with rank. Some cards carry lane modifiers (affect scoring),
// and a few have on-reveal effects that the demo App handles explicitly.
// id scheme: rank + suit initial (h/s/c/d), e.g., 'Ah', '10c'.
export const CARD_DEFS: CardDef[] = [
  // Aces (cost 3)
  { id:'Ah', rank:'A', suit:'heart',   cost:3, text:'Ongoing: Flushes here score 2x.', effect:{ type:'laneMult', scope:'flush', mult:2 } },
  { id:'As', rank:'A', suit:'spade',   cost:3, text:'Ongoing: +10 lane points.',       effect:{ type:'laneAdd', add:10 } },
  { id:'Ac', rank:'A', suit:'club',    cost:3, text:'On Reveal: Draw 2. (+1 energy next turn in demo)' , effect:{ type:'draw', n:2 } },
  { id:'Ad', rank:'A', suit:'diamond', cost:3, text:'Ongoing: All hands here x2.',     effect:{ type:'laneMult', scope:'all', mult:2 } },

  // Kings (cost 2)
  { id:'Kh', rank:'K', suit:'heart',   cost:2, text:'Ongoing: +5 lane points.',       effect:{ type:'laneAdd', add:5 } },
  { id:'Ks', rank:'K', suit:'spade',   cost:2, text:'Ongoing: Straights x2.',          effect:{ type:'laneMult', scope:'straight', mult:2 } },
  { id:'Kc', rank:'K', suit:'club',    cost:2, text:'Ongoing: +5 lane points.',        effect:{ type:'laneAdd', add:5 } },
  { id:'Kd', rank:'K', suit:'diamond', cost:2, text:'Ongoing: +10 lane points.',       effect:{ type:'laneAdd', add:10 } },

  // Queens (cost 2)
  { id:'Qh', rank:'Q', suit:'heart',   cost:2, text:'On Reveal: +1 energy next turn.', effect:{ type:'energyNextTurn', n:1 } },
  { id:'Qs', rank:'Q', suit:'spade',   cost:2, text:'On Reveal: Reveal the turn early.', effect:{ type:'revealEarly', stage:'turn' } },
  { id:'Qc', rank:'Q', suit:'club',    cost:2, text:'On Reveal: Draw 1.',              effect:{ type:'draw', n:1 } },
  { id:'Qd', rank:'Q', suit:'diamond', cost:2, text:'Ongoing: +10 lane points.',       effect:{ type:'laneAdd', add:10 } },

  // Jacks (cost 2)
  { id:'Jh', rank:'J', suit:'heart',   cost:2, text:'Ongoing: Flushes x2.',            effect:{ type:'laneMult', scope:'flush', mult:2 } },
  { id:'Js', rank:'J', suit:'spade',   cost:2, text:'Ongoing: +5 lane points.',        effect:{ type:'laneAdd', add:5 } },
  { id:'Jc', rank:'J', suit:'club',    cost:2, text:'On Reveal: Draw 1.',              effect:{ type:'draw', n:1 } },
  { id:'Jd', rank:'J', suit:'diamond', cost:2, text:'Ongoing: +5 lane points.',        effect:{ type:'laneAdd', add:5 } },

  // Tens (cost 2)
  { id:'10h', rank:'10', suit:'heart',   cost:2, text:'Ongoing: +5 lane points.',      effect:{ type:'laneAdd', add:5 } },
  { id:'10s', rank:'10', suit:'spade',   cost:2, text:'Ongoing: +5 lane points.',      effect:{ type:'laneAdd', add:5 } },
  { id:'10c', rank:'10', suit:'club',    cost:2, text:'On Reveal: Draw 1 then discard 1.', effect:{ type:'drawThenDiscard', draw:1, discard:1 } },
  { id:'10d', rank:'10', suit:'diamond', cost:2, text:'Ongoing: +5 lane points.',      effect:{ type:'laneAdd', add:5 } },

  // Nines (cost 2)
  { id:'9h', rank:'9', suit:'heart',   cost:2, text:'No ability' },
  { id:'9s', rank:'9', suit:'spade',   cost:2, text:'No ability' },
  { id:'9c', rank:'9', suit:'club',    cost:2, text:'On Reveal: Draw 1.',              effect:{ type:'draw', n:1 } },
  { id:'9d', rank:'9', suit:'diamond', cost:2, text:'No ability' },

  // Eights (cost 1)
  { id:'8h', rank:'8', suit:'heart',   cost:1, text:'Ongoing: Straights x2.',          effect:{ type:'laneMult', scope:'straight', mult:2 } },
  { id:'8s', rank:'8', suit:'spade',   cost:1, text:'Ongoing: +5 lane points.',        effect:{ type:'laneAdd', add:5 } },
  { id:'8c', rank:'8', suit:'club',    cost:1, text:'No ability' },
  { id:'8d', rank:'8', suit:'diamond', cost:1, text:'No ability' },

  // Sevens (cost 1)
  { id:'7h', rank:'7', suit:'heart',   cost:1, text:'No ability' },
  { id:'7s', rank:'7', suit:'spade',   cost:1, text:'No ability' },
  { id:'7c', rank:'7', suit:'club',    cost:1, text:'On Reveal: Draw 1.',              effect:{ type:'draw', n:1 } },
  { id:'7d', rank:'7', suit:'diamond', cost:1, text:'Ongoing: +2 lane points.',        effect:{ type:'laneAdd', add:2 } },

  // Sixes (cost 1)
  { id:'6h', rank:'6', suit:'heart',   cost:1, text:'No ability' },
  { id:'6s', rank:'6', suit:'spade',   cost:1, text:'No ability' },
  { id:'6c', rank:'6', suit:'club',    cost:1, text:'On Reveal: Draw 1. (+1 energy next turn in demo)', effect:{ type:'draw', n:1 } },
  { id:'6d', rank:'6', suit:'diamond', cost:1, text:'No ability' },

  // Fives (cost 1)
  { id:'5h', rank:'5', suit:'heart',   cost:1, text:'Ongoing: +2 lane points.',        effect:{ type:'laneAdd', add:2 } },
  { id:'5s', rank:'5', suit:'spade',   cost:1, text:'No ability' },
  { id:'5c', rank:'5', suit:'club',    cost:1, text:'On Reveal: Draw 2 then discard 1.', effect:{ type:'drawThenDiscard', draw:2, discard:1 } },
  { id:'5d', rank:'5', suit:'diamond', cost:1, text:'No ability' },

  // Fours (cost 1)
  { id:'4h', rank:'4', suit:'heart',   cost:1, text:'Ongoing: +2 lane points.',        effect:{ type:'laneAdd', add:2 } },
  { id:'4s', rank:'4', suit:'spade',   cost:1, text:'No ability' },
  { id:'4c', rank:'4', suit:'club',    cost:1, text:'No ability' },
  { id:'4d', rank:'4', suit:'diamond', cost:1, text:'No ability' },

  // Threes (cost 1)
  { id:'3h', rank:'3', suit:'heart',   cost:1, text:'No ability' },
  { id:'3s', rank:'3', suit:'spade',   cost:1, text:'No ability' },
  { id:'3c', rank:'3', suit:'club',    cost:1, text:'On Reveal: +1 energy next turn.', effect:{ type:'energyNextTurn', n:1 } },
  { id:'3d', rank:'3', suit:'diamond', cost:1, text:'No ability' },

  // Twos (cost 1)
  { id:'2h', rank:'2', suit:'heart',   cost:1, text:'On Reveal: Reveal the flop early.', effect:{ type:'revealEarly', stage:'flop' } },
  { id:'2s', rank:'2', suit:'spade',   cost:1, text:'No ability' },
  { id:'2c', rank:'2', suit:'club',    cost:1, text:'No ability' },
  { id:'2d', rank:'2', suit:'diamond', cost:1, text:'No ability' },
]
