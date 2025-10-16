import { Ship, Projectile, GameStateMessage } from '@escapevelocity/shared';
import { Renderer } from './renderer';
import { InputManager } from './inputManager';
import { NetworkManager } from './networkManager';

class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private inputManager: InputManager;
  private networkManager: NetworkManager;
  
  private ships: Map<string, Ship> = new Map();
  private projectiles: Map<string, Projectile> = new Map();
  private myShipId: string | null = null;
  
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private fpsUpdateTime: number = performance.now();

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.renderer = new Renderer(this.canvas);
    this.inputManager = new InputManager();
    
    const serverUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : window.location.origin;
    
    this.networkManager = new NetworkManager(serverUrl);
    
    this.networkManager.onReceivePlayerSpawn((ship: Ship) => {
      this.myShipId = ship.id;
      console.log('My ship spawned:', ship);
    });

    this.networkManager.onReceiveGameState((state: GameStateMessage) => {
      this.updateGameState(state);
    });

    this.gameLoop();
  }

  private updateGameState(state: GameStateMessage): void {
    this.ships.clear();
    this.projectiles.clear();

    for (const ship of state.ships) {
      this.ships.set(ship.id, ship);
    }

    for (const projectile of state.projectiles) {
      this.projectiles.set(projectile.id, projectile);
    }
  }

  private gameLoop = (): void => {
    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    this.update(deltaTime);
    this.render();

    this.frameCount++;
    if (now - this.fpsUpdateTime >= 1000) {
      this.updateHUD();
      this.frameCount = 0;
      this.fpsUpdateTime = now;
    }

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    const input = this.inputManager.getInput();
    this.networkManager.sendInput(input);
  }

  private render(): void {
    this.renderer.clear();

    const myShip = this.myShipId ? this.ships.get(this.myShipId) : null;
    if (myShip) {
      this.renderer.setCamera(myShip.position);
    }

    this.renderer.drawWorldBounds();

    for (const projectile of this.projectiles.values()) {
      this.renderer.drawProjectile(projectile);
    }

    for (const ship of this.ships.values()) {
      const isPlayer = ship.id === this.myShipId;
      this.renderer.drawShip(ship, isPlayer);
    }
  }

  private updateHUD(): void {
    const myShip = this.myShipId ? this.ships.get(this.myShipId) : null;
    
    if (myShip) {
      const speed = Math.sqrt(myShip.velocity.x ** 2 + myShip.velocity.y ** 2);
      document.getElementById('velocity')!.textContent = speed.toFixed(0);

      const healthPercent = (myShip.health / myShip.maxHealth) * 100;
      const healthFill = document.getElementById('health-fill')!;
      healthFill.style.width = `${healthPercent}%`;
      
      const healthText = document.getElementById('health-text')!;
      healthText.textContent = `${Math.ceil(myShip.health)} / ${myShip.maxHealth}`;
    }

    document.getElementById('players')!.textContent = this.ships.size.toString();
    document.getElementById('fps')!.textContent = this.frameCount.toString();
  }
}

new Game();
