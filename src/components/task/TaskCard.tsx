import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../../lib/types';
import { Edit2, EyeOff, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TaskCardProps {
  key?: string;
  task: Task;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset'>>) => void;
  onHide: () => void;
  onRemove: () => void;
}

export function TaskCard({ task, onUpdate, onHide, onRemove }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: 'task', taskId: task.id }
  });

  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "relative group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent bg-white shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing touch-none",
        "hover:border-blue-100",
        isDragging && "opacity-50"
      )}
    >
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!task.isPreset && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const name = prompt('新名称:', task.name);
              if (name) onUpdate(task.id, { name: name.slice(0, 10) });
            }}
            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
          >
            <Edit2 size={14} />
          </button>
        )}
        {task.isPreset ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onHide(); }}
            className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded"
          >
            <EyeOff size={14} />
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-sm"
        style={{ backgroundColor: task.color + '20', color: task.color }}
      >
        {task.icon}
      </div>
      <span className="text-sm font-medium text-gray-700 text-center line-clamp-2">
        {task.name}
      </span>
    </div>
  );
}
