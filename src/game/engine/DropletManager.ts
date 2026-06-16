import type { Droplet, DropType, DifficultyLevel } from '@/game/types';
import {
  CANVAS_WIDTH,
  DROPLET_SIZE,
  HEALTHY_EMOJIS,
  JUNK_EMOJIS,
  BOMB_EMOJI,
  GOLDEN_FISH_EMOJI,
  MAX_GOLDEN_FISH,
} from '@/game/constants';

interface DropWeight {
  type: DropType;
  weight: number;
  emojis: string[];
}

export class DropletManager {
  private droplets: Droplet[] = [];
  private lastDropTime: number = 0;
  private goldenFishTriggered: number = 0;
  private nextGoldenFishTime: number = 0;

  constructor() {
    this.scheduleNextGoldenFish();
  }

  reset(): void {
    this.droplets = [];
    this.lastDropTime = 0;
    this.goldenFishTriggered = 0;
    this.scheduleNextGoldenFish();
  }

  private scheduleNextGoldenFish(): void {
    const minTime = 15000;
    const maxTime = 30000;
    this.nextGoldenFishTime = Math.random() * (maxTime - minTime) + minTime;
  }

  update(
    dt: number,
    difficulty: DifficultyLevel,
    elapsed: number,
    goldenFishActive: boolean,
    goldenFishCount: number
  ): void {
    this.lastDropTime += dt;

    this.droplets.forEach(droplet => {
      if (!droplet.caught) {
        droplet.y += droplet.speed * (dt / 16);
      }
    });

    if (this.lastDropTime >= difficulty.dropInterval) {
      this.lastDropTime = 0;

      if (!goldenFishActive && goldenFishCount < MAX_GOLDEN_FISH) {
        if (elapsed >= this.nextGoldenFishTime) {
          this.spawnDroplet('golden_fish', difficulty.dropSpeed);
          this.scheduleNextGoldenFish();
          return;
        }
      }

      const weights = this.getDropWeights(difficulty.bombWeight, goldenFishActive);
      const selectedType = this.selectDropType(weights);
      this.spawnDroplet(selectedType, difficulty.dropSpeed);
    }
  }

  private getDropWeights(bombWeight: number, goldenFishActive: boolean): DropWeight[] {
    if (goldenFishActive) {
      return [
        { type: 'healthy', weight: 100, emojis: HEALTHY_EMOJIS },
      ];
    }

    const healthyWeight = 100 - bombWeight - 30;
    return [
      { type: 'healthy', weight: Math.max(30, healthyWeight), emojis: HEALTHY_EMOJIS },
      { type: 'junk', weight: 30, emojis: JUNK_EMOJIS },
      { type: 'bomb', weight: bombWeight, emojis: [BOMB_EMOJI] },
    ];
  }

  private selectDropType(weights: DropWeight[]): DropType {
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const weight of weights) {
      random -= weight.weight;
      if (random <= 0) {
        return weight.type;
      }
    }

    return weights[0].type;
  }

  private spawnDroplet(type: DropType, baseSpeed: number): void {
    const emojis = this.getEmojisForType(type);
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const x = Math.random() * (CANVAS_WIDTH - DROPLET_SIZE);
    const speed = baseSpeed + Math.random() * 1.5;

    const droplet: Droplet = {
      id: this.generateId(),
      type,
      x,
      y: -DROPLET_SIZE,
      speed,
      emoji,
      width: DROPLET_SIZE,
      height: DROPLET_SIZE,
      caught: false,
    };

    this.droplets.push(droplet);
  }

  private getEmojisForType(type: DropType): string[] {
    switch (type) {
      case 'healthy':
        return HEALTHY_EMOJIS;
      case 'junk':
        return JUNK_EMOJIS;
      case 'bomb':
        return [BOMB_EMOJI];
      case 'golden_fish':
        return [GOLDEN_FISH_EMOJI];
      default:
        return HEALTHY_EMOJIS;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  getDroplets(): Droplet[] {
    return this.droplets;
  }

  setDroplets(droplets: Droplet[]): void {
    this.droplets = droplets;
  }

  getGoldenFishTriggered(): number {
    return this.goldenFishTriggered;
  }

  incrementGoldenFishTriggered(): void {
    this.goldenFishTriggered++;
  }
}
