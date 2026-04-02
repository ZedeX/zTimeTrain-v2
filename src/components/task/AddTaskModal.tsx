import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../../lib/types';
import { X } from 'lucide-react';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

interface AddTaskModalProps {
  onClose: () => void;
  onAdd?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset' | 'isHidden'>) => void;
  onUpdate?: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset'>>) => void;
  initialCategory: Task['category'];
  editingTask?: Task;
}

export function AddTaskModal({ onClose, onAdd, onUpdate, initialCategory, editingTask }: AddTaskModalProps) {
  const [newTaskName, setNewTaskName] = useState(editingTask?.name || '');
  const [newTaskIcon, setNewTaskIcon] = useState(editingTask?.icon || '📝');
  const [newTaskColor, setNewTaskColor] = useState(editingTask?.color || '#3b82f6');
  const [activeCategory, setActiveCategory] = useState<Task['category']>(editingTask?.category || initialCategory);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories: { id: Task['category']; label: string }[] = [
    { id: 'study', label: '学习类' },
    { id: 'life', label: '生活类' },
    { id: 'activity', label: '活动类' },
    { id: 'other', label: '其他类' }
  ];

  const handleAdd = () => {
    if (!newTaskName.trim()) return;
    if (editingTask && onUpdate) {
      onUpdate(editingTask.id, {
        name: newTaskName.trim().slice(0, 10),
        icon: newTaskIcon,
        color: newTaskColor,
        category: activeCategory
      });
    } else if (onAdd) {
      onAdd({
        name: newTaskName.trim().slice(0, 10),
        icon: newTaskIcon,
        color: newTaskColor,
        category: activeCategory
      });
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-blue-800">{editingTask ? '编辑任务' : '新增任务'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-full text-blue-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">任务分类</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === c.id 
                      ? 'bg-blue-100 text-blue-700 border-blue-200 border' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Details */}
          <div className="flex gap-4 items-start">
            <div className="relative" ref={emojiPickerRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">图标</label>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 text-center text-2xl border-2 rounded-xl bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
              >
                {newTaskIcon}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-xl overflow-hidden">
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => {
                      setNewTaskIcon(emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                    emojiStyle={EmojiStyle.APPLE}
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">任务名称</label>
              <input 
                type="text" 
                value={newTaskName} 
                onChange={e => setNewTaskName(e.target.value)} 
                className="w-full h-14 px-4 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg" 
                placeholder="例如：阅读绘本" 
                maxLength={10}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
              <input 
                type="color" 
                value={newTaskColor} 
                onChange={e => setNewTaskColor(e.target.value)} 
                className="w-14 h-14 p-1 border-2 rounded-xl cursor-pointer bg-white" 
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleAdd} 
            disabled={!newTaskName.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {editingTask ? '保存修改' : '确认添加'}
          </button>
        </div>
      </div>
    </div>
  );
}
