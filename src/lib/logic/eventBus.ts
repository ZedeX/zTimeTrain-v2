type EventHandler = (data: any) => void;
type Unsubscribe = () => void;

export interface EventBus {
  subscribe(eventName: string, handler: EventHandler): Unsubscribe;
  emit(eventName: string, data: any): void;
}

export function createEventBus(): EventBus {
  const handlers: Record<string, EventHandler[]> = {};

  return {
    subscribe(eventName: string, handler: EventHandler): Unsubscribe {
      if (!handlers[eventName]) {
        handlers[eventName] = [];
      }
      handlers[eventName].push(handler);

      return () => {
        handlers[eventName] = handlers[eventName].filter(h => h !== handler);
      };
    },

    emit(eventName: string, data: any): void {
      const eventHandlers = handlers[eventName];
      if (eventHandlers) {
        eventHandlers.forEach(handler => handler(data));
      }
    }
  };
}

export const globalEventBus = createEventBus();

export const EVENTS = {
  CARRIAGE_COMPLETE: 'carriage:complete',
  STREAK_UPDATE: 'streak:update',
  FIRST_ACTION: 'first:action',
  ACHIEVEMENT_UNLOCK: 'achievement:unlock',
  LEVEL_UP: 'level:up',
  SHARE: 'share',
  POINTS_EARNED: 'points:earned',
  POINTS_SPENT: 'points:spent',
} as const;
