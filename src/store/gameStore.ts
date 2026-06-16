import { create } from 'zustand';
import type { GameState, PetType, Droplet, PetState, GameSession } from '@/game/types';
import {
  MAX_LIVES,
  GAME_DURATION,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PET_Y_OFFSET,
  PET_CONFIGS,
  RATING_THRESHOLDS,
} from '@/game/constants';

interface GameStoreState {
  gameState: GameState;
  selectedPet: PetType;
  score: number;
  combo: number;
  maxCombo: number;
  comboProtectionUsed: boolean;
  lives: number;
  timeRemaining: number;
  fullness: number;
  mood: number;
  caught: number;
  missed: number;
  currentDifficulty: number;
  goldenFishActive: boolean;
  goldenFishCount: number;
  sessionId: string;
  droplets: Droplet[];
  pet: PetState | null;

  setGameState: (state: GameState) => void;
  selectPet: (pet: PetType) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  addScore: (points: number) => void;
  incrementCombo: () => void;
  breakCombo: () => void;
  loseLife: () => void;
  decrementTime: (dt: number) => void;
  updateFullness: (delta: number) => void;
  updateMood: (delta: number) => void;
  addDroplet: (droplet: Droplet) => void;
  removeDroplet: (id: string) => void;
  updateDroplets: (droplets: Droplet[]) => void;
  updatePet: (pet: Partial<PetState>) => void;
  activateGoldenFish: () => void;
  deactivateGoldenFish: () => void;
  incrementCaught: () => void;
  incrementMissed: () => void;
  getSessionResult: () => GameSession;
  getHighScore: () => number;
}

const calculateRating = (score: number): string => {
  if (score >= RATING_THRESHOLDS.S) return 'S';
  if (score >= RATING_THRESHOLDS.A) return 'A';
  if (score >= RATING_THRESHOLDS.B) return 'B';
  return 'C';
};

const calculateDifficulty = (elapsed: number): number => {
  const seconds = elapsed / 1000;
  if (seconds >= 60) return 5;
  if (seconds >= 45) return 4;
  if (seconds >= 30) return 3;
  if (seconds >= 15) return 2;
  return 1;
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: 'menu',
  selectedPet: 'cat',
  score: 0,
  combo: 0,
  maxCombo: 0,
  comboProtectionUsed: false,
  lives: MAX_LIVES,
  timeRemaining: GAME_DURATION,
  fullness: 100,
  mood: 100,
  caught: 0,
  missed: 0,
  currentDifficulty: 1,
  goldenFishActive: false,
  goldenFishCount: 0,
  sessionId: '',
  droplets: [],
  pet: null,

  setGameState: (state) => set({ gameState: state }),

  selectPet: (pet) => set({ selectedPet: pet }),

  startGame: () => {
    const { selectedPet } = get();
    const config = PET_CONFIGS[selectedPet];
    const petWidth = config.catchWidth;
    const petHeight = 60;
    const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString();
    set({
      gameState: 'playing',
      sessionId,
      score: 0,
      combo: 0,
      maxCombo: 0,
      comboProtectionUsed: false,
      lives: MAX_LIVES,
      timeRemaining: GAME_DURATION,
      fullness: 100,
      mood: 100,
      caught: 0,
      missed: 0,
      currentDifficulty: 1,
      goldenFishActive: false,
      goldenFishCount: 0,
      droplets: [],
      pet: {
        type: selectedPet,
        x: CANVAS_WIDTH / 2 - petWidth / 2,
        y: CANVAS_HEIGHT - PET_Y_OFFSET,
        width: petWidth,
        height: petHeight,
        speed: config.speed,
        animation: 'idle',
        animationTimer: 0,
        isAccelerating: false,
        accelCooldown: 0,
        direction: 1,
        frame: 0,
        frameTimer: 0,
        isMoving: false,
      },
    });
  },

  pauseGame: () => set({ gameState: 'paused' }),

  resumeGame: () => set({ gameState: 'playing' }),

  endGame: () => {
    const { score } = get();
    const highScore = get().getHighScore();
    if (score > highScore) {
      localStorage.setItem('chubby_feeder_high_score', score.toString());
    }
    set({ gameState: 'result' });
  },

  addScore: (points) => {
    const { score, combo, maxCombo } = get();
    const newScore = score + points;
    set({
      score: newScore,
      maxCombo: Math.max(maxCombo, combo),
    });
  },

  incrementCombo: () => {
    const { combo, maxCombo } = get();
    const newCombo = combo + 1;
    set({
      combo: newCombo,
      maxCombo: Math.max(maxCombo, newCombo),
    });
  },

  breakCombo: () => {
    const { comboProtectionUsed, combo } = get();
    if (!comboProtectionUsed && combo > 0) {
      set({ comboProtectionUsed: true });
    } else {
      set({ combo: 0 });
    }
  },

  loseLife: () => {
    const { lives } = get();
    const newLives = lives - 1;
    if (newLives <= 0) {
      set({ lives: 0 });
      get().endGame();
    } else {
      set({ lives: newLives });
    }
  },

  decrementTime: (dt) => {
    const { timeRemaining } = get();
    const newTime = timeRemaining - dt;
    if (newTime <= 0) {
      set({ timeRemaining: 0 });
      get().endGame();
    } else {
      const elapsed = GAME_DURATION - newTime;
      const difficulty = calculateDifficulty(elapsed);
      set({ timeRemaining: newTime, currentDifficulty: difficulty });
    }
  },

  updateFullness: (delta) => {
    const { fullness } = get();
    set({ fullness: Math.max(0, Math.min(100, fullness + delta)) });
  },

  updateMood: (delta) => {
    const { mood } = get();
    set({ mood: Math.max(0, Math.min(100, mood + delta)) });
  },

  addDroplet: (droplet) => {
    const { droplets } = get();
    set({ droplets: [...droplets, droplet] });
  },

  removeDroplet: (id) => {
    const { droplets } = get();
    set({ droplets: droplets.filter((d) => d.id !== id) });
  },

  updateDroplets: (droplets) => set({ droplets }),

  updatePet: (partial) => {
    const { pet } = get();
    if (pet) {
      set({ pet: { ...pet, ...partial } });
    }
  },

  activateGoldenFish: () => {
    const { goldenFishCount } = get();
    set({ goldenFishActive: true, goldenFishCount: goldenFishCount + 1 });
  },

  deactivateGoldenFish: () => set({ goldenFishActive: false }),

  incrementCaught: () => {
    const { caught } = get();
    set({ caught: caught + 1 });
  },

  incrementMissed: () => {
    const { missed } = get();
    set({ missed: missed + 1 });
  },

  getSessionResult: () => {
    const { sessionId, score, maxCombo, caught, missed, selectedPet } = get();
    return {
      sessionId,
      petType: selectedPet,
      score,
      maxCombo,
      caught,
      missed,
      rating: calculateRating(score),
      timestamp: Date.now(),
    };
  },

  getHighScore: () => {
    const stored = localStorage.getItem('chubby_feeder_high_score');
    return stored ? parseInt(stored, 10) : 0;
  },
}));
