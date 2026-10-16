import React from 'react';
import { useWeather } from '../context/WeatherContext';

const srcByMode: Record<'rain' | 'snow', string> = {
  rain: '/weather/index.html?mode=rain',
  snow: '/weather/index.html?mode=snow',
};

export const WeatherLayer: React.FC = () => {
  const { effectiveMode } = useWeather();

  if (effectiveMode === 'none') return null;

  const src = srcByMode[effectiveMode];

  return (
    <div className="weather-layer" aria-hidden="true">
      <iframe
        key={effectiveMode}
        className="weather-iframe"
        src={src}
        title={effectiveMode === 'rain' ? 'Rain background' : 'Snow background'}
        tabIndex={-1}
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="weather-tint" />
    </div>
  );
};

