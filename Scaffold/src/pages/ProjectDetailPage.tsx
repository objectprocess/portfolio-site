import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { findProjectById, projects } from '../data/projects';
import { getImageUrlsForTitle } from '../utils/projectImages';
import { renderRichTextHtml } from '../utils/sanitizeRichText';

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const fallbackImageUrl = useMemo(
    () => new URL('../assets/thumbnails/vision-tools.png', import.meta.url).href,
    []
  );

  const projectId = String(id);
  const project = String(projectId) ? findProjectById(projectId) : undefined;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isGalleryOverlayOpen, setIsGalleryOverlayOpen] = useState(false);
  const [isGalleryFullscreen, setIsGalleryFullscreen] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Keep nav order the same as your `projects` array.
  const ordered = useMemo(() => [...projects], []);
  const index = useMemo(() => ordered.findIndex((p) => p.id === projectId), [ordered, projectId]);

  const prev = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined;

  const isMobileLayout = viewportSize.width > 0 && viewportSize.width <= 980;

  const imageUrls = useMemo(() => {
    if (!project) return [];

    // Preferred: explicit media list for media projects
    if (project.type === 'media') {
      if (Array.isArray(project.media) && project.media.length > 0) return project.media;

      const folderUrls = getImageUrlsForTitle(project.title);
      if (folderUrls.length > 0) return folderUrls;

      // Media project but no media yet: show placeholder
      return [fallbackImageUrl];
    }

    // Text projects: optional folder images, otherwise no gallery
    return getImageUrlsForTitle(project.title);
  }, [fallbackImageUrl, project]);
  const hasImages = imageUrls.length > 0;

  // Helper to check if a URL is a video file
  const isVideo = (url: string): boolean => {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  };

  // Reset gallery index when changing projects
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageAspectRatio(null); // Reset aspect ratio when changing projects
  }, [projectId]);

  // Reset aspect ratio when image index changes (will be recalculated on image load)
  // Also pause any playing video when navigating
  useEffect(() => {
    setImageAspectRatio(null);
    // Pause and reset video if it exists and we're switching away from a video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load(); // Force reload for new source
    }
  }, [currentImageIndex, imageUrls]);

  // Keep in sync with native fullscreen state (if supported)
  useEffect(() => {
    const onFsChange = () => {
      setIsGalleryFullscreen(document.fullscreenElement === galleryRef.current);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Track viewport size for fullscreen calculations
  useEffect(() => {
    const updateViewport = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // If we're using overlay fallback, prevent background scrolling
  useEffect(() => {
    if (!isGalleryOverlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isGalleryOverlayOpen]);

  const isGalleryOpen = isGalleryOverlayOpen || isGalleryFullscreen;

  // Calculate fullscreen frame dimensions based on image aspect ratio
  const fullscreenFrameStyle = useMemo(() => {
    if (!isGalleryOpen || !imageAspectRatio) return undefined;
    
    const maxWidth = Math.min(viewportSize.width * 0.94, 1400);
    const maxHeight = Math.min(viewportSize.height * 0.92, 900);
    
    // Calculate dimensions that fit within max constraints while maintaining aspect ratio
    let width = maxWidth;
    let height = width / imageAspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * imageAspectRatio;
    }
    
    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  }, [isGalleryOpen, imageAspectRatio, viewportSize]);

  const exitGalleryFullscreen = async () => {
    if (isGalleryOverlayOpen) setIsGalleryOverlayOpen(false);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
  };

  const enterGalleryFullscreen = async () => {
    const el = galleryRef.current;
    if (!el) return;
    // Prefer native fullscreen for best UX
    if (typeof el.requestFullscreen === 'function') {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // fall through to overlay
      }
    }
    setIsGalleryOverlayOpen(true);
  };

  const toggleGalleryFullscreen = async () => {
    if (isGalleryOpen) {
      await exitGalleryFullscreen();
    } else {
      await enterGalleryFullscreen();
    }
  };

  // Escape: exit gallery fullscreen if open, otherwise return to grid
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isGalleryOpen) {
          exitGalleryFullscreen();
          return;
        }
        navigate('/');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGalleryOpen, navigate]);

  if (!project) {
    return (
      <div className="container project-detail">
        <div className="project-detail-top">
          <button className="ui-button" onClick={() => navigate('/')}>Back</button>
        </div>
        <div className="project-detail-center">
          <h1>Project not found</h1>
          <p>That project id doesn’t exist.</p>
        </div>
      </div>
    );
  }

  const showGalleryPrev = () => setCurrentImageIndex(i => Math.max(0, i - 1));
  const showGalleryNext = () => setCurrentImageIndex(i => Math.min(imageUrls.length - 1, i + 1));

  // Gallery navigation with keyboard when gallery is open (fullscreen/overlay)
  useEffect(() => {
    if (!isGalleryOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showGalleryPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showGalleryNext();
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false } as any);
    return () => window.removeEventListener('keydown', onKeyDown as any);
  }, [isGalleryOpen, imageUrls.length]);

  return (
    <div className={`container project-detail${hasImages ? '' : ' no-media'}`}>
      {!isMobileLayout && (
        <div className="project-detail-top">
          <button className="ui-button" onClick={() => navigate('/')}>Back to Projects</button>
        </div>
      )}

      <div className="project-detail-layout">
        {/* Row 1 / Col 1: Previous */}
        <aside className="project-detail-side left project-detail-prev">
          {prev ? (
            <Link className="project-detail-nav" to={`/projects/${prev.id}`}>
              <div className="project-detail-navLabel">{isMobileLayout ? '' : 'Previous'}</div>
              <div className="project-detail-navTitle">{isMobileLayout ? 'Previous Project' : prev.title}</div>
            </Link>
          ) : (
            <div className="project-detail-nav disabled">
              <div className="project-detail-navLabel">{isMobileLayout ? '' : 'Previous'}</div>
              <div className="project-detail-navTitle">{isMobileLayout ? 'Previous Project' : '—'}</div>
            </div>
          )}
        </aside>

        {/* Row 2 / Col 1: Description (height matches gallery) */}
        <aside className="project-detail-side left project-detail-description">
          {project.description ? (
            <div className="project-detail-panel">
              <div className="project-detail-panelLabel">Description</div>
              <div
                className="project-detail-panelBody"
                dangerouslySetInnerHTML={{ __html: renderRichTextHtml(project.description) }}
              />
            </div>
          ) : (
            <div className="project-detail-panel">
              <div className="project-detail-panelLabel">Description</div>
              <div className="project-detail-panelBody">—</div>
            </div>
          )}
        </aside>

        {/* Row 1 / Col 2: Title + meta */}
        <main className="project-detail-center project-detail-head">
          {hasImages ? (
            <>
              <h1 className="project-detail-title">{project.title}</h1>
            </>
          ) : (
            <>
              {/* No images: center becomes the writing/content area */}
              <h1 className="project-detail-title">{project.title}</h1>
            </>
          )}
        </main>

        {/* Row 1 / Col 3: Next */}
        <aside className="project-detail-side right project-detail-next">
          {next ? (
            <Link className="project-detail-nav" to={`/projects/${next.id}`}>
              <div className="project-detail-navLabel">{isMobileLayout ? '' : 'Next'}</div>
              <div className="project-detail-navTitle">{isMobileLayout ? 'Next Project' : next.title}</div>
            </Link>
          ) : (
            <div className="project-detail-nav disabled">
              <div className="project-detail-navLabel">{isMobileLayout ? '' : 'Next'}</div>
              <div className="project-detail-navTitle">{isMobileLayout ? 'Next Project' : '—'}</div>
            </div>
          )}
        </aside>

        {/* Row 2 / Col 2: Gallery and/or writing (height matches side panels) */}
        <section className="project-detail-center project-detail-content">
          {hasImages ? (
            <div
              ref={galleryRef}
              className={`project-detail-gallery${isGalleryOverlayOpen ? ' is-overlay' : ''}`}
              aria-label="Project gallery (click to toggle fullscreen)"
            >
              {isGalleryOpen ? (
                <button
                  className="ui-button project-detail-galleryClose"
                  onClick={() => exitGalleryFullscreen()}
                  type="button"
                >
                  Close
                </button>
              ) : null}

              <button
                className="nav-button prev-button"
                onClick={showGalleryPrev}
                disabled={currentImageIndex === 0}
                aria-label="Previous image"
                onDoubleClick={(e) => e.stopPropagation()}
              >
                ←
              </button>

              <div 
                className="project-detail-galleryFrame" 
                onClick={toggleGalleryFullscreen}
                style={fullscreenFrameStyle}
              >
                {isVideo(imageUrls[currentImageIndex]) ? (
                  <video
                    key={imageUrls[currentImageIndex]}
                    ref={videoRef}
                    src={imageUrls[currentImageIndex]}
                    className="project-detail-galleryImage"
                    controls
                    playsInline
                    muted
                    loop
                    autoPlay
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      const aspectRatio = video.videoWidth / video.videoHeight;
                      setImageAspectRatio(aspectRatio);
                    }}
                    onError={(e) => {
                      console.error('Video failed to load:', imageUrls[currentImageIndex]);
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    key={imageUrls[currentImageIndex]}
                    src={imageUrls[currentImageIndex]}
                    alt={`${project.title} image ${currentImageIndex + 1}`}
                    className="project-detail-galleryImage"
                    loading="lazy"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      const aspectRatio = img.naturalWidth / img.naturalHeight;
                      setImageAspectRatio(aspectRatio);
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrls[currentImageIndex]);
                    }}
                  />
                )}
              </div>

              <button
                className="nav-button next-button"
                onClick={showGalleryNext}
                disabled={currentImageIndex >= imageUrls.length - 1}
                aria-label="Next image"
                onDoubleClick={(e) => e.stopPropagation()}
              >
                →
              </button>
            </div>
          ) : null}
          
          {project.body?.trim() ? (
            <div className="project-detail-body">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderRichTextHtml(project.body),
                }}
              />
            </div>
          ) : hasImages ? null : (
            <div className="project-detail-body">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderRichTextHtml('<p><em>Project write‑up coming soon.</em></p><p>This area will eventually support full HTML or Markdown content.</p>'),
                }}
              />
            </div>
          )}
        </section>

        {/* Row 2 / Col 3: Credits (height matches gallery) */}
        <aside className="project-detail-side right project-detail-credits">
          <div className="project-detail-panel">
            <div className="project-detail-panelLabel">Credits</div>
            <div className="project-detail-panelBody">
              <div className="project-detail-creditsRow">
                <span className="project-detail-creditsKey">ID:</span>
                <span className="project-detail-creditsValue">{project.id}</span>
              </div>
              <div className="project-detail-creditsRow">
                <span className="project-detail-creditsKey">Type:</span>
                <span className="project-detail-creditsValue">{project.type}</span>
              </div>
              <div className="project-detail-creditsRow">
                <span className="project-detail-creditsKey">Tags:</span>
                <span className="project-detail-creditsValue">
                  {Array.isArray(project.tags) && project.tags.length ? project.tags.join(', ') : '—'}
                </span>
              </div>

              {Array.isArray(project.credits) && project.credits.length ? (
                <>
                  {project.credits.map((c, i) => (
                    <div
                      className="project-detail-creditsRow project-detail-creditsRow--entry"
                      key={`${c.role}-${c.name}-${i}`}
                    >
                      <span className="project-detail-creditsKey">{c.role}:</span>
                      {String(c.role).trim().toLowerCase() === "url" ? (
                        <span
                          className="project-detail-creditsValue"
                          dangerouslySetInnerHTML={{ __html: renderRichTextHtml(c.name) }}
                        />
                      ) : (
                        <span className="project-detail-creditsValue">{c.name}</span>
                      )}
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetailPage;

