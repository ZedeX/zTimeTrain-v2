import React from 'react';
import { X, Trophy } from 'lucide-react';
import { AppState } from '../../lib/types';
import { PRESET_ACHIEVEMENTS } from '../../lib/constants';

interface AchievementModalProps {
  onClose: () => void;
  state: AppState;
}

export function AchievementModal({ onClose, state }: AchievementModalProps) {
  const { achievements, userAchievements } = state;
  const unlockedIds = userAchievements.filter(ua => ua.unlockedAt).map(ua => ua.achievementId);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between bg-yellow-50">
          <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
            <Trophy size={24} className="text-yellow-600" /> 我的成就
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-yellow-100 rounded-full text-yellow-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESET_ACHIEVEMENTS.map(achievement => {
              const isUnlocked = unlockedIds.includes(achievement.id);
              if (achievement.isHidden && !isUnlocked) return null;

              return (
                <div 
                  key={achievement.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    isUnlocked 
                      ? 'bg-yellow-50/50 border-yellow-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 grayscale opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-white shadow-sm' : 'bg-gray-200'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-600'}`}>
                        {achievement.name}
                      </h3>
                      {isUnlocked && (
                        <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                          已解锁
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                    <div className="text-xs font-medium text-blue-600">
                      奖励: {achievement.rewards.points} 积分
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
