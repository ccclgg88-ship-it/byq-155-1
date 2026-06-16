export type PetType = 'cat' | 'dog' | 'pig';

export type DropType = 'healthy' | 'junk' | 'bomb' | 'golden_fish';

export type GameState = 'menu' | 'playing' | 'paused' | 'result';

export type PetAnimation = 'idle' | 'move_left' | 'move_right' | 'chew' | 'dizzy' | 'happy_jump';

export interface PetConfig {
  type: PetType;
  name: string;
  emoji: string;
  catchWidth: number;
  speed: number;
  color: string;
}

export interface Droplet {
  id: string;
  type: DropType;
  x: number;
  y: number;
  speed: number;
  emoji: string;
  width: number;
  height: number;
  caught: boolean;
}

export interface DropWeight {
  type: DropType;
  weight: number;
  emojis: string[];
}

export interface DifficultyLevel {
  level: number;
  dropSpeed: number;
  dropInterval: number;
  bombWeight: number;
}

export interface GameSession {
  sessionId: string;
  petType: PetType;
  score: number;
  maxCombo: number;
  caught: number;
  missed: number;
  rating: string;
  timestamp: number;
}

export interface PetState {
  type: PetType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  animation: PetAnimation;
  animationTimer: number;
  isAccelerating: boolean;
  accelCooldown: number;
  isMoving: boolean;
  direction: number;
  frame: number;
  frameTimer: number;
}

export interface ComboState {
  count: number;
  multiplier: number;
  protectionUsed: boolean;
}
