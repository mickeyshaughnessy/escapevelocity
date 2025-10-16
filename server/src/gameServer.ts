import { Ship, Projectile, PlayerInput, GameStateMessage, MessageType } from '@escapevelocity/shared';
import { GAME_CONFIG, SHIP_CONFIG, COLORS, PROJECTILE_CONFIG } from '@escapevelocity/shared';
import { PhysicsEngine } from './physics';

export class GameServer {
  private ships: Map<string, Ship> = new Map();
  private projectiles: Map<string, Projectile> = new Map();
  private playerInputs: Map<string, PlayerInput> = new Map();
  private lastFireTime: Map<string, number> = new Map();
  private physics: PhysicsEngine = new PhysicsEngine();
  private lastUpdateTime: number = Date.now();

  addPlayer(playerId: string, playerName: string): Ship {
    const ship: Ship = {
      id: playerId,
      position: {
        x: Math.random() * GAME_CONFIG.WORLD_WIDTH,
        y: Math.random() * GAME_CONFIG.WORLD_HEIGHT,
      },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: 0,
      health: SHIP_CONFIG.MAX_HEALTH,
      maxHealth: SHIP_CONFIG.MAX_HEALTH,
      color: COLORS[this.ships.size % COLORS.length],
      playerId,
      playerName,
    };

    this.ships.set(playerId, ship);
    this.playerInputs.set(playerId, {
      thrust: false,
      rotateLeft: false,
      rotateRight: false,
      fire: false,
      timestamp: Date.now(),
    });

    return ship;
  }

  removePlayer(playerId: string): void {
    this.ships.delete(playerId);
    this.playerInputs.delete(playerId);
    this.lastFireTime.delete(playerId);
  }

  updatePlayerInput(playerId: string, input: PlayerInput): void {
    this.playerInputs.set(playerId, input);

    if (input.fire) {
      const now = Date.now();
      const lastFire = this.lastFireTime.get(playerId) || 0;
      
      if (now - lastFire >= SHIP_CONFIG.FIRE_COOLDOWN) {
        const ship = this.ships.get(playerId);
        if (ship) {
          const projectile = this.physics.createProjectile(ship);
          this.projectiles.set(projectile.id, projectile);
          this.lastFireTime.set(playerId, now);
        }
      }
    }
  }

  update(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    for (const [playerId, ship] of this.ships) {
      const input = this.playerInputs.get(playerId);
      if (input) {
        this.physics.updateShip(ship, input, deltaTime);
      }
    }

    const projectilesToRemove: string[] = [];
    for (const [id, projectile] of this.projectiles) {
      this.physics.updateProjectile(projectile, deltaTime);

      if (projectile.lifetime <= 0) {
        projectilesToRemove.push(id);
        continue;
      }

      for (const ship of this.ships.values()) {
        if (ship.id !== projectile.ownerId) {
          if (this.physics.checkCollision(
            projectile.position,
            PROJECTILE_CONFIG.SIZE,
            ship.position,
            SHIP_CONFIG.SIZE
          )) {
            ship.health -= projectile.damage;
            projectilesToRemove.push(id);
            
            if (ship.health <= 0) {
              this.respawnShip(ship);
            }
            break;
          }
        }
      }
    }

    for (const id of projectilesToRemove) {
      this.projectiles.delete(id);
    }
  }

  private respawnShip(ship: Ship): void {
    ship.position = {
      x: Math.random() * GAME_CONFIG.WORLD_WIDTH,
      y: Math.random() * GAME_CONFIG.WORLD_HEIGHT,
    };
    ship.velocity = { x: 0, y: 0 };
    ship.rotation = Math.random() * Math.PI * 2;
    ship.health = SHIP_CONFIG.MAX_HEALTH;
  }

  getGameState(): GameStateMessage {
    return {
      ships: Array.from(this.ships.values()),
      projectiles: Array.from(this.projectiles.values()),
      timestamp: Date.now(),
    };
  }
}
