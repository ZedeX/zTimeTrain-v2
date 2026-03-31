import React, { useEffect, useState, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { useApp } from './hooks/useApp';
import { useTrain } from './hooks/useTrain';
import { useTask } from './hooks/useTask';
import { usePoints } from './hooks/usePoints';
import { useAchievements } from './hooks/useAchievements';
import { useLevel } from './hooks/useLevel';
import { useShare } from './hooks/useShare';
import { Header } from './components/common/Header';
import { TrainTrack } from './components/train/TrainTrack';
import { TaskLibrary } from './components/task/TaskLibrary';
import confetti from 'canvas-confetti';
import { useEventBus } from './hooks/useEventBus';

export default function App() {
  const { state, updateAppState, login, logout, setDate, emit } = useApp();
  const { subscribe, EVENTS } = useEventBus();
  const { carriages, addStart, addEnd, insertAt, remove, setStatus, assignTask, moveTask, undo, canUndo } = useTrain(state, updateAppState, emit);
  const { tasks, add, update, hide, remove: removeTask } = useTask(state, updateAppState);
  
  const { earnPointsForCarriage } = usePoints(state, updateAppState);
  const { handleEvent } = useAchievements(state, updateAppState);
  const { updateForPoints, levelConfig } = useLevel(state, updateAppState);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const [showCalendar, setShowCalendar] = useState(false);
  const [activeDragData, setActiveDragData] = useState<any>(null);
  const prevDoneRef = useRef(false);

  useEffect(() => {
    if (!state.userId) {
      login('user-' + Math.random().toString(36).substr(2, 9));
    }
  }, [state.userId, login]);

  useEffect(() => {
    const handleCarriageComplete = (data: any) => {
      earnPointsForCarriage(data.carriageId);
      handleEvent('carriage:complete', data);
    };

    const unsubscribe = subscribe(EVENTS.CARRIAGE_COMPLETE, handleCarriageComplete);
    return () => unsubscribe();
  }, [earnPointsForCarriage, handleEvent, subscribe, EVENTS]);

  useEffect(() => {
    if (levelConfig?.icon) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '48px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(levelConfig.icon, 32, 32);
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon) {
          favicon.href = canvas.toDataURL('image/png');
        }
      }
    }
  }, [levelConfig?.icon]);

  useEffect(() => {
    const assignedCarriages = carriages.filter(c => c.taskId);
    const doneCarriages = assignedCarriages.filter(c => c.status === 'done');
    const isAllDone = assignedCarriages.length > 0 && assignedCarriages.length === doneCarriages.length;
    
    if (isAllDone && !prevDoneRef.current) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
    }
    prevDoneRef.current = isAllDone;
  }, [carriages]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'task' && overData?.type === 'carriage') {
      assignTask(overData.carriageId, activeData.taskId);
    } else if (activeData?.type === 'task-in-carriage' && overData?.type === 'carriage') {
      if (activeData.carriageId !== overData.carriageId) {
        moveTask(activeData.carriageId, overData.carriageId, activeData.taskId);
      }
    } else if (activeData?.type === 'task-in-carriage' && over.id === 'train-track') {
      assignTask(activeData.carriageId, null);
    }
  };

  if (!state.userId) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <Header 
        state={state} 
        updateAppState={updateAppState} 
        logout={logout} 
        setDate={setDate}
        undo={undo}
        canUndo={canUndo}
        carriages={carriages}
        onToggleCalendar={() => setShowCalendar(!showCalendar)}
      />
      
      {showCalendar ? (
        <div className="flex-1 overflow-auto p-8">
          <h2 className="text-2xl font-bold mb-6">月历统计</h2>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 31 }, (_, i) => {
              const dateStr = `2026-03-${String(i + 1).padStart(2, '0')}`;
              const dayCarriages = state.carriages[dateStr] || [];
              const assigned = dayCarriages.filter(c => c.taskId);
              const done = assigned.filter(c => c.status === 'done');
              const rate = assigned.length > 0 ? Math.round((done.length / assigned.length) * 100) : null;
              
              return (
                <div 
                  key={i} 
                  onClick={() => { setDate(dateStr); setShowCalendar(false); }}
                  className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-shadow ${
                    rate === 100 ? 'bg-green-100 border-green-200' : 
                    rate !== null && rate >= 60 ? 'bg-blue-100 border-blue-200' : 
                    rate !== null ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="font-bold text-gray-700">{i + 1}</div>
                  {rate !== null && <div className="text-sm mt-2 font-medium">{rate}%</div>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <main className="flex-1 flex flex-col h-[calc(100vh-64px)]">
            <TrainTrack 
              carriages={carriages}
              tasks={tasks}
              onAddStart={addStart}
              onAddEnd={addEnd}
              onInsertAt={insertAt}
              onRemove={remove}
              onSetStatus={setStatus}
              onAssignTask={assignTask}
            />
            <TaskLibrary 
              tasks={tasks}
              onAdd={add}
              onUpdate={update}
              onHide={hide}
              onRemove={removeTask}
            />
          </main>
          
          <DragOverlay dropAnimation={null}>
            {activeDragData?.type === 'task' ? (
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-blue-500 bg-white shadow-xl w-24 h-24 opacity-90">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-sm" style={{ backgroundColor: tasks.find(t => t.id === activeDragData.taskId)?.color + '20', color: tasks.find(t => t.id === activeDragData.taskId)?.color }}>
                  {tasks.find(t => t.id === activeDragData.taskId)?.icon}
                </div>
              </div>
            ) : activeDragData?.type === 'task-in-carriage' ? (
              <div className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-blue-500 bg-white shadow-xl w-24 h-24 opacity-90">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 shadow-sm" style={{ backgroundColor: tasks.find(t => t.id === activeDragData.taskId)?.color + '20', color: tasks.find(t => t.id === activeDragData.taskId)?.color }}>
                  {tasks.find(t => t.id === activeDragData.taskId)?.icon}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
