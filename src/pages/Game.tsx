import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import GameScene from '@/components/GameScene';

export default function Game() {
  const navigate = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    const state = useGameStore.getState();
    if (!state.pet) {
      navigate('/menu', { replace: true });
    }
  }, [navigate]);

  return <GameScene />;
}
