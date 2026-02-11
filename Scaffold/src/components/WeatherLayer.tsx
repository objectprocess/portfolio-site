import React from 'react';
import { useWeather } from '../context/WeatherContext';

const srcByMode: Record<'rain' | 'snow', string> = {
  rain: '/weather/rain/index.html',
  snow: '/weather/snow/index.html',
};

export const WeatherLayer: React.FC = () => {
  const { mode } = useWeather();

  if (mode === 'none') return null;

  const src = srcByMode[mode];

  return (
    <div className="weather-layer" aria-hidden="true">
      <iframe
        key={mode}
        className="weather-iframe"
        src={src}
        title={mode === 'rain' ? 'Rain background' : 'Snow background'}
        tabIndex={-1}
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="weather-tint" />
    </div>
  );
};

