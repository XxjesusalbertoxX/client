export type SimonSayStatus =
  | 'waiting'
  | 'started'
  | 'waiting_first_color'
  | 'in_progress'
  | 'finished';

export type SimonSayPhase =
  | 'unknown'
  | 'choose_first_color'
  | 'choose_next_color'
  | 'choose_color'
  | 'repeat_sequence'
  | 'opponent_turn'
  | 'wait_opponent_choose'
  | 'wait_opponent_repeat'

export interface SimonSayGameStatusResponse {
  status: SimonSayStatus;
  currentTurnUserId: number;
  players: SimonSayLobbyPlayer[];
  myColors: string[];
  myCustomColors?: string[]; // Los colores que YO elegí (para escoger colores del oponente)
  opponentColors: string[];
  isMyTurn: boolean;
  opponentName?: string;
  mySequenceLength: number;
  opponentSequenceLength: number;
  myCurrentProgress: number;
  phase: SimonSayPhase;
  playerGameId: string;
  playerChoosingUserId: number;
  playerRepeatingUserId: number;
  globalSequence: string[];
  currentSequenceIndex: number;
  // Solo si terminó:
  winner?: number;
  winnerName?: string;
  loserName?: string;
  mySequence?: string[];
  opponentSequence?: string[];
  mySequenceVersion?: number; // Para detectar cuando se agrega un nuevo color
  availableColors?: string[];
  lastAddedColor?: string | null; // El último color que se agregó a la secuencia
}

export interface SimonSayLobbyPlayer {
  userId: number;
  ready: boolean;
  customColors?: string[]; // Los 6 colores que el jugador eligió
  user: {
    id: number;
    name: string;
    wins: number;
    losses: number;
    level: number;
  };
}
