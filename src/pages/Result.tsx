import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import ResultScene from '@/components/ResultScene';

export default function Result() {
  const navigate = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    const state = useGameStore.getState();
    if (!state.sessionId) {
      navigate('/menu', { replace: true });
    }
  }, [navigate]);

  return <ResultScene />;
}
