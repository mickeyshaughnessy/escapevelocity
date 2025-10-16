export interface Vector2D {
  x: number;
  y: number;
}

export interface Ship {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  rotationSpeed: number;
  health: number;
  maxHealth: number;
  color: string;
  playerId: string;
  playerName: string;
}

export interface Projectile {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  ownerId: string;
  damage: number;
  lifetime: number;
}

export interface GameState {
  ships: Map<string, Ship>;
  projectiles: Map<string, Projectile>;
  timestamp: number;
}

export interface PlayerInput {
  thrust: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
  fire: boolean;
  timestamp: number;
}

export enum MessageType {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_STATE = 'game_state',
  PLAYER_INPUT = 'player_input',
  PLAYER_SPAWN = 'player_spawn',
  SHIP_DESTROYED = 'ship_destroyed',
}

export interface PlayerJoinedMessage {
  playerId: string;
  playerName: string;
  ship: Ship;
}

export interface GameStateMessage {
  ships: Array<Ship>;
  projectiles: Array<Projectile>;
  timestamp: number;
}
