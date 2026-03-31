import { useCallback } from 'react';
import type { AppState, ShareType } from '../lib/types';
import {
  generateShareContent,
  recordShare,
  initWechatSDK,
  setWechatShare,
  copyShareText,
  saveImageToAlbum,
} from '../lib/logic/shareLogic';

interface UseShareReturn {
  shareRecords: AppState['shareRecords'];
  generateContent: (type: ShareType, data: any) => ReturnType<typeof generateShareContent>;
  share: (type: ShareType, data: any, platform?: string) => void;
  shareToWechat: (type: ShareType, data: any, imageUrl?: string) => Promise<boolean>;
  copyText: (text: string) => Promise<boolean>;
  saveImage: (imageDataUrl: string) => Promise<boolean>;
}

export function useShare(
  appState: AppState,
  updateAppState: (updater: (state: AppState) => AppState) => void
): UseShareReturn {
  const { shareRecords, userId } = appState;

  const generateContent = useCallback((type: ShareType, data: any) => {
    return generateShareContent(type, data);
  }, []);

  const share = useCallback((type: ShareType, data: any, platform?: string) => {
    if (!userId) return;

    const content = generateShareContent(type, data);
    const record = recordShare(userId, type, content, platform);

    updateAppState(state => ({
      ...state,
      shareRecords: [...state.shareRecords, record],
    }));
  }, [userId, updateAppState]);

  const shareToWechat = useCallback(async (type: ShareType, data: any, imageUrl?: string) => {
    if (!userId) return false;

    const content = generateShareContent(type, data);

    const initialized = await initWechatSDK();
    if (!initialized) return false;

    await setWechatShare({
      title: content.title,
      desc: content.description,
      link: typeof window !== 'undefined' ? window.location.href : '',
      imgUrl: imageUrl || '',
    });

    share(type, data, 'wechat');
    return true;
  }, [userId, share]);

  const copyText = useCallback(async (text: string) => {
    return await copyShareText(text);
  }, []);

  const saveImage = useCallback(async (imageDataUrl: string) => {
    return await saveImageToAlbum(imageDataUrl);
  }, []);

  return {
    shareRecords,
    generateContent,
    share,
    shareToWechat,
    copyText,
    saveImage,
  };
}
