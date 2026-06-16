import type { PetType, PetConfig, DifficultyLevel } from './types';

export const PET_CONFIGS: Record<PetType, PetConfig> = {
  cat: { type: 'cat', name: '猫咪', emoji: '🐱', catchWidth: 80, speed: 6, color: '#FF9A3C' },
  dog: { type: 'dog', name: '狗狗', emoji: '🐶', catchWidth: 100, speed: 5, color: '#4ECDC4' },
  pig: { type: 'pig', name: '猪猪', emoji: '🐷', catchWidth: 120, speed: 4, color: '#FF6B9D' },
};

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, dropSpeed: 2, dropInterval: 1200, bombWeight: 15 },
  { level: 2, dropSpeed: 3, dropInterval: 1000, bombWeight: 18 },
  { level: 3, dropSpeed: 4, dropInterval: 800, bombWeight: 22 },
  { level: 4, dropSpeed: 5, dropInterval: 600, bombWeight: 25 },
  { level: 5, dropSpeed: 6, dropInterval: 500, bombWeight: 28 },
];

export const HEALTHY_EMOJIS = ['🍎', '🥦', '🥕', '🍇', '🥛'];

export const JUNK_EMOJIS = ['🍔', '🍕', '🍟', '🍩', '🧁'];

export const BOMB_EMOJI = '💣';

export const GOLDEN_FISH_EMOJI = '🐟';

export const GAME_DURATION = 60;

export const MAX_LIVES = 3;

export const ACCEL_DURATION = 500;

export const ACCEL_COOLDOWN = 2000;

export const ACCEL_SPEED_MULTIPLIER = 1.8;

export const GOLDEN_FISH_DURATION = 5000;

export const MAX_GOLDEN_FISH = 2;

export const COMBO_THRESHOLDS = [0, 5, 10, 15, 20];

export const COMBO_MULTIPLIERS = [1, 1.5, 2, 2.5, 3];

export const FULLNESS_GAIN = 15;

export const MOOD_LOSS_JUNK = 20;

export const HEALTHY_SCORE = 10;

export const JUNK_SCORE = 5;

export const RATING_THRESHOLDS = { S: 800, A: 500, B: 300, C: 0 };

export const CANVAS_WIDTH = 800;

export const CANVAS_HEIGHT = 600;

export const PET_Y_OFFSET = 60;

export const DROPLET_SIZE = 40;
