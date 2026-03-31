import type { ShareRecord, ShareType } from '../types';
import { SHARE_COPY } from '../constants';
import { generateId } from '../utils';

export function generateShareRecordId(): string {
  return `share-${generateId()}`;
}

export function generateShareContent(
  type: ShareType,
  data: any
): { title: string; description: string; imageUrl?: string } {
  switch (type) {
    case 'achievement':
      return {
        title: `🎉 解锁成就：${data.name}`,
        description: SHARE_COPY.achievement(data.name, data.description),
      };
    case 'level':
      return {
        title: `${data.icon} 等级提升！`,
        description: SHARE_COPY.level(data.levelName, data.icon, data.totalExp),
      };
    case 'daily':
      return {
        title: '⏰ 今日时间报告',
        description: SHARE_COPY.daily(data.carriages, data.streak),
      };
    case 'custom':
      return {
        title: data.title || 'TimeTrain',
        description: data.description || '来一起管理时间吧~',
      };
    default:
      return { title: 'TimeTrain', description: '来一起管理时间吧~' };
  }
}

export function recordShare(
  userId: string,
  type: ShareType,
  content: { title: string; description: string; imageUrl?: string },
  platform?: string
): ShareRecord {
  return {
    id: generateShareRecordId(),
    userId,
    type,
    content,
    sharedAt: Date.now(),
    platform,
  };
}

export interface WechatShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

export async function initWechatSDK(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return true;
}

export async function setWechatShare(config: WechatShareConfig): Promise<void> {
  if (typeof window === 'undefined') return;
  console.log('Setting wechat share:', config);
}

export async function copyShareText(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function saveImageToAlbum(imageDataUrl: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const link = document.createElement('a');
  link.href = imageDataUrl;
  link.download = `timetrain-share-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
}
