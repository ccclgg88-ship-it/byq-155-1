import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameEngine } from '@/game/engine/GameEngine';
import { useGameStore } from '@/store/gameStore';
import GameHUD from './GameHUD';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/constants';
import { cn } from '@/lib/utils';

export default function GameScene() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameState, pauseGame, resumeGame } = useGameStore();
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    setShowPauseMenu(gameState === 'paused');
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'result') {
      navigate('/result');
    }
  }, [gameState, navigate]);

  const handlePause = () => {
    pauseGame();
    engineRef.current?.pause();
  };

  const handleResume = () => {
    resumeGame();
    engineRef.current?.resume();
  };

  const handleBackToMenu = () => {
    engineRef.current?.stop();
    navigate('/menu');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-600 via-sky-400 to-green-300 flex flex-col items-center justify-center p-2 md:p-4 relative">
      <div
        className="relative w-full max-w-[800px]"
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 w-full h-full rounded-2xl shadow-2xl',
            'bg-gradient-to-b from-sky-400 to-green-200',
            'touch-none select-none'
          )}
        />

        <GameHUD />

        <button
          onClick={gameState === 'playing' ? handlePause : handleResume}
          className="absolute top-3 left-1/2 -translate-x-1/2 md:top-auto md:bottom-4 md:left-4 md:translate-x-0 z-30 bg-white/90 hover:bg-white backdrop-blur px-4 py-2 rounded-full shadow-lg font-bold text-gray-700 transition-all hover:scale-105 active:scale-95"
        >
          {gameState === 'playing' ? '⏸️ 暂停' : '▶️ 继续'}
        </button>

        <div className="absolute bottom-3 right-3 z-20 bg-white/70 backdrop-blur px-3 py-1.5 rounded-xl text-xs text-gray-600 shadow">
          <span className="hidden md:inline">A/D 或 ←/→ 移动 | Shift 加速 | P 暂停</span>
          <span className="md:hidden">拖动宠物移动</span>
        </div>

        {showPauseMenu && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl" />
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full mx-4 text-center">
              <div className="text-6xl mb-4">⏸️</div>
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2">游戏暂停</h2>
              <p className="text-gray-500 mb-6">休息一下，随时可以继续哦！</p>

              <div className="space-y-3">
                <button
                  onClick={handleResume}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-bold py-3 px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all active:scale-95"
                >
                  ▶️ 继续游戏
                </button>
                <button
                  onClick={handleBackToMenu}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-bold py-3 px-6 rounded-2xl shadow transition-all hover:scale-105 active:scale-95"
                >
                  🏠 返回菜单
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-400">按 P 键也可以快速继续</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
