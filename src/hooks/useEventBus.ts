import { useEffect, useCallback, useRef } from 'react';
import { globalEventBus, EVENTS } from '../lib/logic/eventBus';

export function useEventBus() {
  const busRef = useRef(globalEventBus);

  const emit = useCallback((eventName: string, data: any) => {
    busRef.current.emit(eventName, data);
  }, []);

  const subscribe = useCallback((eventName: string, handler: (data: any) => void) => {
    return busRef.current.subscribe(eventName, handler);
  }, []);

  return {
    emit,
    subscribe,
    EVENTS,
  };
}

export { EVENTS };
