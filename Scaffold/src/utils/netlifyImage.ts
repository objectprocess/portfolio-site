/**
 * Netlify Image CDN helper.
 * Production: rewrite to `/.netlify/images` for on-demand resize + modern formats.
 * Dev / videos / already-optimized URLs: pass through unchanged.
 */
export function optimizeImageUrl(
  src: string,
  options?: { width?: number; quality?: number }
): string {
  if (!src) return src;
  if (import.meta.env.DEV) return src;
  if (src.includes("/.netlify/images")) return src;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(src)) return src;

  let urlParam = src;
  try {
    if (/^https?:\/\//i.test(src)) {
      const u = new URL(src);
      urlParam = `${u.pathname}${u.search}`;
    }
  } catch {
    // keep original
  }

  const params = new URLSearchParams();
  params.set("url", urlParam);
  if (options?.width) params.set("w", String(options.width));
  if (options?.quality) params.set("q", String(options.quality));
  // Omit `fm` so Netlify negotiates avif/webp from Accept headers.
  return `/.netlify/images?${params.toString()}`;
}
