import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { PET_CONFIGS, MAX_LIVES, GAME_DURATION } from '@/game/constants';
import type { PetType } from '@/game/types';
import { cn } from '@/lib/utils';

export default function MenuScene() {
  const navigate = useNavigate();
  const { selectedPet, selectPet, startGame, getHighScore } = useGameStore();
  const [showHelp, setShowHelp] = useState(false);
  const highScore = getHighScore();

  const handleStart = () => {
    startGame();
    navigate('/game');
  };

  const pets: { type: PetType; desc: string }[] = [
    { type: 'cat', desc: '灵活敏捷，接盘精准' },
    { type: 'dog', desc: '平衡之选，速度适中' },
    { type: 'pig', desc: '接盘范围大，移动较慢' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-400 via-sky-200 to-green-300 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-24 h-16 bg-white/80 rounded-full blur-sm" />
      <div className="absolute top-20 right-20 w-32 h-20 bg-white/70 rounded-full blur-sm" />
      <div className="absolute top-40 left-1/3 w-20 h-14 bg-white/60 rounded-full blur-sm" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
            🐾 圆嘟嘟喂食达人 🐾
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow">
            接住美食，避开炸弹，让你的宠物开心！
          </p>
        </div>

        {highScore > 0 && (
          <div className="bg-yellow-400/90 px-6 py-3 rounded-full shadow-lg">
            <span className="font-bold text-yellow-900 text-lg">
              🏆 历史最高分：{highScore}
            </span>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-8 w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            选择你的小伙伴
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {pets.map(({ type, desc }) => {
              const config = PET_CONFIGS[type];
              const isSelected = selectedPet === type;
              return (
                <button
                  key={type}
                  onClick={() => selectPet(type)}
                  className={cn(
                    'relative flex flex-col items-center p-4 rounded-2xl transition-all duration-200 border-4',
                    isSelected
                      ? 'border-yellow-400 bg-yellow-50 scale-105 shadow-xl'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:scale-102'
                  )}
                >
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-inner"
                    style={{ backgroundColor: config.color + '33' }}
                  >
                    {config.emoji}
                  </div>
                  <div className="mt-3 text-center">
                    <div className="font-bold text-lg text-gray-800">
                      {config.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{desc}</div>
                  </div>
                  <div className="mt-2 text-xs space-y-1 w-full">
                    <div className="flex justify-between px-1">
                      <span className="text-gray-500">速度</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-2 h-2 rounded-full',
                              i <= Math.ceil(config.speed / 2 + 1)
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between px-1">
                      <span className="text-gray-500">范围</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-2 h-2 rounded-full',
                              i <= Math.ceil((config.catchWidth - 70) / 15) + 1
                                ? 'bg-blue-500'
                                : 'bg-gray-200'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-lg">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={handleStart}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            🎮 开始游戏
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="sm:w-auto bg-white/90 hover:bg-white text-gray-700 text-lg font-bold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            ❓ 玩法
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center text-sm text-gray-600">
          <div className="flex justify-center gap-6">
            <span>❤️ {MAX_LIVES} 条生命</span>
            <span>⏱️ {GAME_DURATION} 秒</span>
            <span>🎯 5 档难度</span>
          </div>
        </div>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              📖 游戏玩法
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎹</span>
                <div>
                  <b>操作方式</b>
                  <p className="text-sm text-gray-500">
                    键盘 A/D 或 ←/→ 左右移动，Shift 键加速（2秒冷却）
                  </p>
                  <p className="text-sm text-gray-500">
                    移动端可直接触摸拖动宠物
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🍎</span>
                <div>
                  <b>健康食物</b>
                  <p className="text-sm text-gray-500">
                    +10分（连击倍率），+饱腹度，累计连击
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🍔</span>
                <div>
                  <b>垃圾食品</b>
                  <p className="text-sm text-gray-500">
                    +5分，-心情，断连击（每局1次保护）
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💣</span>
                <div>
                  <b>炸弹</b>
                  <p className="text-sm text-gray-500">扣1条生命，被砸中会眩晕</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🐟</span>
                <div>
                  <b>金色鱼干</b>
                  <p className="text-sm text-gray-500">
                    5秒内全部掉落物变成健康食物（最多2次）
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏸️</span>
                <div>
                  <b>暂停</b>
                  <p className="text-sm text-gray-500">按 P 键暂停，窗口失焦自动暂停</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              知道了！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
