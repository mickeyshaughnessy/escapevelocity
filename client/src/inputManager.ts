import { PlayerInput } from '@escapevelocity/shared';

export class InputManager {
  private keys: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    window.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseButtons.clear();
    });
  }

  getInput(): PlayerInput {
    const thrust = this.keys.has('w') || this.keys.has('arrowup');
    const rotateLeft = this.keys.has('a') || this.keys.has('arrowleft');
    const rotateRight = this.keys.has('d') || this.keys.has('arrowright');
    const fire = this.keys.has(' ') || this.mouseButtons.has(0);

    return {
      thrust,
      rotateLeft,
      rotateRight,
      fire,
      timestamp: Date.now(),
    };
  }
}
