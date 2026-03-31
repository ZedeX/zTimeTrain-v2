import React, { useState } from 'react';
import { Task } from '../../lib/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';

interface TaskLibraryProps {
  tasks: Task[];
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset' | 'isHidden'>) => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset'>>) => void;
  onHide: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskLibrary({ tasks, onAdd, onUpdate, onHide, onRemove }: TaskLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<Task['category']>('study');
  const [isAdding, setIsAdding] = useState(false);

  const categories: { id: Task['category']; label: string }[] = [
    { id: 'study', label: '学习类' },
    { id: 'life', label: '生活类' },
    { id: 'activity', label: '活动类' },
    { id: 'other', label: '其他类' }
  ];

  const visibleTasks = tasks.filter(t => t.category === activeCategory && !t.isHidden);

  return (
    <div className="flex-1 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col h-1/2">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === c.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0 ml-4"
        >
          <Plus size={18} /> 新增任务
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {visibleTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={onUpdate}
              onHide={() => onHide(task.id)}
              onRemove={() => onRemove(task.id)}
            />
          ))}
        </div>
      </div>

      {isAdding && (
        <AddTaskModal 
          onClose={() => setIsAdding(false)} 
          onAdd={onAdd} 
          initialCategory={activeCategory} 
        />
      )}
    </div>
  );
}
