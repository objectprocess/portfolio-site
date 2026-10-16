/**
 * Build-time thumbnail map (WebP). Used by ProjectGrid and App preload.
 */
const thumbModules = import.meta.glob("../assets/thumbnails/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const thumbById: Record<string, string> = {};
for (const [path, url] of Object.entries(thumbModules)) {
  const file = path.split("/").pop() ?? "";
  const id = file.replace(/\.webp$/i, "");
  if (id) thumbById[id] = url;
}

const fallbackThumbUrl =
  thumbById["vision-tools"] ??
  new URL("../assets/thumbnails/vision-tools.webp", import.meta.url).href;

export function getThumbUrl(id: string, _extension?: "jpg" | "png" | "webp"): string {
  return thumbById[id] ?? fallbackThumbUrl;
}

export function getFallbackThumbUrl(): string {
  return fallbackThumbUrl;
}
