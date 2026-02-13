import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getThumbUrl } from "../utils/thumbnails";

const MOBILE_BREAKPOINT = 768;

interface ProjectGridProps {
  stamps: Array<{ id: string; name: string } | null>;
  backgroundTextureUrl?: string | null;
  snowPresentUrls?: [string, string];
  snowSeed?: number;
  onSnowPresentClick?: () => void;
}

/**
 * Semantics:
 * - empty: render nothing
 * - outline: outline only
 * - solid: texture mask only
 * - project: project slot (stamp lives here)
 */
const gridMask: ("empty" | "outline" | "solid" | "project")[][] = [
  ["empty", "empty", "outline", "empty", "project", "project", "project", "solid", "outline", "empty", "empty", "project"],
  ["outline", "empty", "empty", "outline", "solid", "project", "solid", "project", "solid", "outline", "empty", "empty"],
  ["empty", "outline", "project", "project", "solid", "solid", "project", "empty", "solid", "project", "outline", "empty"],
  ["empty", "solid", "solid", "project", "project", "solid", "project", "solid", "project", "solid", "project", "solid"],
  ["outline", "empty", "project", "project", "solid", "project", "outline", "solid", "outline", "empty", "project", "outline"],
];

const ProjectGrid: React.FC<ProjectGridProps> = ({
  stamps,
  backgroundTextureUrl,
  snowPresentUrls,
  snowSeed,
  onSnowPresentClick,
}) => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fallbackThumbUrl = useMemo(
    () => new URL(`../assets/thumbnails/vision-tools.png`, import.meta.url).href,
    []
  );

  const [gridSize, setGridSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [gridOrigin, setGridOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number }>(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 0, h: 0 }
  );
  const [cellOffsets, setCellOffsets] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [textureNatural, setTextureNatural] = useState<{ w: number; h: number } | null>(null);

  const rows = 5;
  const cols = 12;

  // Only cells explicitly marked "project" are slots
  const projectSlots = useMemo(() => {
    const slots: Array<{ r: number; c: number }> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((gridMask[r]?.[c] ?? "empty") === "project") slots.push({ r, c });
      }
    }
    return slots;
  }, []);

  const slotIndexByCell = useMemo(() => {
    const m = new Map<string, number>();
    projectSlots.forEach((s, idx) => m.set(`${s.r}-${s.c}`, idx));
    return m;
  }, [projectSlots]);

  const recomputeTextureLayout = () => {
    const grid = gridRef.current;
    if (!grid) return;

    const gridRect = grid.getBoundingClientRect();
    const nextOffsets = new Map<string, { x: number; y: number }>();
    const els = grid.querySelectorAll<HTMLDivElement>(".grid-cell[data-cell-key]");

    els.forEach((el) => {
      const key = el.dataset.cellKey;
      if (!key) return;
      const r = el.getBoundingClientRect();
      nextOffsets.set(key, { x: r.left - gridRect.left, y: r.top - gridRect.top });
    });

    setGridSize({ w: gridRect.width, h: gridRect.height });
    setGridOrigin({ x: gridRect.left, y: gridRect.top });
    setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    setCellOffsets(nextOffsets);
  };

  useEffect(() => {
    if (!backgroundTextureUrl) {
      setTextureNatural(null);
      return;
    }
    const img = new Image();
    img.src = backgroundTextureUrl;
    img.onload = () => {
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      if (w > 0 && h > 0) setTextureNatural({ w, h });
    };
  }, [backgroundTextureUrl]);

  useLayoutEffect(() => {
    recomputeTextureLayout();
    const id = requestAnimationFrame(() => recomputeTextureLayout());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundTextureUrl, stamps]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    recomputeTextureLayout(); // run once on mount so we have offsets/origin immediately
    const ro = new ResizeObserver(() => recomputeTextureLayout());
    ro.observe(grid);
    window.addEventListener("resize", recomputeTextureLayout);
    window.addEventListener("scroll", recomputeTextureLayout, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recomputeTextureLayout);
      window.removeEventListener("scroll", recomputeTextureLayout);
    };
  }, []);

  const spiralDelays = useMemo(() => {
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);

    const delays: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const items: { r: number; c: number; spiral: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = c - centerCol;
        const dy = r - centerRow;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const spiral = distance + (angle + Math.PI) / (Math.PI * 2);
        items.push({ r, c, spiral });
      }
    }

    items.sort((a, b) => a.spiral - b.spiral);
    items.forEach((item, idx) => {
      delays[item.r][item.c] = idx * 25;
    });

    return delays;
  }, []);

  // Snow view: only one present (random solid/outline cell); rest stay as outlines
  const presentByCell = useMemo(() => {
    const map = new Map<string, string>();
    if (!snowPresentUrls || snowSeed == null) return map;

    const mulberry32 = (a: number) => () => {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const rand = mulberry32(snowSeed >>> 0);

    const candidateKeys: string[] = [];
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        const type = gridMask[rr]?.[cc] ?? "empty";
        const isGrey = type === "solid" || type === "outline";
        const isProjectSlot = type === "project";
        if (!isGrey || isProjectSlot) continue;
        candidateKeys.push(`cell-${rr}-${cc}`);
      }
    }
    if (candidateKeys.length === 0) return map;
    const pick = Math.floor(rand() * candidateKeys.length) % candidateKeys.length;
    const oneKey = candidateKeys[pick];
    const idx = rand() < 0.5 ? 0 : 1;
    map.set(oneKey, snowPresentUrls[idx]);
    return map;
  }, [snowPresentUrls?.[0], snowPresentUrls?.[1], snowSeed]);

  // Simplified mobile view: 2-column grid of clickable icons under title + filters
  const mobileStamps = useMemo(
    () => stamps.filter((s): s is { id: string; name: string } => s != null),
    [stamps]
  );

  if (isMobile) {
    return (
      <div className="project-grid project-grid-mobile">
        {mobileStamps.map((stamp) => (
          <div
            key={stamp.id}
            className="project-grid-mobile-cell"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/projects/${stamp.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/projects/${stamp.id}`);
              }
            }}
          >
            <div className="project-tile">
              <img
                src={getThumbUrl(stamp.id)}
                alt={stamp.name}
                className="thumb"
                loading="lazy"
                data-format-tried="jpg"
                onLoad={(e) => {
                  e.currentTarget.classList.add("loaded");
                  const tile = e.currentTarget.parentElement;
                  const cell = tile?.parentElement;
                  if (cell) cell.classList.add("media-loaded");
                }}
                onError={(e) => {
                  const img = e.currentTarget;
                  const formatTried = img.getAttribute("data-format-tried");
                  const tile = img.parentElement;
                  const cell = tile?.parentElement;
                  if (formatTried === "jpg") {
                    img.onerror = null;
                    img.setAttribute("data-format-tried", "png");
                    img.src = getThumbUrl(stamp.id, "png");
                    img.onerror = () => {
                      img.onerror = null;
                      img.src = fallbackThumbUrl;
                      img.style.display = "";
                      if (cell) {
                        cell.classList.add("media-error", "media-loaded");
                      }
                      img.onload = () => {
                        img.classList.add("loaded");
                        if (cell) cell.classList.add("media-loaded");
                      };
                    };
                  } else {
                    img.onerror = null;
                    img.src = fallbackThumbUrl;
                    img.style.display = "";
                    if (cell) {
                      cell.classList.add("media-error", "media-loaded");
                    }
                    img.onload = () => {
                      img.classList.add("loaded");
                      if (cell) cell.classList.add("media-loaded");
                    };
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="project-grid" ref={gridRef}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const baseType = gridMask[r]?.[c] ?? "empty";

          const slotIdx = baseType === "project" ? slotIndexByCell.get(`${r}-${c}`) : undefined;
          const cellStamp = slotIdx != null ? stamps[slotIdx] ?? null : null;
          // Any project slot without a stamp (filtered-out or "future") should render as a light outline,
          // and still participate in the grid load animation.
          const isEmptyProjectSlot = baseType === "project" && !cellStamp;
          // In snow mode, grey solid cells render as outlines (only the one present cell shows an image).
          const snowMode = Boolean(snowPresentUrls);
          const renderType =
            isEmptyProjectSlot
              ? "outline"
              : snowMode && baseType === "solid"
                ? "outline"
                : baseType;

          // Texture applies only to SOLID cells, and not in snow mode (snow mode shows outlines only)
          const isTextureCell = Boolean(backgroundTextureUrl) && baseType === "solid" && !snowMode;

          const key = `cell-${r}-${c}`;
          const measured = cellOffsets.get(key);
          const gridW = gridSize.w;
          const gridH = gridSize.h;
          const offset = measured != null
            ? measured
            : gridW > 0 && gridH > 0
              ? { x: (c / cols) * gridW, y: (r / rows) * gridH }
              : null;

          // Texture: one image sized to cover the grid; each cell is a window via negative offset.
          const textureStyle =
            isTextureCell && backgroundTextureUrl && offset && gridW > 0 && gridH > 0
              ? (() => {
                  // "cover" sizing: image fills entire grid (may crop)
                  const imgAspect = textureNatural
                    ? textureNatural.w / textureNatural.h
                    : 1920 / 1280;
                  const gridAspect = gridW / gridH;
                  let sizeX: number, sizeY: number;
                  if (imgAspect > gridAspect) {
                    // image wider than grid → match height, overflow width
                    sizeY = gridH;
                    sizeX = gridH * imgAspect;
                  } else {
                    // image taller → match width, overflow height
                    sizeX = gridW;
                    sizeY = gridW / imgAspect;
                  }
                  // Center the image on the grid
                  const centerX = (gridW - sizeX) / 2;
                  const centerY = (gridH - sizeY) / 2;
                  // Each cell shows the slice at its position
                  const posX = centerX - offset.x;
                  const posY = centerY - offset.y;
                  return {
                    ["--tex-image" as any]: `url("${backgroundTextureUrl}")`,
                    ["--tex-size-x" as any]: `${sizeX}px`,
                    ["--tex-size-y" as any]: `${sizeY}px`,
                    ["--tex-pos-x" as any]: `${posX}px`,
                    ["--tex-pos-y" as any]: `${posY}px`,
                    backgroundColor: "transparent",
                  } as React.CSSProperties;
                })()
              : undefined;

          const presentSrc = presentByCell.get(key) ?? null;
          const isDecorationCell = Boolean(presentSrc);

          // Important: only mark non-empty cells as "visible"
          const classNames = [
            "grid-cell",
            renderType,
            renderType !== "empty" ? "visible" : "",
            isEmptyProjectSlot ? "empty-project-slot" : "",
            isTextureCell ? "texture-cell" : "",
            isDecorationCell ? "decor-cell" : "",
          ]
            .filter(Boolean)
            .join(" ");

          // Important: only clickable if it is a real project stamp or a present decoration
          const isClickable = (baseType === "project" && Boolean(cellStamp)) || isDecorationCell;

          return (
            <div
              key={key}
              data-cell-key={key}
              className={classNames}
              style={
                {
                  ...(textureStyle || {}),
                  animationDelay: `${spiralDelays[r][c]}ms`,
                } as React.CSSProperties
              }
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : -1}
              onClick={() => {
                if (baseType === "project" && cellStamp) navigate(`/projects/${cellStamp.id}`);
                else if (isDecorationCell) onSnowPresentClick?.();
              }}
              onKeyDown={(e) => {
                if (!isClickable) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (baseType === "project" && cellStamp) navigate(`/projects/${cellStamp.id}`);
                  else if (isDecorationCell) onSnowPresentClick?.();
                }
              }}
            >
              {presentSrc ? (
                <img src={presentSrc} alt="Present decoration" className="grid-decoration" draggable={false} />
              ) : null}

              {baseType === "project" && cellStamp ? (
                <div className="project-tile">
                  <img
                    src={getThumbUrl(cellStamp.id)}
                    alt={cellStamp.name}
                    className="thumb"
                    loading="lazy"
                    data-format-tried="jpg"
                    onLoad={(e) => {
                      e.currentTarget.classList.add("loaded");
                      // Go up two levels: img -> project-tile -> grid-cell.project
                      const tile = e.currentTarget.parentElement;
                      const cell = tile?.parentElement;
                      if (cell) cell.classList.add("media-loaded");
                    }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      const formatTried = img.getAttribute('data-format-tried');
                      // Go up two levels: img -> project-tile -> grid-cell.project
                      const tile = img.parentElement;
                      const cell = tile?.parentElement;
                      
                      // Try PNG if JPG failed
                      if (formatTried === 'jpg') {
                        img.onerror = null; // prevent loops
                        img.setAttribute('data-format-tried', 'png');
                        img.src = getThumbUrl(cellStamp.id, 'png');
                        img.onerror = () => {
                          // If PNG also fails, use fallback
                          img.onerror = null;
                          img.src = fallbackThumbUrl;
                          img.style.display = "";
                          if (cell) {
                            cell.classList.add("media-error");
                            cell.classList.add("media-loaded"); // Stop shimmer animation
                          }
                          // Ensure fallback image also triggers loaded state
                          img.onload = () => {
                            img.classList.add("loaded");
                            if (cell) cell.classList.add("media-loaded");
                          };
                        };
                      } else {
                        // PNG also failed or already tried, use fallback
                        img.onerror = null;
                        img.src = fallbackThumbUrl;
                        img.style.display = "";
                        if (cell) {
                          cell.classList.add("media-error");
                          cell.classList.add("media-loaded"); // Stop shimmer animation
                        }
                        // Ensure fallback image also triggers loaded state
                        img.onload = () => {
                          img.classList.add("loaded");
                          if (cell) cell.classList.add("media-loaded");
                        };
                      }
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProjectGrid;
