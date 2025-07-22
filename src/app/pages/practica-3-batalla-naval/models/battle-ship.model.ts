// src/app/models/battle-ship.models.ts

// Respuesta al crear o unirse a una partida
// Modelo para un jugador dentro de la partida
export interface StartGameResponse {
  gameId: string
  currentTurnUserId: number
  myBoard: number[][]
  enemyBoard: number[][]
  status: 'in_progress'
}

export interface JoinGameResponse {
  gameId: string
}

export interface PlayerInfo {
  userId: number
  ready: boolean
  shipsLost?: number
  shipsSunk?: number
}

// Modelo para el usuario vinculado a un jugador (para el lobby)
export interface UserInfo {
  id: number
  name: string
  wins: number
  losses: number
  level: number
}

export interface LobbyPlayer {
  userId: number
  ready: boolean
  user: UserInfo
}

// Respuesta de crear o unirse a partida
export interface CreateGameResponse {
  id: string;
  code: string;
}

// Respuesta del lobby polling
export interface LobbyStatusResponse {
  status: 'waiting'
  players: LobbyPlayer[]
  started: boolean
}

// Respuesta de status de partida activa
export interface GameStatusResponse {
  status: 'started' | 'in_progress' | 'finished'
  currentTurnUserId: number
  players: PlayerInfo[]
  myBoard: number[][]
  enemyBoard: number[][]
}

// Respuesta genérica de mensaje
export interface MessageResponse {
  message: string
}

// respuestas nuevas
// Ataque
export type AttackStatus = 'hit' | 'miss' | 'win';

export interface AttackResponse {
  status: AttackStatus;
  x: number;
  y: number;
  message?: string;
}

// Ruta /battleship/:id/status
// Respuesta del estado de la partida
export interface GameStatusResponse {
  status: 'started' | 'in_progress' | 'finished';
  currentTurnUserId: number;
  players: PlayerInfo[];
  myBoard: number[][];
  enemyBoard: number[][];
}

export interface PlayerInfo {
  userId: number;
  ready: boolean;
  shipsLost?: number;
  shipsSunk?: number;
}

// Ruta /game/:id/lobby-status
// Respuesta del estado del lobby
export interface UserInfo {
  id: number;
  name: string;
  wins: number;
  losses: number;
  level: number;
}

export interface LobbyPlayer {
  userId: number;
  ready: boolean;
  user: UserInfo;
}

export interface LobbyStatusResponse {
  status: 'waiting';
  players: LobbyPlayer[];
  started: boolean;
}

// Ruta /game/:id/create
// Respuesta al crear una partida
export interface CreateGameResponse {
  id: string;
  code: string;
}

// Ruta /game/:id/join
// Respuesta al unirse a una partida
export interface JoinGameResponse {
  gameId: string;
}

// Ruta /game/:id/start
// Respuesta al iniciar una partida
export interface StartGameResponse {
  gameId: string;
  currentTurnUserId: number;
  myBoard: number[][];
  enemyBoard: number[][];
  status: 'in_progress';
}

