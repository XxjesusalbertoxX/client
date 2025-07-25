// Usuario vinculado a un jugador (solo para Battleship stats o detalles)
export interface UserInfo {
  id: number;
  name: string;
  wins: number;
  losses: number;
  level: number;
}

// Estado de la partida activa de Battleship
export interface GameStatusResponse {
  status: 'started' | 'in_progress' | 'finished';
  currentTurnUserId: number;
  players: {
    userId: number;
    ready: boolean;
    shipsLost?: number;
    shipsSunk?: number;
    user: UserInfo;
  }[];
  myBoard: number[][];
  enemyBoard: number[][];
  myShipsRemaining: number;
  enemyShipsRemaining: number;
}

// Estado de partida finalizada (opcional)
export interface GameStatusWinnerResponse {
  status: 'finished';
  winnerName: string;
  loserName: string;
  myBoard: number[][];
  enemyBoard: number[][];
}

// Ataque
export type AttackStatus = 'hit' | 'miss' | 'win';

export interface AttackResponse {
  status: AttackStatus;
  x: number;
  y: number;
  message?: string;
}

// Stats y detalles de partidas Battleship
export interface BattleshipGameSummary {
  gameId: string;
  code: string;
  date: string;
  shipsSunk: number;
  shipsLost: number;
  opponentUserId: number | null;
}

export interface BattleshipStatsResponse {
  wins: number;
  losses: number;
  wonGames: BattleshipGameSummary[];
  lostGames: BattleshipGameSummary[];
}

export interface BattleshipGameDetails {
  gameId: string;
  board: number[][];
  opponentBoard: number[][] | null;
  result: 'win' | 'lose' | 'draw' | null;
  shipsSunk: number;
  shipsLost: number;
  moves: any[]; // Puedes tipar esto mejor si quieres
}