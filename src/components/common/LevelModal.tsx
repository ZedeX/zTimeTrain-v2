import React from 'react';
import { X } from 'lucide-react';
import { TRAIN_LEVELS, POINTS_RULES } from '../../lib/constants';
import { useLevel } from '../../hooks/useLevel';
import { AppState } from '../../lib/types';

interface LevelModalProps {
  onClose: () => void;
  state: AppState;
  updateAppState: (updater: (state: AppState) => AppState) => void;
}

export function LevelModal({ onClose, state, updateAppState }: LevelModalProps) {
  const { currentLevel, levelConfig, levelProgress } = useLevel(state, updateAppState);
  const currentExp = levelProgress?.currentExp || 0;
  const nextLevelExp = levelProgress?.nextLevelExp || 0;
  const progressPercent = levelProgress?.progressPercent || 0;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between bg-purple-50">
          <h2 className="text-xl font-bold text-purple-800 flex items-center gap-2">
            <span>{levelConfig.icon}</span> 等级与积分规则
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-full text-purple-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Current Level Info */}
          <div className="bg-gradient-to-br from-purple-100 to-blue-50 p-6 rounded-xl mb-8 text-center shadow-sm border border-purple-100">
            <div className="text-5xl mb-3">{levelConfig.icon}</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">Lv.{currentLevel} {levelConfig.name}</div>
            <div className="text-sm text-gray-500 mb-4">当前经验值: {currentExp} / {nextLevelExp > 0 ? nextLevelExp : 'MAX'}</div>
            
            {nextLevelExp > 0 && (
              <div className="w-full bg-white/60 rounded-full h-3 mb-2 overflow-hidden shadow-inner border border-purple-100/50">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-blue-400 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            )}
            {nextLevelExp > 0 && (
              <div className="text-xs text-purple-600 font-medium">
                距离下一等级还需 {nextLevelExp - currentExp} 经验
              </div>
            )}
          </div>

          {/* Points Rules */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-yellow-500">💰</span> 如何获取积分与经验
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-700 font-medium">完成一个任务车厢</span>
                <span className="text-green-600 font-bold">+{POINTS_RULES.carriageComplete}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-700 font-medium">连续打卡3天</span>
                <span className="text-green-600 font-bold">+{POINTS_RULES.streak3}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-700 font-medium">连续打卡7天</span>
                <span className="text-green-600 font-bold">+{POINTS_RULES.streak7}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-700 font-medium">连续打卡30天</span>
                <span className="text-green-600 font-bold">+{POINTS_RULES.streak30}</span>
              </div>
            </div>
          </div>

          {/* Level List */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-500">📈</span> 等级路线图
            </h3>
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {TRAIN_LEVELS.map((level, index) => {
                const isCurrent = level.level === currentLevel;
                const isReached = level.level <= currentLevel;
                
                return (
                  <div key={level.level} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${isReached ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-slate-100 text-2xl shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {level.icon}
                    </div>
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border shadow-sm ${isCurrent ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className={`font-bold ${isCurrent ? 'text-purple-700' : 'text-slate-700'}`}>Lv.{level.level} {level.name}</div>
                      </div>
                      <div className="text-sm text-slate-500">
                        需要 {level.requiredPoints} 经验
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
