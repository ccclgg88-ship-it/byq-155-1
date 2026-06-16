import { useGameStore } from '@/store/gameStore';
import MenuScene from '@/components/MenuScene';
import GameScene from '@/components/GameScene';
import ResultScene from '@/components/ResultScene';

export default function Home() {
  const { gameState } = useGameStore();

  if (gameState === 'menu') {
    return <MenuScene />;
  }

  if (gameState === 'result') {
    return <ResultScene />;
  }

  return <GameScene />;
}
