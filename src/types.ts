export type Suit = 'heart'|'spade'|'club'|'diamond';
export type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';

export interface CardDef {
  id: string;   // e.g., 'Ah'
  rank: Rank;
  suit: Suit;
  cost: number;
  text: string;
  effect?: Effect;
}

export type Effect =
  | { type: 'draw'; n: number }
  | { type: 'drawThenDiscard'; draw: number; discard: number }
  | { type: 'energyNextTurn'; n: number }
  | { type: 'revealEarly'; stage: 'flop'|'turn'|'river' }
  | { type: 'laneMult'; scope: 'flush'|'straight'|'all'; mult: number }
  | { type: 'laneAdd'; add: number }
  ;

export interface PlayedCard extends CardDef {
  // could hold counters later
}

export interface CommunityCard { id: string; rank: Rank; suit: Suit; }
