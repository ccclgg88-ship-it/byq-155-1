import { useGameStore } from '@/store/gameStore';
import { COMBO_THRESHOLDS, COMBO_MULTIPLIERS, MAX_LIVES } from '@/game/constants';
import { cn } from '@/lib/utils';

const getComboMultiplier = (combo: number): number => {
  for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_THRESHOLDS[i]) {
      return COMBO_MULTIPLIERS[i];
    }
  }
  return 1;
};

const getComboTier = (combo: number): { label: string; color: string } => {
  if (combo >= 20) return { label: '超神！', color: 'from-purple-500 to-pink-500' };
  if (combo >= 15) return { label: '惊人！', color: 'from-red-500 to-orange-500' };
  if (combo >= 10) return { label: '厉害！', color: 'from-yellow-500 to-orange-500' };
  if (combo >= 5) return { label: '不错！', color: 'from-green-500 to-emerald-500' };
  return { label: '', color: '' };
};

export default function GameHUD() {
  const {
    score,
    combo,
    comboProtectionUsed,
    lives,
    timeRemaining,
    fullness,
    mood,
    currentDifficulty,
    goldenFishActive,
    pet,
  } = useGameStore();

  const multiplier = getComboMultiplier(combo);
  const comboTier = getComboTier(combo);
  const timePercent = (timeRemaining / 60) * 100;
  const isLowTime = timeRemaining <= 10;

  return (
    <div className="absolute inset-x-0 top-0 z-20 p-3 md:p-4 pointer-events-none">
      <div className="max-w-[800px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="text-xs text-gray-500 font-medium">得分</div>
                <div className="text-2xl font-bold text-gray-800 tabular-nums">
                  {score.toLocaleString()}
                </div>
              </div>
            </div>

            {combo > 0 && (
              <div
                className={cn(
                  'bg-gradient-to-r rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 animate-pulse',
                  comboTier.color || 'from-blue-500 to-cyan-500'
                )}
              >
                <span className="text-2xl">🔥</span>
                <div className="text-white">
                  <div className="text-xs font-medium">
                    连击 {multiplier > 1 ? `x${multiplier}` : ''}
                  </div>
                  <div className="text-xl font-bold tabular-nums">
                    {combo} Combo
                  </div>
                </div>
                {comboTier.label && (
                  <span className="ml-1 text-white/90 font-bold text-sm animate-bounce">
                    {comboTier.label}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-2 flex items-center gap-2',
                isLowTime && 'ring-4 ring-red-400 animate-pulse'
              )}
            >
              <span className="text-2xl">{isLowTime ? '⏰' : '⏱️'}</span>
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">剩余时间</div>
                <div
                  className={cn(
                    'text-2xl font-bold tabular-nums',
                    isLowTime ? 'text-red-600' : 'text-gray-800'
                  )}
                >
                  {Math.ceil(timeRemaining)}s
                </div>
              </div>
            </div>

            <div className="w-28 h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  timePercent > 30
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : timePercent > 15
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                )}
                style={{ width: `${timePercent}%` }}
              />
            </div>

            <div className="bg-indigo-100 rounded-full px-3 py-1 text-xs font-bold text-indigo-700 shadow">
              难度 Lv.{currentDifficulty}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">生命</div>
                <div className="text-2xl space-x-0.5">
                  {Array.from({ length: MAX_LIVES }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'transition-all duration-300 inline-block',
                        i < lives
                          ? 'scale-100 opacity-100'
                          : 'scale-75 opacity-30 grayscale'
                      )}
                    >
                      {i < lives ? '❤️' : '🖤'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {!comboProtectionUsed && (
              <div className="bg-blue-100 rounded-full px-3 py-1 text-xs font-bold text-blue-700 shadow flex items-center gap-1">
                🛡️ 连击保护
              </div>
            )}

            {goldenFishActive && (
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full px-3 py-1 text-xs font-bold text-white shadow animate-pulse flex items-center gap-1">
                ✨ 黄金时刻
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                🍖 饱腹度
              </span>
              <span className="text-sm font-bold text-orange-600 tabular-nums">
                {Math.round(fullness)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  fullness > 50
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                    : fullness > 20
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                )}
                style={{ width: `${fullness}%` }}
              />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                😊 心情值
              </span>
              <span className="text-sm font-bold text-pink-600 tabular-nums">
                {Math.round(mood)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  mood > 50
                    ? 'bg-gradient-to-r from-pink-400 to-pink-500'
                    : mood > 20
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                )}
                style={{ width: `${mood}%` }}
              />
            </div>
          </div>
        </div>

        {pet?.isAccelerating && (
          <div className="mt-2 text-center">
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow animate-pulse">
              ⚡ 加速中！
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
