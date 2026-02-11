import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type WeatherMode = 'none' | 'rain' | 'snow';

const MOBILE_MAX_WIDTH = 980;

interface WeatherContextValue {
  mode: WeatherMode;
  /** Same as mode on desktop; 'none' on mobile so weather is disabled. */
  effectiveMode: WeatherMode;
  setMode: (next: WeatherMode) => void;
  toggle: (next: Exclude<WeatherMode, 'none'>) => void;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

const STORAGE_KEY = 'weatherMode';

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<WeatherMode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'rain' || raw === 'snow' || raw === 'none') return raw;
    } catch {
      // ignore
    }
    return 'none';
  });

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    handler();
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const effectiveMode: WeatherMode = isMobile ? 'none' : mode;

  useEffect(() => {
    document.body.classList.toggle('weather-on', effectiveMode !== 'none');
    document.body.classList.toggle('weather-rain', effectiveMode === 'rain');
    document.body.classList.toggle('weather-snow', effectiveMode === 'snow');
  }, [effectiveMode]);

  const value = useMemo<WeatherContextValue>(() => {
    return {
      mode,
      effectiveMode,
      setMode,
      toggle: (next) => setMode(prev => (prev === next ? 'none' : next)),
    };
  }, [mode, effectiveMode]);

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}

