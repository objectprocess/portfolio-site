/**
 * Build-time thumbnail map. All project thumbs in this repo are PNG files.
 * Used by ProjectGrid and by App for preloading so the primary URL is correct
 * on first request (no .jpg probe / undefined asset URLs).
 */
const thumbModules = import.meta.glob("../assets/thumbnails/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const thumbById: Record<string, string> = {};
for (const [path, url] of Object.entries(thumbModules)) {
  const file = path.split("/").pop() ?? "";
  const id = file.replace(/\.png$/i, "");
  if (id) thumbById[id] = url;
}

const fallbackThumbUrl = new URL(
  "../assets/thumbnails/vision-tools.png",
  import.meta.url
).href;

/**
 * Resolve the production URL for a project thumbnail.
 * `extension` is kept for call-site compatibility; thumbs are always PNG.
 */
export function getThumbUrl(
  id: string,
  _extension: "jpg" | "png" = "png"
): string {
  return thumbById[id] ?? fallbackThumbUrl;
}

export function getFallbackThumbUrl(): string {
  return fallbackThumbUrl;
}
