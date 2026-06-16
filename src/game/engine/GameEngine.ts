import type { Droplet, PetState, PetAnimation } from '@/game/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PET_CONFIGS,
  DIFFICULTY_LEVELS,
  DROPLET_SIZE,
  ACCEL_SPEED_MULTIPLIER,
  ACCEL_DURATION,
  ACCEL_COOLDOWN,
  GOLDEN_FISH_DURATION,
  MAX_GOLDEN_FISH,
  HEALTHY_SCORE,
  JUNK_SCORE,
  FULLNESS_GAIN,
  MOOD_LOSS_JUNK,
  GAME_DURATION,
} from '@/game/constants';
import { useGameStore } from '@/store/gameStore';
import { InputManager } from './InputManager';
import { DropletManager } from './DropletManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private inputManager: InputManager;
  private dropletManager: DropletManager;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private goldenFishTimer: number = 0;
  private animationTimer: number = 0;
  private accelTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.inputManager = new InputManager(canvas);
    this.dropletManager = new DropletManager();
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.goldenFishTimer = 0;
    this.animationTimer = 0;
    this.dropletManager.reset();
    this.inputManager.reset();
    this.setupEventListeners();
    this.gameLoop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.removeEventListeners();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  private setupEventListeners(): void {
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private removeEventListeners(): void {
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleWindowBlur = (): void => {
    const state = useGameStore.getState();
    if (state.gameState === 'playing') {
      useGameStore.getState().pauseGame();
      this.pause();
    }
  };

  private handleWindowFocus = (): void => {
    const state = useGameStore.getState();
    if (state.gameState === 'paused') {
      useGameStore.getState().resumeGame();
      this.resume();
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key.toLowerCase() === 'p') {
      const state = useGameStore.getState();
      if (state.gameState === 'playing') {
        useGameStore.getState().pauseGame();
        this.pause();
      } else if (state.gameState === 'paused') {
        useGameStore.getState().resumeGame();
        this.resume();
      }
    }
  };

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 32);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(deltaTime);
    }

    this.render();
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number): void {
    const state = useGameStore.getState();
    if (state.gameState !== 'playing' || !state.pet) return;

    this.animationTimer += dt;

    this.updatePet(dt);
    this.updateGoldenFish(dt);
    this.updateDroplets(dt);
    this.checkCollisions();
    this.updateGameTime(dt);
  }

  private updatePet(dt: number): void {
    const state = useGameStore.getState();
    const pet = state.pet;
    if (!pet) return;

    let newX = pet.x;
    let speed = pet.speed;
    let animation: PetAnimation = 'idle';
    let isMoving = false;
    let direction = pet.direction;

    if (pet.accelCooldown > 0) {
      pet.accelCooldown = Math.max(0, pet.accelCooldown - dt);
    }

    if (pet.isAccelerating) {
      this.accelTimer -= dt;
      if (this.accelTimer <= 0) {
        pet.isAccelerating = false;
        pet.accelCooldown = ACCEL_COOLDOWN;
      } else {
        speed *= ACCEL_SPEED_MULTIPLIER;
      }
    }

    const input = this.inputManager.getInput();
    const touchX = this.inputManager.getTouchX();

    if (touchX !== null) {
      const targetX = touchX - pet.width / 2;
      const diff = targetX - pet.x;
      if (Math.abs(diff) > speed) {
        newX += Math.sign(diff) * speed;
        isMoving = true;
        direction = diff > 0 ? 1 : -1;
      } else {
        newX = targetX;
      }
    } else {
      if (input.left) {
        newX -= speed;
        isMoving = true;
        direction = -1;
      }
      if (input.right) {
        newX += speed;
        isMoving = true;
        direction = 1;
      }
    }

    if (input.accelerate && !pet.isAccelerating && pet.accelCooldown === 0) {
      pet.isAccelerating = true;
      this.accelTimer = ACCEL_DURATION;
    }

    newX = Math.max(0, Math.min(CANVAS_WIDTH - pet.width, newX));

    if (isMoving) {
      animation = direction > 0 ? 'move_right' : 'move_left';
    }

    if (pet.animationTimer > 0) {
      pet.animationTimer -= dt;
      animation = pet.animation;
    }

    useGameStore.getState().updatePet({
      x: newX,
      animation,
      isMoving,
      direction,
      isAccelerating: pet.isAccelerating,
      accelCooldown: pet.accelCooldown,
    });
  }

  private updateGoldenFish(dt: number): void {
    const state = useGameStore.getState();
    if (state.goldenFishActive) {
      this.goldenFishTimer -= dt;
      if (this.goldenFishTimer <= 0) {
        useGameStore.getState().deactivateGoldenFish();
      }
    }
  }

  private updateDroplets(dt: number): void {
    const state = useGameStore.getState();
    const difficulty = DIFFICULTY_LEVELS[Math.min(state.currentDifficulty - 1, DIFFICULTY_LEVELS.length - 1)];
    const elapsed = (GAME_DURATION - state.timeRemaining) * 1000;

    this.dropletManager.update(dt, difficulty, elapsed, state.goldenFishActive, state.goldenFishCount);

    const droplets = this.dropletManager.getDroplets();
    const missed = droplets.filter(d => d.y > CANVAS_HEIGHT && !d.caught);

    missed.forEach(d => {
      if (d.type !== 'bomb') {
        useGameStore.getState().incrementMissed();
      }
    });

    const activeDroplets = droplets.filter(d => d.y <= CANVAS_HEIGHT || d.caught);
    this.dropletManager.setDroplets(activeDroplets);
    useGameStore.getState().updateDroplets(activeDroplets);
  }

  private checkCollisions(): void {
    const state = useGameStore.getState();
    const pet = state.pet;
    if (!pet) return;

    const droplets = this.dropletManager.getDroplets();

    droplets.forEach(droplet => {
      if (droplet.caught) return;

      const petLeft = pet.x;
      const petRight = pet.x + pet.width;
      const petTop = pet.y - pet.height;
      const petBottom = pet.y;

      const dropletLeft = droplet.x;
      const dropletRight = droplet.x + droplet.width;
      const dropletTop = droplet.y;
      const dropletBottom = droplet.y + droplet.height;

      if (
        petLeft < dropletRight &&
        petRight > dropletLeft &&
        petTop < dropletBottom &&
        petBottom > dropletTop
      ) {
        this.handleCollision(droplet);
      }
    });
  }

  private handleCollision(droplet: Droplet): void {
    droplet.caught = true;
    const state = useGameStore.getState();
    const multiplier = this.getComboMultiplier(state.combo);

    useGameStore.getState().updatePet({
      animationTimer: 300,
    });

    switch (droplet.type) {
      case 'healthy':
        useGameStore.getState().addScore(Math.floor(HEALTHY_SCORE * multiplier));
        useGameStore.getState().incrementCombo();
        useGameStore.getState().updateFullness(FULLNESS_GAIN);
        useGameStore.getState().incrementCaught();
        useGameStore.getState().updatePet({ animation: 'chew', animationTimer: 300 });
        break;

      case 'junk':
        useGameStore.getState().addScore(JUNK_SCORE);
        useGameStore.getState().breakCombo();
        useGameStore.getState().updateMood(-MOOD_LOSS_JUNK);
        useGameStore.getState().incrementCaught();
        useGameStore.getState().updatePet({ animation: 'chew', animationTimer: 300 });
        break;

      case 'bomb':
        useGameStore.getState().loseLife();
        useGameStore.getState().updatePet({ animation: 'dizzy', animationTimer: 800 });
        break;

      case 'golden_fish':
        if (state.goldenFishCount < MAX_GOLDEN_FISH) {
          useGameStore.getState().activateGoldenFish();
          this.goldenFishTimer = GOLDEN_FISH_DURATION;
          useGameStore.getState().updatePet({ animation: 'happy_jump', animationTimer: 1000 });
        }
        break;
    }

    this.saveDropRecord(droplet);
  }

  private saveDropRecord(droplet: Droplet): void {
    const state = useGameStore.getState();
    try {
      const records = JSON.parse(localStorage.getItem('chubby_feeder_drop_records') || '[]');
      records.push({
        id: droplet.id,
        sessionId: state.sessionId,
        type: droplet.type,
        x: droplet.x,
        y: droplet.y,
        caught: droplet.caught,
        timestamp: Date.now(),
      });
      localStorage.setItem('chubby_feeder_drop_records', JSON.stringify(records.slice(-100)));
    } catch {
      // Ignore storage errors
    }
  }

  private getComboMultiplier(combo: number): number {
    const thresholds = [0, 5, 10, 15, 20];
    const multipliers = [1, 1.5, 2, 2.5, 3];
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (combo >= thresholds[i]) {
        return multipliers[i];
      }
    }
    return 1;
  }

  private updateGameTime(dt: number): void {
    useGameStore.getState().decrementTime(dt / 1000);
  }

  private render(): void {
    const state = useGameStore.getState();
    const pet = state.pet;

    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.drawBackground();
    this.drawDroplets();

    if (pet) {
      this.drawPet(pet);
    }

    if (this.isPaused) {
      this.drawPauseOverlay();
    }
  }

  private drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#E0F6FF');
    gradient.addColorStop(1, '#90EE90');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#7CCD7C';
    this.ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.drawCloud(100, 80, 50);
    this.drawCloud(300, 50, 40);
    this.drawCloud(550, 100, 45);
    this.drawCloud(700, 60, 35);
  }

  private drawCloud(x: number, y: number, size: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
    this.ctx.arc(x + size * 1.4, y, size * 0.6, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawDroplets(): void {
    const droplets = this.dropletManager.getDroplets();
    droplets.forEach(droplet => {
      if (droplet.caught) return;

      this.ctx.font = `${DROPLET_SIZE}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      if (droplet.type === 'golden_fish') {
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 15;
      } else if (droplet.type === 'bomb') {
        this.ctx.shadowColor = '#FF0000';
        this.ctx.shadowBlur = 10;
      }

      this.ctx.fillText(droplet.emoji, droplet.x + droplet.width / 2, droplet.y + droplet.height / 2);
      this.ctx.shadowBlur = 0;
    });
  }

  private drawPet(pet: PetState): void {
    const config = PET_CONFIGS[pet.type];
    const centerX = pet.x + pet.width / 2;
    const centerY = pet.y - pet.height / 2;

    let bounceY = 0;
    let scaleX = 1;
    let rotation = 0;

    switch (pet.animation) {
      case 'chew':
        scaleX = 1 + Math.sin(this.animationTimer * 0.02) * 0.1;
        break;
      case 'dizzy':
        rotation = Math.sin(this.animationTimer * 0.01) * 0.2;
        break;
      case 'happy_jump':
        bounceY = Math.abs(Math.sin(this.animationTimer * 0.015)) * 20;
        break;
      case 'move_left':
      case 'move_right':
        scaleX = 1 + Math.sin(this.animationTimer * 0.03) * 0.05;
        break;
    }

    this.ctx.save();
    this.ctx.translate(centerX, centerY - bounceY);
    this.ctx.rotate(rotation);
    this.ctx.scale(scaleX, 1);

    this.ctx.fillStyle = config.color;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, pet.width / 2, pet.height / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.font = `${pet.height * 0.7}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(config.emoji, 0, 0);

    if (pet.isAccelerating) {
      this.ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
      this.ctx.beginPath();
      this.ctx.arc(0, pet.height / 2 + 10, 15, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();

    if (pet.animation === 'dizzy') {
      this.ctx.font = '20px Arial';
      this.ctx.fillText('💫', centerX - 15, centerY - pet.height / 2 - 15);
      this.ctx.fillText('💫', centerX + 15, centerY - pet.height / 2 - 10);
    }

    if (pet.animation === 'happy_jump') {
      this.ctx.font = '24px Arial';
      this.ctx.fillText('✨', centerX - 20, centerY - pet.height / 2 - 20);
      this.ctx.fillText('✨', centerX + 20, centerY - pet.height / 2 - 15);
    }
  }

  private drawPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('⏸️ 游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    this.ctx.font = '24px sans-serif';
    this.ctx.fillText('按 P 键或点击继续按钮恢复游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  }

  destroy(): void {
    this.stop();
    this.inputManager.destroy();
  }
}
