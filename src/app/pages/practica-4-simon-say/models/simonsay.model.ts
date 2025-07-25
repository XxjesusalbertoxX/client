export type SimonSayStatus =
  | 'waiting'
  | 'started'
  | 'waiting_first_color'
  | 'in_progress'
  | 'finished';

export type SimonSayPhase =
  | 'choose_first_color'
  | 'repeat_sequence'
  | 'choose_color'
  | 'opponent_turn';

export interface SimonSayGameStatusResponse {
  status: SimonSayStatus;
  currentTurnUserId: number;
  players: SimonSayLobbyPlayer[];
  myColors: string[];
  opponentColors: string[];
  isMyTurn: boolean;
  mySequenceLength: number;
  opponentSequenceLength: number;
  myCurrentProgress: number;
  phase: SimonSayPhase;
  // Solo si terminó:
  winner?: number;
  winnerName?: string;
  loserName?: string;
  mySequence?: string[];
  opponentSequence?: string[];
}

export interface SimonSayLobbyPlayer {
  userId: number;
  ready: boolean;
  customColors?: string[];
  user: {
    id: number;
    name: string;
    wins: number;
    losses: number;
    level: number;
  };
}