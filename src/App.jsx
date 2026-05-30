import { useState, useCallback, useMemo } from 'react';
import WorldMap   from './components/WorldMap';
import Timeline   from './components/Timeline';
import SidePanel  from './components/SidePanel';
import MusicPlayer from './components/MusicPlayer';
import CitySearch from './components/CitySearch';
import { useEraAudio } from './hooks/useEraAudio';
import { CITIES, REGIONS, CITY_REGION, getEraForYear } from './data/historicalData';

const MAX_ITEMS = 4;

export default function App() {
  const [currentYear,    setCurrentYear]    = useState(100);
  const [selectedCities, setSelectedCities] = useState(new Set());
  const [selectedSites,  setSelectedSites]  = useState(new Set());
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchKey,      setSearchKey]      = useState(0);

  const currentEra = getEraForYear(currentYear);
  const { isMuted, volume, autoStart, toggleMute, setVolume } = useEraAudio(currentEra?.id);

  const regionCities = useMemo(() =>
    selectedRegion === 'all'
      ? CITIES
      : CITIES.filter(c => CITY_REGION[c.id] === selectedRegion),
    [selectedRegion]
  );

  const handleYearChange = useCallback((year) => {
    setCurrentYear(year);
    autoStart();
  }, [autoStart]);

  const handleCityToggle = useCallback((cityId) => {
    autoStart();
    setSelectedCities(prev => {
      const next = new Set(prev);
      if (next.has(cityId)) {
        next.delete(cityId);
      } else if (next.size + selectedSites.size < MAX_ITEMS) {
        next.add(cityId);
      }
      return next;
    });
  }, [autoStart, selectedSites.size]);

  const handleSiteToggle = useCallback((siteId) => {
    setSelectedSites(prev => {
      const next = new Set(prev);
      if (next.has(siteId)) {
        next.delete(siteId);
      } else if (next.size + selectedCities.size < MAX_ITEMS) {
        next.add(siteId);
      }
      return next;
    });
  }, [selectedCities.size]);

  const handleDeselect = useCallback((cityId) => {
    setSelectedCities(prev => {
      const next = new Set(prev);
      next.delete(cityId);
      return next;
    });
  }, []);

  const handleSiteDeselect = useCallback((siteId) => {
    setSelectedSites(prev => {
      const next = new Set(prev);
      next.delete(siteId);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedCities(new Set());
    setSelectedSites(new Set());
    setSearchKey(k => k + 1);
  }, []);

  const handleRegionChange = useCallback((id) => {
    setSelectedRegion(id);
  }, []);

  const count = selectedCities.size + selectedSites.size;

  return (
    <div className="app">

      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">TimeMap</h1>
          <span className="app-subtitle">Historical World Explorer</span>
        </div>

        <CitySearch
          key={searchKey}
          regionCities={regionCities}
          currentEra={currentEra}
          selectedCities={selectedCities}
          onCityToggle={handleCityToggle}
          selectedSites={selectedSites}
          onSiteToggle={handleSiteToggle}
        />

        <div className="header-right">
          {count > 0 ? (
            <>
              <span className="header-hint">{count}/{MAX_ITEMS} selected</span>
              <button type="button" className="clear-btn" onClick={handleClearAll}>Clear all</button>
            </>
          ) : (
            <span className="header-hint">Search to explore</span>
          )}
        </div>
      </header>

      <nav className="region-bar" aria-label="Filter cities by region">
        {REGIONS.map(r => (
          <button
            key={r.id}
            className={`region-tab${selectedRegion === r.id ? ' region-tab--active' : ''}`}
            onClick={() => handleRegionChange(r.id)}
            aria-pressed={selectedRegion === r.id}
          >
            {r.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        <div className="map-area">
          <WorldMap
            currentEra={currentEra}
            selectedCities={selectedCities}
            onCityToggle={handleCityToggle}
            selectedSites={selectedSites}
            onSiteToggle={handleSiteToggle}
            selectedRegion={selectedRegion}
          />
        </div>

        <SidePanel
          selectedCities={selectedCities}
          selectedSites={selectedSites}
          currentEra={currentEra}
          onDeselect={handleDeselect}
          onSiteDeselect={handleSiteDeselect}
        />
      </main>

      <footer className="app-footer">
        <Timeline
          currentYear={currentYear}
          onYearChange={handleYearChange}
          currentEra={currentEra}
        />
        <MusicPlayer
          isMuted={isMuted}
          volume={volume}
          toggleMute={toggleMute}
          setVolume={setVolume}
          currentEra={currentEra}
        />
      </footer>
    </div>
  );
}
