import { Vector2D, Ship, Projectile, PlayerInput } from '@escapevelocity/shared';
import { GAME_CONFIG, SHIP_CONFIG, PROJECTILE_CONFIG } from '@escapevelocity/shared';

export class PhysicsEngine {
  updateShip(ship: Ship, input: PlayerInput, deltaTime: number): void {
    if (input.rotateLeft) {
      ship.rotation -= SHIP_CONFIG.ROTATION_SPEED * deltaTime;
    }
    if (input.rotateRight) {
      ship.rotation += SHIP_CONFIG.ROTATION_SPEED * deltaTime;
    }

    if (input.thrust) {
      const thrustX = Math.cos(ship.rotation) * SHIP_CONFIG.THRUST_POWER * deltaTime;
      const thrustY = Math.sin(ship.rotation) * SHIP_CONFIG.THRUST_POWER * deltaTime;
      ship.velocity.x += thrustX;
      ship.velocity.y += thrustY;
    }

    ship.velocity.x *= SHIP_CONFIG.DRAG;
    ship.velocity.y *= SHIP_CONFIG.DRAG;

    const speed = Math.sqrt(ship.velocity.x ** 2 + ship.velocity.y ** 2);
    if (speed > SHIP_CONFIG.MAX_SPEED) {
      ship.velocity.x = (ship.velocity.x / speed) * SHIP_CONFIG.MAX_SPEED;
      ship.velocity.y = (ship.velocity.y / speed) * SHIP_CONFIG.MAX_SPEED;
    }

    ship.position.x += ship.velocity.x * deltaTime;
    ship.position.y += ship.velocity.y * deltaTime;

    this.wrapPosition(ship.position);
  }

  updateProjectile(projectile: Projectile, deltaTime: number): void {
    projectile.position.x += projectile.velocity.x * deltaTime;
    projectile.position.y += projectile.velocity.y * deltaTime;
    projectile.lifetime -= deltaTime * 1000;

    this.wrapPosition(projectile.position);
  }

  wrapPosition(pos: Vector2D): void {
    if (pos.x < 0) pos.x += GAME_CONFIG.WORLD_WIDTH;
    if (pos.x > GAME_CONFIG.WORLD_WIDTH) pos.x -= GAME_CONFIG.WORLD_WIDTH;
    if (pos.y < 0) pos.y += GAME_CONFIG.WORLD_HEIGHT;
    if (pos.y > GAME_CONFIG.WORLD_HEIGHT) pos.y -= GAME_CONFIG.WORLD_HEIGHT;
  }

  checkCollision(pos1: Vector2D, radius1: number, pos2: Vector2D, radius2: number): boolean {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  createProjectile(ship: Ship): Projectile {
    const velocity = {
      x: Math.cos(ship.rotation) * PROJECTILE_CONFIG.SPEED + ship.velocity.x,
      y: Math.sin(ship.rotation) * PROJECTILE_CONFIG.SPEED + ship.velocity.y,
    };

    const spawnDistance = SHIP_CONFIG.SIZE + 5;
    const position = {
      x: ship.position.x + Math.cos(ship.rotation) * spawnDistance,
      y: ship.position.y + Math.sin(ship.rotation) * spawnDistance,
    };

    return {
      id: `${ship.id}_${Date.now()}_${Math.random()}`,
      position,
      velocity,
      ownerId: ship.id,
      damage: PROJECTILE_CONFIG.DAMAGE,
      lifetime: PROJECTILE_CONFIG.LIFETIME,
    };
  }
}
