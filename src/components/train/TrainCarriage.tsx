import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Carriage, Task } from '../../lib/types';
import { Check, X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TrainCarriageProps {
  carriage: Carriage;
  task: Task | null;
  isCurrentTime: boolean;
  currentTime: string;
  onRemove: () => void;
  onSetStatus: (status: Carriage['status']) => void;
  onAssignTask: (taskId: string | null) => void;
}

export function TrainCarriage({
  carriage,
  task,
  isCurrentTime,
  currentTime,
  onRemove,
  onSetStatus,
  onAssignTask
}: TrainCarriageProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `carriage-${carriage.id}`,
    data: { type: 'carriage', carriageId: carriage.id }
  });

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: `task-in-carriage-${carriage.id}`,
    data: { type: 'task-in-carriage', carriageId: carriage.id, taskId: task?.id },
    disabled: !task
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "group relative flex flex-col items-center w-32 h-48 rounded-xl shadow-lg border-2 transition-all flex-shrink-0 bg-white overflow-hidden",
        isOver ? "border-blue-500 scale-105" : "border-transparent",
        carriage.status === 'done' ? "bg-green-50 border-green-200" : 
        carriage.status === 'failed' ? "bg-red-50 border-red-200" : 
        !task ? "bg-gray-50 border-dashed border-gray-300" : "bg-white border-blue-100"
      )}
    >
      {isOver && (
        <div className="absolute inset-0 bg-blue-400/20 animate-ping rounded-xl pointer-events-none"></div>
      )}
      {/* Time Indicator */}
      {isCurrentTime && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-full shadow-sm">{currentTime}</span>
          <div className="w-0.5 h-6 bg-orange-500 mt-1"></div>
        </div>
      )}

      {/* Time Range */}
      <div className="text-xs font-medium text-gray-500 mt-2 mb-1">
        {carriage.startTime} - {carriage.endTime}
      </div>

      {/* Delete Button */}
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
      >
        <Trash2 size={14} />
      </button>

      {/* Task Content */}
      <div 
        ref={setDraggableRef}
        {...listeners}
        {...attributes}
        className={cn(
          "flex-1 flex flex-col items-center justify-center w-full p-2 cursor-grab active:cursor-grabbing touch-none",
          !task && "opacity-50",
          isDragging && "opacity-50"
        )}
      >
        {task ? (
          <>
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 shadow-sm relative"
              style={{ backgroundColor: task.color + '20', color: task.color }}
            >
              {task.icon}
              {carriage.status === 'done' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white">
                  <Check size={12} />
                </div>
              )}
              {carriage.status === 'failed' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-white">
                  <X size={12} />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 text-center line-clamp-2">{task.name}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">空车厢</span>
        )}
      </div>

      {/* Status Buttons */}
      {task && (
        <div className="flex w-full border-t border-gray-100 divide-x divide-gray-100 h-10">
          <button 
            onClick={() => onSetStatus(carriage.status === 'done' ? 'pending' : 'done')}
            className={cn(
              "flex-1 flex items-center justify-center transition-colors rounded-bl-xl",
              carriage.status === 'done' ? "bg-green-500 text-white" : "hover:bg-green-50 text-green-600"
            )}
          >
            <Check size={18} />
          </button>
          <button 
            onClick={() => onSetStatus(carriage.status === 'failed' ? 'pending' : 'failed')}
            className={cn(
              "flex-1 flex items-center justify-center transition-colors rounded-br-xl",
              carriage.status === 'failed' ? "bg-red-500 text-white" : "hover:bg-red-50 text-red-600"
            )}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
