import React, { useRef, useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Carriage, Task } from '../../lib/types';
import { TrainCarriage } from './TrainCarriage';
import { InsertDropZone } from './InsertDropZone';
import { Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '../../lib/utils';

interface TrainTrackProps {
  carriages: Carriage[];
  tasks: Task[];
  levelIcon: string;
  onAddStart: () => void;
  onAddEnd: () => void;
  onInsertAt: (index: number, taskId: string | null) => void;
  onRemove: (id: string) => void;
  onSetStatus: (id: string, status: Carriage['status']) => void;
  onAssignTask: (carriageId: string, taskId: string | null) => void;
}

export function TrainTrack({
  carriages,
  tasks,
  levelIcon,
  onAddStart,
  onAddEnd,
  onInsertAt,
  onRemove,
  onSetStatus,
  onAssignTask
}: TrainTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm'));
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('HH:mm'));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { setNodeRef } = useDroppable({
    id: 'train-track',
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const canAddStart = carriages.length === 0 || carriages[0].startTime !== '00:00';
  const canAddEnd = carriages.length === 0 || (carriages[carriages.length - 1].endTime !== '24:00' && carriages[carriages.length - 1].endTime !== '00:00');
  const isFull = carriages.length >= 48;

  return (
    <div 
      ref={trackRef}
      className={cn("flex-1 overflow-x-auto bg-blue-50/50 relative py-12 px-8 custom-scrollbar", isDragging ? "cursor-grabbing" : "cursor-grab")}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-300 -translate-y-1/2 z-0 rounded-full mx-4 shadow-inner"></div>
      
      <div 
        ref={setNodeRef}
        className="flex items-center gap-4 min-w-max relative z-10"
      >
        <div className="flex items-center justify-center w-24 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl border-4 border-blue-800 flex-shrink-0 relative mr-2">
          <div className="absolute -top-6 w-12 h-8 bg-gray-800 rounded-t-lg"></div>
          <div className="absolute -top-10 w-4 h-4 bg-gray-400 rounded-full animate-bounce"></div>
          <span className="text-5xl">{levelIcon}</span>
          <div className="absolute bottom-2 flex gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-400"></div>
            <div className="w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-400"></div>
          </div>
        </div>

        <button 
          onClick={onAddStart}
          disabled={!canAddStart || isFull}
          className={cn(
            "w-12 h-12 rounded-full shadow-md flex items-center justify-center transition-colors flex-shrink-0",
            canAddStart && !isFull ? "bg-white text-blue-500 hover:bg-blue-50" : "bg-gray-100 text-gray-300 cursor-not-allowed"
          )}
        >
          <Plus size={24} />
        </button>

        {carriages.map((carriage, index) => {
          const task = carriage.taskId ? tasks.find(t => t.id === carriage.taskId) : null;
          const isCurrentTime = currentTime >= carriage.startTime && currentTime < carriage.endTime;

          return (
            <React.Fragment key={carriage.id}>
              <TrainCarriage 
                carriage={carriage}
                task={task}
                isCurrentTime={isCurrentTime}
                currentTime={currentTime}
                onRemove={() => onRemove(carriage.id)}
                onSetStatus={(status) => onSetStatus(carriage.id, status)}
                onAssignTask={(taskId) => onAssignTask(carriage.id, taskId)}
              />
              
              {index < carriages.length - 1 && (
                <InsertDropZone 
                  index={index + 1} 
                  isFull={isFull} 
                  onInsertAt={onInsertAt} 
                />
              )}
            </React.Fragment>
          );
        })}

        <button 
          onClick={onAddEnd}
          disabled={!canAddEnd || isFull}
          className={cn(
            "w-12 h-12 rounded-full shadow-md flex items-center justify-center transition-colors flex-shrink-0 ml-4",
            canAddEnd && !isFull ? "bg-white text-blue-500 hover:bg-blue-50" : "bg-gray-100 text-gray-300 cursor-not-allowed"
          )}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
