// Respuesta al crear o unirse a una partida
export interface StartGameResponse {
  gameId: string;
  currentTurnUserId: number;
  myBoard: number[][];
  enemyBoard: number[][];
  status: 'in_progress';
}

// Respuesta al unirse a una partida
export interface JoinGameResponse {
  gameId: string;
}

// Modelo para el usuario vinculado a un jugador (para el lobby y partida)
export interface UserInfo {
  id: number;
  name: string;
  wins: number;
  losses: number;
  level: number;
}

// Modelo para un jugador dentro de la partida/lobby
export interface LobbyPlayer {
  userId: number;
  ready: boolean;
  shipsLost?: number;
  shipsSunk?: number;
  user: UserInfo;
}

// Respuesta del lobby polling
export interface LobbyStatusResponse {
  status: 'waiting' | 'in_progress';
  players: LobbyPlayer[];
  started: boolean;
}

// Respuesta de status de partida activa (usa LobbyPlayer para incluir datos del usuario)
export interface GameStatusResponse {
  status: 'started' | 'in_progress' | 'finished';
  currentTurnUserId: number;
  players: LobbyPlayer[];
  myBoard: number[][];
  enemyBoard: number[][];
  myShipsRemaining: number;
  enemyShipsRemaining: number;
}

// Respuesta de status de partida finalizada
export interface GameStatusWinnerResponse {
  status: 'finished';
  winnerName: string;
  loserName: string;
  myBoard: number[][];
  enemyBoard: number[][];
}

// Respuesta genérica de mensaje
export interface MessageResponse {
  message: string;
}

// Ataque
export type AttackStatus = 'hit' | 'miss' | 'win';

export interface AttackResponse {
  status: AttackStatus;
  x: number;
  y: number;
  message?: string;
}

// Respuesta al crear una partida
export interface CreateGameResponse {
  gameId: string;
  code: string;
}

// Respuesta cuando ambos aceptan la revancha
export interface RematchStartedResponse {
  rematchStarted: true;
  gameId: string;
}

// Respuesta cuando solo uno ha aceptado (o esperando al otro)
export interface RematchWaitingResponse {
  rematchAcceptedBy: string[]; // IDs de los PlayerGame que han aceptado
  bothAccepted: false;
}

// Tipo unión para manejar ambos casos
export type RematchResponse = RematchStartedResponse | RematchWaitingResponse;

// Puedes agregar esto a battle-ship.model.ts

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