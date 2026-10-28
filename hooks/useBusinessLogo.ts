'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Business logo, saved in this browser only (the backend has no logo field yet), per account so
 * another account on the same device never sees it. Images are shrunk to 256px before saving.
 */
const MAX_SIDE = 256;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const keyFor = (userId: string) => `kt-business-logo:${userId}`;

function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not a picture we can read. Try a JPG or PNG.'));
    };
    img.src = url;
  });
}

export function useBusinessLogo(userId?: string) {
  const [logo, setLogoState] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    try {
      setLogoState(localStorage.getItem(keyFor(userId)));
    } catch {
      setLogoState(null);
    }
  }, [userId]);

  /** Returns an error message to show, or null on success. */
  const uploadLogo = useCallback(
    async (file: File): Promise<string | null> => {
      if (!userId) return 'Please sign in again.';
      if (!file.type.startsWith('image/')) return 'Please choose a picture (JPG or PNG).';
      if (file.size > MAX_UPLOAD_BYTES) return 'That picture is too big. Please choose one under 8 MB.';
      try {
        const dataUrl = await shrinkImage(file);
        localStorage.setItem(keyFor(userId), dataUrl);
        setLogoState(dataUrl);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : 'Could not save your logo. Please try again.';
      }
    },
    [userId],
  );

  const removeLogo = useCallback(() => {
    if (!userId) return;
    try {
      localStorage.removeItem(keyFor(userId));
    } catch {
      // nothing saved
    }
    setLogoState(null);
  }, [userId]);

  return { logo, uploadLogo, removeLogo };
}
