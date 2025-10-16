import { Ship, Projectile, Vector2D } from '@escapevelocity/shared';
import { GAME_CONFIG, SHIP_CONFIG, PROJECTILE_CONFIG } from '@escapevelocity/shared';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private camera: Vector2D = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setCamera(position: Vector2D): void {
    this.camera.x = position.x - this.canvas.width / 2;
    this.camera.y = position.y - this.canvas.height / 2;
  }

  clear(): void {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawStarfield();
  }

  private drawStarfield(): void {
    const starCount = 100;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    for (let i = 0; i < starCount; i++) {
      const x = (i * 137.5) % GAME_CONFIG.WORLD_WIDTH;
      const y = (i * 217.3) % GAME_CONFIG.WORLD_HEIGHT;
      const screenX = x - this.camera.x;
      const screenY = y - this.camera.y;
      
      if (screenX >= 0 && screenX <= this.canvas.width && 
          screenY >= 0 && screenY <= this.canvas.height) {
        const size = (i % 3) + 1;
        this.ctx.fillRect(screenX, screenY, size, size);
      }
    }
  }

  drawShip(ship: Ship, isPlayer: boolean = false): void {
    const screenX = ship.position.x - this.camera.x;
    const screenY = ship.position.y - this.camera.y;

    this.ctx.save();
    this.ctx.translate(screenX, screenY);
    this.ctx.rotate(ship.rotation);

    this.ctx.strokeStyle = ship.color;
    this.ctx.fillStyle = isPlayer ? ship.color : 'rgba(0, 0, 0, 0.5)';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(SHIP_CONFIG.SIZE, 0);
    this.ctx.lineTo(-SHIP_CONFIG.SIZE, -SHIP_CONFIG.SIZE / 2);
    this.ctx.lineTo(-SHIP_CONFIG.SIZE / 2, 0);
    this.ctx.lineTo(-SHIP_CONFIG.SIZE, SHIP_CONFIG.SIZE / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    if (isPlayer) {
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, SHIP_CONFIG.SIZE * 1.5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(ship.playerName, screenX, screenY - SHIP_CONFIG.SIZE - 10);

    const healthBarWidth = SHIP_CONFIG.SIZE * 2;
    const healthBarHeight = 4;
    const healthPercent = ship.health / ship.maxHealth;
    
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(screenX - healthBarWidth / 2, screenY - SHIP_CONFIG.SIZE - 5, healthBarWidth, healthBarHeight);
    
    this.ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
    this.ctx.fillRect(screenX - healthBarWidth / 2, screenY - SHIP_CONFIG.SIZE - 5, healthBarWidth * healthPercent, healthBarHeight);
  }

  drawProjectile(projectile: Projectile): void {
    const screenX = projectile.position.x - this.camera.x;
    const screenY = projectile.position.y - this.camera.y;

    this.ctx.fillStyle = '#ffff00';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, PROJECTILE_CONFIG.SIZE, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  drawWorldBounds(): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(-this.camera.x, -this.camera.y, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
  }
}
