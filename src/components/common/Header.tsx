import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { useTrain } from '../../hooks/useTrain';
import { usePoints } from '../../hooks/usePoints';
import { useLevel } from '../../hooks/useLevel';
import { useAchievements } from '../../hooks/useAchievements';
import { useShare } from '../../hooks/useShare';
import { Undo, Calendar, LogOut, Download, Upload, Share2, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import dayjs from 'dayjs';
import { LevelModal } from './LevelModal';
import { AchievementModal } from './AchievementModal';

export function Header({ 
  state, 
  updateAppState, 
  logout, 
  setDate,
  undo,
  canUndo,
  carriages,
  onToggleCalendar
}: any) {
  const { currentPoints } = usePoints(state, updateAppState);
  const { currentLevel, levelConfig } = useLevel(state, updateAppState);
  const { hasNewAchievements, markAllAsRead } = useAchievements(state, updateAppState);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  const assignedCarriages = carriages.filter((c: any) => c.taskId);
  const doneCarriages = assignedCarriages.filter((c: any) => c.status === 'done');
  const completionRate = assignedCarriages.length > 0 
    ? Math.round((doneCarriages.length / assignedCarriages.length) * 100) 
    : 0;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "timetrain_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedState = JSON.parse(event.target?.result as string);
        updateAppState(() => importedState);
        alert('导入成功！');
      } catch (err) {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  const handlePrevDay = () => {
    const prevDate = dayjs(state.currentDate).subtract(1, 'day').format('YYYY-MM-DD');
    setDate(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = dayjs(state.currentDate).add(1, 'day').format('YYYY-MM-DD');
    setDate(nextDate);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TimeTrain - 幼儿时间管理小火车',
          text: `我已经达到了 ${levelConfig.name} 级别啦！快来和我一起玩吧！`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      alert('您的浏览器不支持原生分享功能，请复制链接分享。');
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2 hidden sm:flex">
          🚂 TimeTrain
        </h1>
        
        <div className="flex items-center bg-gray-50 rounded-full p-1 border shadow-sm">
          <button 
            onClick={handlePrevDay}
            className="p-2 sm:p-3 hover:bg-white rounded-full transition-colors"
          >
            <span className="text-gray-600 font-bold">&lt;</span>
          </button>
          <div className="flex items-center gap-2 px-2 sm:px-4 min-w-[120px] sm:min-w-[160px] justify-center relative">
            <Calendar size={20} className="text-blue-500 hidden sm:block" />
            <input 
              type="date" 
              value={state.currentDate} 
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span className="font-bold text-gray-700 text-base sm:text-lg whitespace-nowrap pointer-events-none">
              {dayjs(state.currentDate).format('MM月DD日')}
            </span>
          </div>
          <button 
            onClick={handleNextDay}
            className="p-2 sm:p-3 hover:bg-white rounded-full transition-colors"
          >
            <span className="text-gray-600 font-bold">&gt;</span>
          </button>
        </div>

        <button 
          onClick={undo} 
          disabled={!canUndo}
          className={cn("hidden sm:flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors", canUndo ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-gray-50 text-gray-400 cursor-not-allowed")}
        >
          <Undo size={16} /> 撤销
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        {assignedCarriages.length > 0 ? (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-gray-500">今日完成率</span>
            <span className={cn("font-bold", completionRate === 100 ? "text-green-500" : "text-blue-500")}>
              {completionRate}%
            </span>
          </div>
        ) : (
          <span className="hidden sm:block text-sm text-gray-400">待分配任务</span>
        )}

        <div className="flex items-center gap-1 sm:gap-3 border-l pl-2 sm:pl-4">
          <div className="hidden sm:flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full text-yellow-700 text-sm font-medium">
            <span>💰</span> {currentPoints}
          </div>
          <button 
            onClick={() => setShowLevelModal(true)}
            className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 sm:px-3 py-1.5 rounded-full text-purple-700 text-sm font-medium transition-colors cursor-pointer"
          >
            <span className="text-lg">{levelConfig.icon}</span> 
            <div className="flex flex-col items-start leading-tight">
              <span>Lv.{currentLevel}</span>
              <span className="text-[10px] sm:hidden">{currentPoints}分</span>
            </div>
          </button>
          <button 
            onClick={() => {
              setShowAchievementModal(true);
              markAllAsRead();
            }}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
          >
            <Trophy size={20} />
            {hasNewAchievements && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          <button onClick={onToggleCalendar} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
            <Calendar size={20} />
          </button>
          <button onClick={handleExport} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block" title="导出数据">
            <Download size={20} />
          </button>
          <label className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer hidden sm:block" title="导入数据">
            <Upload size={20} />
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={handleShare} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 size={20} />
          </button>
          <button onClick={logout} className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {showLevelModal && (
        <LevelModal 
          onClose={() => setShowLevelModal(false)} 
          state={state} 
          updateAppState={updateAppState} 
        />
      )}

      {showAchievementModal && (
        <AchievementModal 
          onClose={() => setShowAchievementModal(false)} 
          state={state} 
        />
      )}
    </header>
  );
}
