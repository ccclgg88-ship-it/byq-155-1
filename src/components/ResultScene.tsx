import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { PET_CONFIGS, RATING_THRESHOLDS } from '@/game/constants';
import { cn } from '@/lib/utils';

const RATING_STYLES: Record<string, { color: string; bg: string; emoji: string; text: string }> = {
  S: {
    color: 'text-purple-600',
    bg: 'from-purple-400 via-pink-400 to-yellow-400',
    emoji: '👑',
    text: '完美表现！',
  },
  A: {
    color: 'text-yellow-600',
    bg: 'from-yellow-400 via-orange-400 to-orange-500',
    emoji: '🏆',
    text: '非常棒！',
  },
  B: {
    color: 'text-blue-600',
    bg: 'from-blue-400 via-cyan-400 to-teal-400',
    emoji: '🌟',
    text: '表现不错！',
  },
  C: {
    color: 'text-green-600',
    bg: 'from-green-400 via-emerald-400 to-teal-400',
    emoji: '💪',
    text: '继续努力！',
  },
};

export default function ResultScene() {
  const { getSessionResult, getHighScore, startGame, setGameState, selectedPet, lives } = useGameStore();
  const [showContent, setShowContent] = useState(false);
  const [animScore, setAnimScore] = useState(0);

  const result = getSessionResult();
  const highScore = getHighScore();
  const isNewHighScore = result.score >= highScore && result.score > 0;
  const isGameOver = lives <= 0;

  const ratingStyle = RATING_STYLES[result.rating] || RATING_STYLES.C;
  const petConfig = PET_CONFIGS[result.petType || selectedPet];

  const catchRate = result.caught + result.missed > 0
    ? Math.round((result.caught / (result.caught + result.missed)) * 100)
    : 0;

  const ratingNextThreshold = (() => {
    if (result.rating === 'S') return null;
    const thresholds = [
      { rating: 'S', score: RATING_THRESHOLDS.S },
      { rating: 'A', score: RATING_THRESHOLDS.A },
      { rating: 'B', score: RATING_THRESHOLDS.B },
    ];
    const next = thresholds.find((t) => t.score > result.score);
    return next ? next.score - result.score : null;
  })();

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 100);
    const t2 = setTimeout(() => {
      const duration = 1500;
      const startTime = performance.now();
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimScore(Math.floor(result.score * eased));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [result.score]);

  const handlePlayAgain = () => {
    startGame();
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-400 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            {['🎉', '⭐', '✨', '🎊', '💫', '🌟'][i % 6]}
          </div>
        ))}
      </div>

      <div
        className={cn(
          'relative z-10 w-full max-w-md transition-all duration-700 transform',
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div
            className={cn(
              'bg-gradient-to-r p-6 text-center text-white relative',
              ratingStyle.bg
            )}
          >
            <div className="text-7xl mb-2 animate-bounce-slow">{ratingStyle.emoji}</div>
            <h2 className="text-2xl font-bold drop-shadow">{ratingStyle.text}</h2>

            {isGameOver && (
              <div className="mt-2 bg-red-500/30 backdrop-blur rounded-full px-4 py-1 inline-block text-sm font-bold">
                💥 生命耗尽
              </div>
            )}

            {isNewHighScore && (
              <div className="mt-2 bg-white/30 backdrop-blur rounded-full px-4 py-1 inline-block text-sm font-bold animate-pulse">
                🎉 新纪录！
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg"
                style={{ backgroundColor: petConfig.color + '33' }}
              >
                {petConfig.emoji}
              </div>
              <div>
                <div className="text-sm text-gray-500">本局使用</div>
                <div className="text-xl font-bold text-gray-800">{petConfig.name}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">最终得分</div>
              <div
                className={cn(
                  'text-6xl font-extrabold tabular-nums tracking-tight',
                  ratingStyle.color
                )}
              >
                {animScore.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center justify-center gap-4">
                <div className={cn('text-5xl font-black', ratingStyle.color)}>
                  {result.rating}
                </div>
                <div className="text-left text-sm text-gray-500">
                  <div>评级</div>
                  {ratingNextThreshold !== null && (
                    <div className="text-xs text-gray-400">
                      还差 {ratingNextThreshold} 分升级
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon="🔥" label="最大连击" value={`${result.maxCombo}`} />
                <StatCard icon="🎯" label="接住率" value={`${catchRate}%`} />
                <StatCard icon="✅" label="接住" value={`${result.caught}`} color="green" />
                <StatCard icon="❌" label="漏接" value={`${result.missed}`} color="red" />
              </div>
            </div>

            {highScore > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-3 flex items-center justify-between">
                <span className="font-bold text-yellow-800 flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  历史最高
                </span>
                <span className="text-2xl font-black text-yellow-700 tabular-nums">
                  {highScore.toLocaleString()}
                </span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handlePlayAgain}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="text-2xl">🎮</span>
                再来一局
              </button>
              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-bold py-3.5 px-8 rounded-2xl shadow transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🏠</span>
                返回菜单
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-white/80 text-sm">
          Session ID: {result.sessionId.slice(0, 8)}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color?: 'green' | 'red';
}) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div
        className={cn(
          'text-2xl font-extrabold tabular-nums',
          color === 'green' && 'text-green-600',
          color === 'red' && 'text-red-500',
          !color && 'text-gray-800'
        )}
      >
        {value}
      </div>
    </div>
  );
}
