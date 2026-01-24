import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import ProjectGrid from "./components/ProjectGrid";
import Filters from "./components/Filters";
import AboutPage from "./components/AboutPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

import { WeatherLayer } from "./components/WeatherLayer";
import { useWeather } from "./context/WeatherContext";
import SnowVoidExplorerR3FOverlay from "./components/SnowVoidExplorerR3FOverlay";

import "./App.css";

// IMPORTANT: import from the folder index to avoid colliding with src/data/projects.ts
import { projects } from "./data/projects/index";
import { TAGS } from "./data/projects/types";

// Grid background textures
import gridBgDefault from "./assets/BG Images/DSC_0286.JPG?url";
import gridBgRain from "./assets/BG Images/ayearoftheland-1edit.jpg?url";

import present1 from "./assets/BG Images/present1.svg?url";
import present2 from "./assets/BG Images/present2.svg?url";

type Stamp = { id: string; name: string };
type StampSlot = Stamp | null;

const App: React.FC = () => {
  const { mode: weatherMode } = useWeather();

  const [snowSeed, setSnowSeed] = useState<number>(() =>
    Math.floor(Math.random() * 1_000_000_000)
  );
  const [snowEggOpen, setSnowEggOpen] = useState(weatherMode === "snow");
  const [key, setKey] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const activeBgTextureUrl = useMemo(() => {
    if (weatherMode === "snow") return null;
    if (weatherMode === "rain") return gridBgRain;
    return gridBgDefault;
  }, [weatherMode]);

  useEffect(() => {
    if (weatherMode === "snow") {
      setSnowSeed(Math.floor(Math.random() * 1_000_000_000));
    } else {
      setSnowEggOpen(false);
    }
  }, [weatherMode]);

  // Build stamps directly from projects
  const allStamps: Stamp[] = useMemo(() => {
    return projects.map((p) => ({ id: p.id, name: p.title }));
  }, []);

  // Tag lookup by project id
  const idToTags = useMemo(() => {
    const map = new Map<string, string[]>();
    projects.forEach((p) => {
      map.set(p.id, Array.isArray(p.tags) ? p.tags : []);
    });
    return map;
  }, []);

  // Your controlled filter buttons
  const availableTags = useMemo(() => [...TAGS], []);

  // Apply tag filtering
  // Keep stamp positions stable (no re-sorting/compacting) by nulling filtered-out slots.
  // This way the grid preserves the original layout and leaves "holes" where items were filtered out.
  const filteredStamps: StampSlot[] = useMemo(() => {
    if (selectedTags.size === 0) return allStamps;

    return allStamps.map((stamp) => {
      const tags = idToTags.get(stamp.id) || [];
      for (const t of selectedTags) {
        if (!tags.includes(t)) return null;
      }
      return stamp;
    });
  }, [allStamps, idToTags, selectedTags]);

  // Trigger grid animation reset when filters change
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [selectedTags]);

  // Escape clears tag filter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTags(new Set());
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.has(tag)) return new Set();
      return new Set([tag]);
    });
  };

  return (
    <>
      <WeatherLayer />
      <SnowVoidExplorerR3FOverlay
        open={snowEggOpen}
        onClose={() => setSnowEggOpen(false)}
      />

      <div className="app-foreground">
        <Router>
          <Header />

          <Routes>
            <Route
              path="/"
              element={
                <div className="main-layout">
                  <div className="container">
                    <Filters
                      tags={availableTags}
                      selected={selectedTags}
                      onToggle={handleToggleTag}
                    />

                    <ProjectGrid
                      key={key}
                      stamps={filteredStamps}
                      backgroundTextureUrl={activeBgTextureUrl}
                      snowPresentUrls={
                        weatherMode === "snow" ? [present1, present2] : undefined
                      }
                      snowSeed={weatherMode === "snow" ? snowSeed : undefined}
                      onSnowPresentClick={
                        weatherMode === "snow"
                          ? () => setSnowEggOpen(true)
                          : undefined
                      }
                    />
                  </div>
                </div>
              }
            />

            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>

          <div className="footer-container">
            <footer className="footer">
              <div className="footer-left">
                Copyright © {new Date().getFullYear()} Joseph Gleasure
              </div>
            </footer>
          </div>
        </Router>
      </div>
    </>
  );
};

export default App;
