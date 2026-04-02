import { useCallback, useMemo } from 'react';
import { AppState, Carriage, UndoAction } from '../lib/types';
import {
  createInitialCarriages,
  addCarriageAtStart,
  addCarriageAtEnd,
  insertCarriageAt,
  deleteCarriage,
  updateCarriageStatus,
  assignTaskToCarriage
} from '../lib/logic/trainLogic';
import { EVENTS } from '../lib/logic/eventBus';

export function useTrain(
  appState: AppState,
  updateAppState: (updater: (state: AppState) => AppState) => void,
  emit: (event: string, data: any) => void
) {
  const { currentDate, carriages, undoStack } = appState;

  const currentCarriages = useMemo(() => {
    if (!carriages[currentDate] || carriages[currentDate].length === 0) {
      return createInitialCarriages(currentDate);
    }
    return carriages[currentDate];
  }, [carriages, currentDate]);

  const pushUndo = useCallback((actionType: UndoAction['type'], prevState: Partial<AppState>) => {
    updateAppState(state => {
      const newStack = [...state.undoStack, { type: actionType, prevState, timestamp: Date.now() }];
      if (newStack.length > 10) newStack.shift();
      return { ...state, undoStack: newStack };
    });
  }, [updateAppState]);

  const undo = useCallback(() => {
    updateAppState(state => {
      if (state.undoStack.length === 0) return state;
      const lastAction = state.undoStack[state.undoStack.length - 1];
      const newStack = state.undoStack.slice(0, -1);
      return { ...state, ...lastAction.prevState, undoStack: newStack };
    });
  }, [updateAppState]);

  const updateCarriages = useCallback((newCarriages: Carriage[], actionType: UndoAction['type']) => {
    pushUndo(actionType, { carriages: { ...appState.carriages } });
    updateAppState(state => ({
      ...state,
      carriages: {
        ...state.carriages,
        [currentDate]: newCarriages
      }
    }));
  }, [appState.carriages, currentDate, pushUndo, updateAppState]);

  const addStart = useCallback(() => {
    try {
      updateCarriages(addCarriageAtStart(currentCarriages, currentDate), 'addCarriage');
    } catch (e: any) {
      import('react-hot-toast').then(m => m.default.error(e.message));
    }
  }, [currentCarriages, currentDate, updateCarriages]);

  const addEnd = useCallback(() => {
    try {
      updateCarriages(addCarriageAtEnd(currentCarriages, currentDate), 'addCarriage');
    } catch (e: any) {
      import('react-hot-toast').then(m => m.default.error(e.message));
    }
  }, [currentCarriages, currentDate, updateCarriages]);

  const insertAt = useCallback((index: number, taskId: string | null = null) => {
    try {
      updateCarriages(insertCarriageAt(currentCarriages, index, currentDate, taskId), 'addCarriage');
    } catch (e: any) {
      import('react-hot-toast').then(m => m.default.error(e.message));
    }
  }, [currentCarriages, currentDate, updateCarriages]);

  const remove = useCallback((id: string) => {
    try {
      updateCarriages(deleteCarriage(currentCarriages, id), 'deleteCarriage');
    } catch (e: any) {
      import('react-hot-toast').then(m => m.default.error(e.message));
    }
  }, [currentCarriages, updateCarriages]);

  const setStatus = useCallback((id: string, status: Carriage['status']) => {
    updateCarriages(updateCarriageStatus(currentCarriages, id, status), 'updateStatus');
    if (status === 'done') {
      emit(EVENTS.CARRIAGE_COMPLETE, { carriageId: id });
    }
  }, [currentCarriages, updateCarriages, emit]);

  const assignTask = useCallback((carriageId: string, taskId: string | null) => {
    updateCarriages(assignTaskToCarriage(currentCarriages, carriageId, taskId), taskId ? 'assignTask' : 'unassignTask');
  }, [currentCarriages, updateCarriages]);

  const moveTask = useCallback((fromCarriageId: string, toCarriageId: string, taskId: string) => {
    pushUndo('assignTask', { carriages: { ...appState.carriages } });
    updateAppState(state => {
      const current = state.carriages[currentDate] || [];
      const newCarriages = current.map(c => {
        if (c.id === fromCarriageId) return { ...c, taskId: null, status: 'pending' as const, updatedAt: Date.now() };
        if (c.id === toCarriageId) return { ...c, taskId, status: 'pending' as const, updatedAt: Date.now() };
        return c;
      });
      return {
        ...state,
        carriages: {
          ...state.carriages,
          [currentDate]: newCarriages
        }
      };
    });
  }, [appState.carriages, currentDate, pushUndo, updateAppState]);

  return {
    carriages: currentCarriages,
    addStart,
    addEnd,
    insertAt,
    remove,
    setStatus,
    assignTask,
    moveTask,
    undo,
    canUndo: undoStack.length > 0
  };
}
