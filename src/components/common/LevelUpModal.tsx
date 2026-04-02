import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  level: number;
  levelName: string;
  levelIcon: string;
  onClose: () => void;
}

export function LevelUpModal({ level, levelName, levelIcon, onClose }: LevelUpModalProps) {
  const hasPlayed = React.useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    // Play sound
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`恭喜升级到 ${levelName}`);
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
  }, [levelName]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-yellow-100 to-yellow-300 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-8xl mb-6 animate-pulse">{levelIcon}</div>
        <h2 className="text-4xl font-black text-yellow-800 mb-2 drop-shadow-md">升级啦！</h2>
        <p className="text-xl text-yellow-900 font-bold mb-8">
          恭喜你达到了 <span className="text-red-600 text-2xl">{levelName}</span> (Lv.{level})
        </p>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-colors"
        >
          继续努力！
        </button>
      </div>
    </div>
  );
}
