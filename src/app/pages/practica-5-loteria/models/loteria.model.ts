// ========================================
// INTERFACES PARA CREAR PARTIDA
// ========================================

export interface CreateLoteriaGameRequest {
  minPlayers: number;
  maxPlayers: number;
  drawCooldownSeconds?: number;
}

export interface CreateLoteriaGameResponse {
  gameId: string;
  code: string;
}

// ========================================
// INTERFACES PARA UNIRSE A PARTIDA
// ========================================

export interface JoinGameRequest {
  code: string;
}

export interface JoinGameResponse {
  gameId: string;
}

// ========================================
// INTERFACES PARA GENERAR CARTA
// ========================================

export interface GenerateCardResponse {
  playerCard: string[]; // 16 cartas
  message: string;
}

// ========================================
// INTERFACES PARA LOBBY STATUS
// ========================================

export interface LoteriaUser {
  id: number;
  name: string;
  level: number;
  exp: number;
}

export interface LoteriaLobbyPlayer {
  userId: number;
  ready: boolean;
  cardGenerated: boolean;
  isHost: boolean;
  user?: LoteriaUser;
}

export interface LoteriaHost {
  userId: number;
  user?: LoteriaUser;
}

export interface LoteriaLobbyStatusResponse {
  gameId: string;
  code: string;
  status: 'waiting' | 'card_selection' | 'ready_check' | 'in_progress' | 'verification' | 'finished';
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: number;
  isHost: boolean;
  myCardGenerated: boolean;
  myReady: boolean;
  canStart: boolean;
  host?: LoteriaHost;
  players: LoteriaLobbyPlayer[];
}

// ========================================
// INTERFACES PARA GAME STATUS
// ========================================

export interface LoteriaPlayerInfo {
  userId: number;
  tokensUsed: number;
  isSpectator: boolean;
  claimedWin: boolean;
  user?: LoteriaUser;
}

export interface LoteriaHostPlayerCard {
  userId: number;
  playerCard: string[];
  markedCells: boolean[];
  tokensUsed: number;
  isSpectator: boolean;
  claimedWin: boolean;
  user?: LoteriaUser;
}

export interface LoteriaHostView {
  playersCards: LoteriaHostPlayerCard[];
  canDraw: boolean;
  canReshuffle: boolean;
  cardsInDeck: number;
}

export interface LoteriaGameStatusBase {
  gameId: string;
  status: 'waiting' | 'card_selection' | 'ready_check' | 'in_progress' | 'verification' | 'finished';
  currentCard?: string;
  isHost: boolean;
  playerUnderReview?: number;
  cardsRemaining: number;
}

export interface LoteriaGameStatusHost extends LoteriaGameStatusBase {
  isHost: true;
  hostView: LoteriaHostView;
}

export interface LoteriaGameStatusPlayer extends LoteriaGameStatusBase {
  isHost: false;
  myCard: string[];
  isSpectator: boolean;
  myMarkedCells: boolean[];
  myTokensUsed: number;
  totalTokens: number;
  playersInfo: LoteriaPlayerInfo[];
}

export interface LoteriaGameStatusFinished extends LoteriaGameStatusBase {
  status: 'finished';
  remainingCards: string[];
  gameOver: true;
  winner: number;
  finalPlayersCards?: LoteriaHostPlayerCard[]; // Solo para anfitrión
}

export type LoteriaGameStatusResponse = LoteriaGameStatusHost | LoteriaGameStatusPlayer | LoteriaGameStatusFinished;

// ========================================
// INTERFACES PARA ACCIONES DE ANFITRIÓN
// ========================================

export interface DrawCardResponse {
  drawnCard: string;
  message: string;
  cardsRemaining: number;
  nextCardIn: number;
}

export interface ReshuffleCardsResponse {
  message: string;
  availableCards: number;
  cardsRemaining: number;
}

export interface KickPlayerRequest {
  kickUserId: number;
}

export interface KickPlayerResponse {
  kicked: boolean;
  kickedUserId: number;
  message: string;
}

// ========================================
// INTERFACES PARA ACCIONES DE JUGADORES
// ========================================

export interface PlaceTokenRequest {
  row: number; // 0-3
  col: number; // 0-3
}

export interface PlaceTokenResponse {
  row: number;
  col: number;
  cellIndex: number;
  tokensUsed: number;
  autoClaimWin: boolean;
  isValid?: boolean; // Solo si autoClaimWin es true
  message: string;
}

export interface ClaimWinResponse {
  claimed: boolean;
  isValid: boolean;
  message: string;
}

// ========================================
// INTERFACES PARA RESPUESTAS GENERALES
// ========================================

export interface MessageResponse {
  message: string;
}

export interface StartGameResponse {
  message: string;
  status: 'in_progress';
}

// ========================================
// TIPOS DE ESTADO DEL JUEGO
// ========================================

export type LoteriaGameStatus = 'waiting' | 'card_selection' | 'ready_check' | 'in_progress' | 'verification' | 'finished';

// ========================================
// CONSTANTES
// ========================================

export const LOTERIA_CARDS = [
  'el_gallo', 'el_diablito', 'la_dama', 'el_catrín', 'el_paraguas', 'la_sirena',
  'la_escalera', 'la_botella', 'el_barril', 'el_árbol', 'el_melón', 'el_valiente',
  'el_gorrito', 'la_muerte', 'la_pera', 'la_bandera', 'el_bandolón', 'el_violoncello',
  'la_garza', 'el_pájaro', 'la_mano', 'la_bota', 'la_luna', 'el_cotorro',
  'el_borracho', 'el_negrito', 'el_corazón', 'la_sandía', 'el_tambor', 'el_camarón',
  'las_jaras', 'el_músico', 'la_araña', 'el_soldado', 'la_estrella', 'el_cazo',
  'el_mundo', 'el_apache', 'el_nopal', 'el_alacrán', 'la_rosa', 'la_calavera',
  'la_campana', 'el_cantarito', 'el_venado', 'el_sol', 'la_corona', 'la_chalupa',
  'el_pino', 'el_pescado', 'la_palma', 'la_maceta', 'el_arpa', 'la_rana'
] as const;

export type LoteriaCard = typeof LOTERIA_CARDS[number];