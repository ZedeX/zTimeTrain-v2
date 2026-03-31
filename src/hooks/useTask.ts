import { useCallback } from 'react';
import { AppState, Task } from '../lib/types';
import { addTask, updateTask, hideTask, deleteTask } from '../lib/logic/taskLogic';

export function useTask(
  appState: AppState,
  updateAppState: (updater: (state: AppState) => AppState) => void
) {
  const { tasks } = appState;

  const add = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset' | 'isHidden'>) => {
    updateAppState(state => ({
      ...state,
      tasks: addTask(state.tasks, task)
    }));
  }, [updateAppState]);

  const update = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPreset'>>) => {
    updateAppState(state => ({
      ...state,
      tasks: updateTask(state.tasks, id, updates)
    }));
  }, [updateAppState]);

  const hide = useCallback((id: string) => {
    updateAppState(state => ({
      ...state,
      tasks: hideTask(state.tasks, id)
    }));
  }, [updateAppState]);

  const remove = useCallback((id: string) => {
    updateAppState(state => ({
      ...state,
      tasks: deleteTask(state.tasks, id)
    }));
  }, [updateAppState]);

  return {
    tasks,
    add,
    update,
    hide,
    remove
  };
}
