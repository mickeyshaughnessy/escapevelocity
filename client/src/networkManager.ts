import { io, Socket } from 'socket.io-client';
import { GameStateMessage, PlayerInput, MessageType, Ship } from '@escapevelocity/shared';

export class NetworkManager {
  private socket: Socket;
  private onGameState?: (state: GameStateMessage) => void;
  private onPlayerSpawn?: (ship: Ship) => void;

  constructor(serverUrl: string) {
    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.updateConnectionStatus(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.updateConnectionStatus(false);
    });

    this.socket.on(MessageType.GAME_STATE, (state: GameStateMessage) => {
      if (this.onGameState) {
        this.onGameState(state);
      }
    });

    this.socket.on(MessageType.PLAYER_SPAWN, (data: { ship: Ship }) => {
      if (this.onPlayerSpawn) {
        this.onPlayerSpawn(data.ship);
      }
    });
  }

  sendInput(input: PlayerInput): void {
    this.socket.emit(MessageType.PLAYER_INPUT, input);
  }

  onReceiveGameState(callback: (state: GameStateMessage) => void): void {
    this.onGameState = callback;
  }

  onReceivePlayerSpawn(callback: (ship: Ship) => void): void {
    this.onPlayerSpawn = callback;
  }

  private updateConnectionStatus(connected: boolean): void {
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = connected ? 'Connected' : 'Disconnected';
      statusEl.className = connected ? '' : 'disconnected';
    }
  }
}
