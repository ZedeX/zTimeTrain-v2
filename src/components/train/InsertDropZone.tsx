import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface InsertDropZoneProps {
  index: number;
  isFull: boolean;
  onInsertAt: (index: number, taskId: string | null) => void;
}

export function InsertDropZone({ index, isFull, onInsertAt }: InsertDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `insert-between-${index}`,
    data: { type: 'insert-between', index }
  });

  return (
    <div 
      ref={setNodeRef}
      className="relative group flex items-center justify-center w-8 h-full"
    >
      <div className={`w-full h-2 transition-colors ${isOver ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
      {!isFull && (
        <button 
          onClick={() => onInsertAt(index, null)}
          className={`absolute w-8 h-8 rounded-full shadow-md flex items-center justify-center text-blue-500 transition-all z-20 ${
            isOver ? 'bg-blue-100 scale-110 opacity-100' : 'bg-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
}
