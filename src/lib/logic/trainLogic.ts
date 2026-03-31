import { Carriage } from '../types';
import { generateId, addMinutes, subtractMinutes } from '../utils';

export function createInitialCarriages(date: string): Carriage[] {
  const carriages: Carriage[] = [];
  let currentStartTime = '17:00';
  for (let i = 0; i < 10; i++) {
    const endTime = addMinutes(currentStartTime, 30);
    carriages.push({
      id: generateId(),
      date,
      startTime: currentStartTime,
      endTime,
      taskId: null,
      status: 'pending',
      order: i + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    currentStartTime = endTime;
  }
  return carriages;
}

export function addCarriageAtStart(carriages: Carriage[], date: string): Carriage[] {
  if (carriages.length >= 48) throw new Error('已达到单日最大车厢数量限制');
  if (carriages.length === 0) return createInitialCarriages(date);
  const first = carriages[0];
  if (first.startTime === '00:00') throw new Error('Cannot add before 00:00');
  
  const newStartTime = subtractMinutes(first.startTime, 30);
  const newCarriage: Carriage = {
    id: generateId(),
    date,
    startTime: newStartTime,
    endTime: first.startTime,
    taskId: null,
    status: 'pending',
    order: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  return [newCarriage, ...carriages.map(c => ({ ...c, order: c.order + 1 }))];
}

export function addCarriageAtEnd(carriages: Carriage[], date: string): Carriage[] {
  if (carriages.length >= 48) throw new Error('已达到单日最大车厢数量限制');
  if (carriages.length === 0) return createInitialCarriages(date);
  const last = carriages[carriages.length - 1];
  if (last.endTime === '24:00' || last.endTime === '00:00') throw new Error('Cannot add after 23:30');
  
  const newEndTime = addMinutes(last.endTime, 30);
  const newCarriage: Carriage = {
    id: generateId(),
    date,
    startTime: last.endTime,
    endTime: newEndTime === '24:00' ? '00:00' : newEndTime,
    taskId: null,
    status: 'pending',
    order: carriages.length + 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  return [...carriages, newCarriage];
}

export function insertCarriageAt(carriages: Carriage[], index: number, date: string, taskId: string | null = null): Carriage[] {
  if (carriages.length >= 48) throw new Error('已达到单日最大车厢数量限制');
  if (index < 0 || index > carriages.length) return carriages;
  
  const newCarriages = [...carriages];
  const prevCarriage = index > 0 ? newCarriages[index - 1] : null;
  
  let startTime = prevCarriage ? prevCarriage.endTime : '00:00';
  let endTime = addMinutes(startTime, 30);
  
  const newCarriage: Carriage = {
    id: generateId(),
    date,
    startTime,
    endTime,
    taskId,
    status: 'pending',
    order: index + 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  newCarriages.splice(index, 0, newCarriage);
  
  // Try to adjust subsequent carriages forward
  let currentStartTime = endTime;
  let exceedForward = false;
  
  if (currentStartTime === '00:00' && index + 1 < newCarriages.length) {
    exceedForward = true;
  } else {
    for (let i = index + 1; i < newCarriages.length; i++) {
      const newEnd = addMinutes(currentStartTime, 30);
      if (newEnd === '00:00' || newEnd < currentStartTime) {
        if (newEnd !== '00:00' || i < newCarriages.length - 1) {
          exceedForward = true;
          break;
        }
      }
      currentStartTime = newEnd;
    }
  }

  if (exceedForward) {
    // We need to push backward instead
    if (newCarriages[0].startTime === '00:00') {
      throw new Error('无法分配更多时间，单日时间已满');
    }
    
    // Shift everything backward by 30 mins
    let currentStart = subtractMinutes(newCarriages[0].startTime, 30);
    for (let i = 0; i < newCarriages.length; i++) {
      const next = addMinutes(currentStart, 30);
      newCarriages[i].startTime = currentStart;
      newCarriages[i].endTime = next === '24:00' ? '00:00' : next;
      newCarriages[i].order = i + 1;
      currentStart = next;
    }
  } else {
    // Apply forward shift
    currentStartTime = endTime;
    for (let i = index + 1; i < newCarriages.length; i++) {
      const c = newCarriages[i];
      const newEnd = addMinutes(currentStartTime, 30);
      newCarriages[i] = {
        ...c,
        startTime: currentStartTime,
        endTime: newEnd === '24:00' ? '00:00' : newEnd,
        order: i + 1,
        updatedAt: Date.now(),
      };
      currentStartTime = newEnd;
    }
  }
  
  return newCarriages;
}

export function deleteCarriage(carriages: Carriage[], id: string): Carriage[] {
  if (carriages.length <= 1) throw new Error('Cannot delete last carriage');
  const index = carriages.findIndex(c => c.id === id);
  if (index === -1) return carriages;
  
  const newCarriages = [...carriages];
  newCarriages.splice(index, 1);
  
  // Adjust subsequent carriages backwards
  let currentStartTime = index > 0 ? newCarriages[index - 1].endTime : newCarriages[0].startTime;
  for (let i = index; i < newCarriages.length; i++) {
    const c = newCarriages[i];
    const newEnd = addMinutes(currentStartTime, 30);
    newCarriages[i] = {
      ...c,
      startTime: currentStartTime,
      endTime: newEnd === '24:00' ? '00:00' : newEnd,
      order: i + 1,
      updatedAt: Date.now(),
    };
    currentStartTime = newEnd;
  }
  
  return newCarriages;
}

export function updateCarriageStatus(carriages: Carriage[], id: string, status: Carriage['status']): Carriage[] {
  return carriages.map(c => c.id === id ? { ...c, status, updatedAt: Date.now() } : c);
}

export function assignTaskToCarriage(carriages: Carriage[], carriageId: string, taskId: string | null): Carriage[] {
  return carriages.map(c => c.id === carriageId ? { ...c, taskId, status: 'pending', updatedAt: Date.now() } : c);
}
