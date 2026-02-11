import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeather } from '../context/WeatherContext';

const Header = () => {
  const [brandHovered, setBrandHovered] = useState(false);
  const [overlayKey, setOverlayKey] = useState(0);
  const { mode, toggle, isMobile } = useWeather();

  const nameChars = useMemo(() => 'Joseph Gleasure'.split(''), []);
  const locationChars = useMemo(() => 'Vancouver B.C.'.split(''), []);

  return (
    <header className="proto-header">
      <div className="container header-container">
        <svg className="header-lines" width="100%" height="100%" preserveAspectRatio="none">
          {/* Horizontal rules spanning the container */}
          <line x1="0" y1="32" x2="100%" y2="32" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="84" x2="100%" y2="84" stroke="currentColor" strokeWidth="1" />
        </svg>
        <div className="header-content">
          <Link
            to="/"
            className={`brand-initials ${brandHovered ? 'expanded' : ''}`}
            onMouseEnter={() => {
              setOverlayKey(k => k + 1);
              setBrandHovered(true);
            }}
            onMouseLeave={() => setBrandHovered(false)}
            aria-label="Joseph Gleasure"
          >
            <span className="brand-abbr">J.G.</span>
            <span className="brand-full">
              {nameChars.map((ch, i) => (
                <span key={`bf-${i}`} className="char" style={{ ['--i' as any]: i } as React.CSSProperties}>
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              ))}
            </span>
          </Link>
          <nav className="proto-nav center-menu">
            <Link className="proto-nav-button" to="/about">About</Link>
            <Link className="proto-nav-button" to="/">Projects</Link>
          </nav>

          {!isMobile && (
            <div className="weather-toggles" aria-label="Weather themes">
              <button
                type="button"
                className={`weather-toggle ${mode === 'snow' ? 'active' : ''}`}
                aria-pressed={mode === 'snow'}
                onClick={() => toggle('snow')}
                title="Toggle snow"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M3 12h18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={`weather-toggle ${mode === 'rain' ? 'active' : ''}`}
                aria-pressed={mode === 'rain'}
                onClick={() => toggle('rain')}
                title="Toggle rain"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M12 2c3.2 4.1 6 7.2 6 11a6 6 0 1 1-12 0c0-3.8 2.8-6.9 6-11Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed overlay: big centered name/location (simple fade) */}
      <div className={`overlay-typing ${brandHovered ? 'show' : ''}`} key={overlayKey} aria-hidden={!brandHovered}>
        <div className="overlay-box">
          <div className="overlay-title">Joseph Gleasure</div>
          <div className="overlay-subline">Vancouver B.C.</div>
        </div>
      </div>
    </header>
  );
};

export default Header;