/**
 * Shared thumbnail URL helper. Used by ProjectGrid and by App for preloading.
 * ProjectGrid tries .jpg first and falls back to .png in onError; preload uses
 * the same primary URL (.jpg) so cache is warm when the grid renders.
 */
export function getThumbUrl(id: string, extension: 'jpg' | 'png' = 'jpg'): string {
  return new URL(`../assets/thumbnails/${id}.${extension}`, import.meta.url).href;
}
