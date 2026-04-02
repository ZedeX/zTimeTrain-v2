import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Achievement } from '../../lib/types';

interface AchievementUnlockedModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlockedModal({ achievement, onClose }: AchievementUnlockedModalProps) {
  const hasPlayed = React.useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    // Play sound
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`解锁成就：${achievement.name}`);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }

    // Confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#00FFFF']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#00FFFF']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [achievement.name]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-blue-100 to-blue-300 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-8xl mb-6 animate-pulse">{achievement.icon}</div>
        <h2 className="text-3xl font-black text-blue-800 mb-2 drop-shadow-md">解锁成就！</h2>
        <p className="text-2xl text-blue-900 font-bold mb-4">
          {achievement.name}
        </p>
        <p className="text-blue-800 mb-8">
          {achievement.description}
        </p>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-colors"
        >
          太棒了！
        </button>
      </div>
    </div>
  );
}
