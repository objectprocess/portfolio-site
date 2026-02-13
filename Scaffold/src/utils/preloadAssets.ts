/**
 * Preload images and videos into the browser cache so that when <img> / <video>
 * elements use the same URLs they load from cache (faster perceived load).
 * Used for: thumbnails, BGs, gallery media, body images.
 */

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?|$)/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT.test(url);
}

/**
 * Preload a list of URLs. Splits by image vs video and preloads each appropriately.
 * Images: new Image().src. Videos: HTMLVideoElement with preload="metadata" + load().
 */
export function preloadUrls(urls: string[]): void {
  if (typeof window === 'undefined' || !urls.length) return;

  const imageUrls = urls.filter((u) => !isVideoUrl(u));
  const videoUrls = urls.filter((u) => isVideoUrl(u));

  imageUrls.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  videoUrls.forEach((src) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = src;
    video.load();
  });
}

/**
 * Preload a single image URL (e.g. background texture).
 */
export function preloadImage(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  const img = new Image();
  img.src = url;
}
