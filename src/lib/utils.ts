import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return uuidv4();
}

export function todayStr(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function formatTime(date: Date | string | number): string {
  return dayjs(date).format('HH:mm');
}

export function addMinutes(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  return dayjs().hour(hours).minute(mins).add(minutes, 'minute').format('HH:mm');
}

export function subtractMinutes(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  return dayjs().hour(hours).minute(mins).subtract(minutes, 'minute').format('HH:mm');
}

export function isTimeBefore(time1: string, time2: string): boolean {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  if (h1 !== h2) return h1 < h2;
  return m1 < m2;
}
