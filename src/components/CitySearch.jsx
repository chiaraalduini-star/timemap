import { useState, useMemo } from 'react';
import { SITES } from '../data/historicalData';

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function CitySearch({
  regionCities, currentEra, selectedCities, onCityToggle,
  selectedSites, onSiteToggle,
}) {
  const [query,      setQuery]      = useState('');
  const [open,       setOpen]       = useState(false);
  const [searchMode, setSearchMode] = useState('cities'); // 'cities' | 'sites'

  const totalSelected = selectedCities.size + selectedSites.size;
  const atMax = totalSelected >= 4;

  // ── City suggestions ──────────────────────────────────────────
  const citySuggestions = useMemo(() => {
    if (searchMode !== 'cities') return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return regionCities
      .filter(city => city.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, regionCities, searchMode]);

  // ── Site suggestions ──────────────────────────────────────────
  const siteSuggestions = useMemo(() => {
    if (searchMode !== 'sites') return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SITES
      .filter(s => s.name.toLowerCase().includes(q) || s.civilization.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, searchMode]);

  const hasResults = searchMode === 'cities'
    ? citySuggestions.length > 0
    : siteSuggestions.length > 0;

  function switchMode(mode) {
    setSearchMode(mode);
    setQuery('');
    setOpen(false);
  }

  function handleCityPick(city) {
    const isSelected = selectedCities.has(city.id);
    if (!isSelected && atMax) return;
    onCityToggle(city.id);
    if (!isSelected) { setQuery(''); setOpen(false); }
  }

  function handleSitePick(site) {
    const isSelected = selectedSites.has(site.id);
    if (!isSelected && atMax) return;
    onSiteToggle(site.id);
    if (!isSelected) { setQuery(''); setOpen(false); }
  }

  const placeholder = atMax
    ? 'Max 4 selected — remove one to add another'
    : searchMode === 'cities'
      ? 'Search for a city…'
      : 'Search for an archaeological site…';

  return (
    <div className="city-search">
      {/* ── Mode toggle tabs ── */}
      <div className="search-mode-tabs">
        <button
          type="button"
          className={`smt-btn${searchMode === 'cities' ? ' smt-btn--on-cities' : ''}`}
          onMouseDown={e => { e.preventDefault(); switchMode('cities'); }}
          tabIndex={-1}
        >
          Cities
        </button>
        <button
          type="button"
          className={`smt-btn smt-btn--sites${searchMode === 'sites' ? ' smt-btn--on-sites' : ''}`}
          onMouseDown={e => { e.preventDefault(); switchMode('sites'); }}
          tabIndex={-1}
        >
          Sites
        </button>
      </div>

      {/* ── Search input ── */}
      <div className="city-search-wrap">
        <span className="city-search-icon"><IconSearch /></span>
        <input
          className="city-search-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          aria-label={searchMode === 'cities' ? 'Search for a city' : 'Search for an archaeological site'}
          aria-autocomplete="list"
          aria-expanded={open && hasResults}
        />
        {query && (
          <button
            className="city-search-x"
            onMouseDown={e => { e.preventDefault(); setQuery(''); }}
            aria-label="Clear search"
            tabIndex={-1}
          >×</button>
        )}
      </div>

      {/* ── City dropdown ── */}
      {open && searchMode === 'cities' && citySuggestions.length > 0 && (
        <ul className="city-search-dropdown" role="listbox">
          {citySuggestions.map(city => {
            const isSelected = selectedCities.has(city.id);
            const disabled   = !isSelected && atMax;
            const eraData    = city.eras[currentEra?.id];
            return (
              <li
                key={city.id}
                className={`city-search-item${isSelected ? ' on-map' : ''}${disabled ? ' disabled' : ''}`}
                onMouseDown={() => handleCityPick(city)}
                role="option"
                aria-selected={isSelected}
              >
                <span className="csi-name">{city.name}</span>
                {eraData?.population > 0 && (
                  <span className="csi-meta">{eraData.civilization}</span>
                )}
                <span className="csi-badge">
                  {isSelected ? 'Remove' : disabled ? 'Max 4' : 'Add'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Site dropdown ── */}
      {open && searchMode === 'sites' && siteSuggestions.length > 0 && (
        <ul className="city-search-dropdown" role="listbox">
          {siteSuggestions.map(site => {
            const isSelected = selectedSites.has(site.id);
            const disabled   = !isSelected && atMax;
            return (
              <li
                key={site.id}
                className={`city-search-item site-item${isSelected ? ' on-map' : ''}${disabled ? ' disabled' : ''}`}
                onMouseDown={() => handleSitePick(site)}
                role="option"
                aria-selected={isSelected}
              >
                <span className="csi-name">{site.name}</span>
                <span className="csi-meta">{site.civilization} · {site.period}</span>
                <span className="csi-badge csi-badge--site">
                  {isSelected ? 'Remove' : disabled ? 'Max 4' : 'Add'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── No results ── */}
      {open && query.trim() && !hasResults && (
        <div className="city-search-empty">
          {searchMode === 'cities'
            ? `No ${currentEra?.label?.toLowerCase()} era cities match "${query}"`
            : `No archaeological sites match "${query}"`}
        </div>
      )}
    </div>
  );
}
