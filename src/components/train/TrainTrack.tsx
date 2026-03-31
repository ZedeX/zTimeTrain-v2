import React, { useRef, useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Carriage, Task } from '../../lib/types';
import { TrainCarriage } from './TrainCarriage';
import { Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { cn } from '../../lib/utils';

interface TrainTrackProps {
  carriages: Carriage[];
  tasks: Task[];
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
  onAddStart,
  onAddEnd,
  onInsertAt,
  onRemove,
  onSetStatus,
  onAssignTask
}: TrainTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(dayjs().format('HH:mm'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('HH:mm'));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { setNodeRef } = useDroppable({
    id: 'train-track',
  });

  const canAddStart = carriages.length === 0 || carriages[0].startTime !== '00:00';
  const canAddEnd = carriages.length === 0 || (carriages[carriages.length - 1].endTime !== '24:00' && carriages[carriages.length - 1].endTime !== '00:00');
  const isFull = carriages.length >= 48;

  return (
    <div className="flex-1 overflow-x-auto bg-blue-50/50 relative py-12 px-8 custom-scrollbar">
      <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-300 -translate-y-1/2 z-0 rounded-full mx-4 shadow-inner"></div>
      
      <div 
        ref={setNodeRef}
        className="flex items-center gap-4 min-w-max relative z-10"
      >
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
                <div className="relative group flex items-center justify-center w-8 h-full">
                  <div className="w-full h-2 bg-gray-400"></div>
                  {!isFull && (
                    <button 
                      onClick={() => onInsertAt(index + 1, null)}
                      className="absolute w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
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
