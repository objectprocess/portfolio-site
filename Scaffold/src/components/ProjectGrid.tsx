import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  ["empty", "empty", "outline", "outline", "project", "project", "project", "solid", "outline", "empty", "empty", "project"],
  ["outline", "empty", "empty", "outline", "solid", "project", "solid", "project", "solid", "outline", "empty", "empty"],
  ["empty", "outline", "project", "project", "solid", "solid", "project", "empty", "solid", "project", "outline", "empty"],
  ["empty", "solid", "solid", "project", "project", "solid", "project", "solid", "project", "solid", "project", "solid"],
  ["empty", "outline", "project", "project", "solid", "project", "outline", "solid", "project", "solid", "project", "outline"],
];

const getThumbUrl = (id: string) => {
  // This may 404 if the specific thumbnail doesn't exist; we swap to a real fallback in onError.
  return new URL(`../assets/thumbnails/${id}.jpg`, import.meta.url).href;
};

const ProjectGrid: React.FC<ProjectGridProps> = ({
  stamps,
  backgroundTextureUrl,
  snowPresentUrls,
  snowSeed,
  onSnowPresentClick,
}) => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const fallbackThumbUrl = useMemo(
    () => new URL(`../assets/projects/fallback.jpg`, import.meta.url).href,
    []
  );

  const [gridSize, setGridSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
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
    const els = grid.querySelectorAll<HTMLDivElement>(".grid-cell.texture-cell");

    els.forEach((el) => {
      const key = el.dataset.cellKey;
      if (!key) return;
      const r = el.getBoundingClientRect();
      nextOffsets.set(key, { x: r.left - gridRect.left, y: r.top - gridRect.top });
    });

    setGridSize({ w: gridRect.width, h: gridRect.height });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundTextureUrl, stamps]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => recomputeTextureLayout());
    ro.observe(grid);
    window.addEventListener("resize", recomputeTextureLayout);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recomputeTextureLayout);
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

  // Snow presents can appear only on solid/outline cells (never on project cells)
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

    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        const key = `cell-${rr}-${cc}`;
        const type = gridMask[rr]?.[cc] ?? "empty";

        const isGrey = type === "solid" || type === "outline";
        const isProjectSlot = type === "project";
        if (!isGrey || isProjectSlot) continue;

        const idx = rand() < 0.5 ? 0 : 1;
        map.set(key, snowPresentUrls[idx]);
      }
    }
    return map;
  }, [snowPresentUrls?.[0], snowPresentUrls?.[1], snowSeed]);

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
          const renderType = isEmptyProjectSlot ? "outline" : baseType;

          // Texture applies only to SOLID cells
          const isTextureCell = Boolean(backgroundTextureUrl) && baseType === "solid";

          const key = `cell-${r}-${c}`;
          const offset = cellOffsets.get(key);

          const textureStyle =
            isTextureCell && backgroundTextureUrl && offset && gridSize.w && gridSize.h
              ? (() => {
                  const gridW = gridSize.w;
                  const gridH = gridSize.h;
                  const sizeX = (textureNatural?.w ?? gridW) * 0.5;
                  const sizeY = (textureNatural?.h ?? gridH) * 0.5;
                  const shiftX = (gridW - sizeX) / 2;
                  const shiftY = (gridH - sizeY) / 2;

                  return {
                    ["--tex-image" as any]: `url("${backgroundTextureUrl}")`,
                    ["--tex-size-x" as any]: `${sizeX}px`,
                    ["--tex-size-y" as any]: `${sizeY}px`,
                    ["--tex-pos-x" as any]: `${shiftX - offset.x}px`,
                    ["--tex-pos-y" as any]: `${shiftY - offset.y}px`,
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
                    onLoad={(e) => {
                      e.currentTarget.classList.add("loaded");
                      const parent = e.currentTarget.parentElement;
                      if (parent) parent.classList.add("media-loaded");
                    }}
                    onError={(e) => {
                      // Swap to a guaranteed-present placeholder, instead of hiding.
                      const img = e.currentTarget;
                      img.onerror = null; // prevent loops
                      img.src = fallbackThumbUrl;
                      img.style.display = "";
                      const parent = img.parentElement;
                      if (parent) parent.classList.add("media-error");
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
