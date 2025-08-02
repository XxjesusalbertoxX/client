export interface CreateGameResponse {
  gameId: string;
  code: string;
}

export interface JoinGameResponse {
  gameId: string;
}

export interface LobbyPlayer {
  _id: string;
  userId: number;
  ready: boolean;
  customColors?: string[]; // ← Agregar esta línea
  user: {
    id: number;
    name: string;
    wins: number;
    losses: number;
    exp: number;
    level: number;
  };
}

export interface LobbyStatusResponse {
  status: 'waiting' | 'in_progress';
  players: LobbyPlayer[];
  started: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface StartGameResponse {
  gameId: string;
  currentTurnUserId: number;
  status: 'in_progress';
}

export interface RematchStartedResponse {
  rematchStarted: true;
  gameId: string;
}

export interface RematchWaitingResponse {
  rematchAcceptedBy: string[];
  bothAccepted: false;
}

export type RematchResponse = RematchStartedResponse | RematchWaitingResponse;
