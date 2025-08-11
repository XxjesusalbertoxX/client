export type SimonSayStatus =
  | 'waiting'
  | 'started'
  | 'choosing_first_color'
  | 'repeating_sequence'
  | 'choosing_next_color'
  | 'finished'

export type SimonSayPhase =
  | 'unknown'
  | 'choose_first_color'
  | 'choose_next_color'
  | 'repeat_sequence'
  | 'wait_opponent_choose'
  | 'wait_opponent_repeat'

export interface SimonSayGameStatusResponse {
  status: SimonSayStatus;
  currentTurnUserId: number | null;
  globalSequence: string[];
  availableColors: string[];
  currentSequenceIndex: number;
  lastAddedColor: string | null;
  playerChoosingUserId: number | null;
  playerRepeatingUserId: number | null;
  isMyTurn: boolean;
  phase: SimonSayPhase;
  sequenceLength: number;
  opponentName: string;

  // Solo si terminó:
  winner?: number;
  winnerName?: string;
  loserName?: string;

  // Info de jugadores (simplificada)
  players: SimonSayLobbyPlayer[];

  // ELIMINAR estos campos que ya no se usan:
  // myColors: string[];
  // myCustomColors?: string[];
  // opponentColors: string[];
  // mySequenceLength: number;
  // opponentSequenceLength: number;
  // myCurrentProgress: number;
  // playerGameId: string;
  // mySequence?: string[];
  // opponentSequence?: string[];
  // mySequenceVersion?: number;
}

export interface SimonSayLobbyPlayer {
  userId: number;
  ready: boolean;
  user: {
    id: number;
    name: string;
    wins: number;
    losses: number;
    level: number;
  };
}
