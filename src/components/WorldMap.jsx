import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { CITIES, SITES, FEATURED_CITIES, FEATURED_CITIES_REGION } from '../data/historicalData';

const WIDTH = 960;
const HEIGHT = 500;

const popScale = d3.scaleSqrt().domain([0, 1200000]).range([7, 17]).clamp(true);

const FEATURED_R      = 5;
const FEATURED_FILL   = '#F5C842';
const FEATURED_STROKE = '#ffffff';
const SITE_FILL       = '#D4A017';

// Returns SVG polygon points string for a diamond centred at (cx,cy) with half-size r.
function diamond(cx, cy, r) {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
}

export default function WorldMap({
  currentEra, selectedCities, onCityToggle,
  selectedSites, onSiteToggle,
  selectedRegion = 'all',
}) {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredSite, setHoveredSite] = useState(null);

  const projection = useMemo(() =>
    d3.geoNaturalEarth1().scale(158).translate([WIDTH / 2, HEIGHT / 2 + 20]),
    []
  );
  const path      = useMemo(() => d3.geoPath().projection(projection), [projection]);
  const countries = useMemo(() => topojson.feature(worldData, worldData.objects.countries).features, []);
  const borders   = useMemo(() => topojson.mesh(worldData, worldData.objects.countries, (a, b) => a !== b), []);
  const graticule = useMemo(() => d3.geoGraticule()(), []);
  const sphere    = useMemo(() => ({ type: 'Sphere' }), []);

  // Explicitly selected cities — shown as large coral pins
  const selectedPins = useMemo(() =>
    CITIES.filter(c => selectedCities.has(c.id)),
    [selectedCities]
  );

  // Era-curated featured cities — shown as subtle suggestion pins,
  // hidden once the user has selected them. Changes by region tab.
  const featuredPins = useMemo(() => {
    const regionList = selectedRegion !== 'all' ? FEATURED_CITIES_REGION[selectedRegion] : null;
    const ids = regionList
      ? (regionList[currentEra?.id] ?? [])
      : (FEATURED_CITIES[currentEra?.id] ?? []);
    return ids
      .map(id => CITIES.find(c => c.id === id))
      .filter(city => city && !selectedCities.has(city.id));
  }, [currentEra, selectedCities, selectedRegion]);

  return (
    <div className="map-container">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet" className="world-map-svg">
        <defs>
          <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#00000025" />
          </filter>
          <filter id="pin-shadow-lg" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00000035" />
          </filter>

          {/*
            Ocean wave texture — vintage cartographic style.
            patternUnits="userSpaceOnUse": tile is in SVG-coordinate space (960×500),
            so the wave size is stable regardless of element scaling.
            Width 28 = one full S-curve period; height 14 = row spacing.
            The cubic bezier M0,7 C4,4.5 10,4.5 14,7 C18,9.5 24,9.5 28,7 produces a
            smooth sine-like wave with amplitude ≈ 1.9 units, C1-continuous at tile edges.
          */}
          <pattern id="ocean-waves" x="0" y="0" width="28" height="14"
                   patternUnits="userSpaceOnUse">
            <path
              d="M0,7 C4,4.5 10,4.5 14,7 C18,9.5 24,9.5 28,7"
              fill="none"
              stroke="#8EC3D0"
              strokeWidth="0.55"
              strokeLinecap="round"
            />
          </pattern>
        </defs>

        {/* ── Base geography ── */}
        <path d={path(sphere)} fill="#D6E4E8" />
        {/* Wave texture overlay — clipped to the sphere outline by the path geometry */}
        <path d={path(sphere)} fill="url(#ocean-waves)" opacity={0.4} />
        <path d={path(graticule)} fill="none" stroke="#C4D8DC" strokeWidth={0.3} />
        {countries.map((c, i) => (
          <path key={i} d={path(c)} fill="#C9BB9F" stroke="#B5A88C" strokeWidth={0.4} />
        ))}
        <path d={path(borders)} fill="none" stroke="#A89570" strokeWidth={0.25} />

        {/* ── Featured pin labels — sit to the right of the dot ── */}
        {featuredPins.map(city => {
          const proj = projection(city.coordinates);
          if (!proj) return null;
          const [x, y] = proj;
          const isHovered = hoveredCity === city.id;
          return (
            <text
              key={`flbl-${city.id}`}
              x={x + FEATURED_R + 5}
              y={y}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize="8.5"
              fontFamily="'Playfair Display', serif"
              fontWeight="600"
              fill={isHovered ? '#1E140A' : '#3A2B1E'}
              stroke="#EDE8DF"
              strokeWidth={2.5}
              paintOrder="stroke"
              opacity={isHovered ? 1 : 0.85}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {city.name}
            </text>
          );
        })}

        {/* ── Featured pins ── */}
        {featuredPins.map(city => {
          const proj = projection(city.coordinates);
          if (!proj) return null;
          const [x, y] = proj;
          const isHovered = hoveredCity === city.id;
          return (
            <g
              key={`fp-${city.id}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onCityToggle(city.id)}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {isHovered && (
                <circle cx={x} cy={y} r={FEATURED_R + 7}
                  fill={FEATURED_FILL} opacity={0.15} />
              )}
              <circle
                cx={x} cy={y}
                r={isHovered ? FEATURED_R + 1.5 : FEATURED_R}
                fill={FEATURED_FILL}
                stroke={FEATURED_STROKE}
                strokeWidth={1.5}
                filter="url(#pin-shadow)"
              />
            </g>
          );
        })}

        {/* ── Selected pin labels (for non-hovered pins, behind their circles) ── */}
        {selectedPins.map(city => {
          const proj = projection(city.coordinates);
          if (!proj) return null;
          const [x, y] = proj;
          const eraData   = city.eras[currentEra?.id];
          const active    = eraData && eraData.population > 0;
          const isHovered = hoveredCity === city.id;
          if (isHovered) return null; // label rendered inside the g below
          const r = active ? popScale(eraData.population) : 5;
          return (
            <text
              key={`slbl-${city.id}`}
              x={x} y={y - r - 5}
              textAnchor="middle" fontSize="9"
              fontFamily="'Playfair Display', serif" fontWeight="600"
              fill={active ? '#E8614A' : '#9E8C7A'}
              stroke="#F5F0E8" strokeWidth={2.5} paintOrder="stroke"
              opacity={active ? 0.9 : 0.55}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {city.name}
            </text>
          );
        })}

        {/* ── Site: static labels for selected sites (rendered before diamonds so text sits behind) ── */}
        {SITES.map(site => {
          const proj = projection(site.coordinates);
          if (!proj) return null;
          const [x, y] = proj;
          const isSelected = selectedSites.has(site.id);
          const isHovered  = hoveredSite === site.id;
          if (!isSelected || isHovered) return null;
          return (
            <text
              key={`slbl-${site.id}`}
              x={x + 9} y={y}
              textAnchor="start" dominantBaseline="middle"
              fontSize="8.5" fontFamily="'Playfair Display', serif" fontWeight="600"
              fill={SITE_FILL} stroke="#EDE8DF" strokeWidth={2.5} paintOrder="stroke"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {site.name}
            </text>
          );
        })}

        {/* ── Site diamond pins (always visible, above featured pins) ── */}
        {SITES.map(site => {
          const proj = projection(site.coordinates);
          if (!proj) return null;
          const [x, y] = proj;
          const isSelected = selectedSites.has(site.id);
          const isHovered  = hoveredSite === site.id;
          const r = isSelected ? 7 : 5;
          return (
            <g
              key={`site-${site.id}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSiteToggle(site.id)}
              onMouseEnter={() => setHoveredSite(site.id)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              {/* Pulsing selection ring */}
              {isSelected && (
                <polygon
                  points={diamond(x, y, r + 6)}
                  fill="none" stroke={SITE_FILL} strokeWidth={2}
                  opacity={0.5} className="site-selection-ring"
                />
              )}
              {/* Hover glow */}
              {isHovered && (
                <polygon
                  points={diamond(x, y, r + 9)}
                  fill={SITE_FILL} opacity={0.12}
                />
              )}
              {/* Main diamond */}
              <polygon
                points={diamond(x, y, r)}
                fill={SITE_FILL}
                stroke="#fff" strokeWidth={isSelected ? 2 : 1.5}
                opacity={isHovered ? 1 : isSelected ? 0.95 : 0.82}
                filter="url(#pin-shadow)"
              />
              {/* Hover label */}
              {isHovered && (
                <text
                  x={x + r + 5} y={y}
                  textAnchor="start" dominantBaseline="middle"
                  fontSize="9" fontFamily="'Playfair Display', serif" fontWeight="700"
                  fill={SITE_FILL} stroke="#EDE8DF" strokeWidth={2.5} paintOrder="stroke"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {site.name}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Selected pins (always on top) ── */}
        {selectedPins.map(city => {
          const proj = projection(city.coordinates);
          if (!proj) return null;
          const [x, y] = proj;
          const eraData   = city.eras[currentEra?.id];
          const active    = eraData && eraData.population > 0;
          const r         = active ? popScale(eraData.population) : 7;
          const isHovered = hoveredCity === city.id;

          return (
            <g
              key={`sp-${city.id}`}
              style={{ cursor: 'pointer' }}
              onClick={() => onCityToggle(city.id)}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Pulsing selection ring */}
              <circle cx={x} cy={y} r={r + 7}
                fill="none" stroke="#E8614A" strokeWidth={2}
                opacity={0.5} className="selection-ring" />

              {isHovered && (
                <circle cx={x} cy={y} r={r + 11}
                  fill="#E8614A" opacity={0.1} />
              )}

              <circle
                cx={x} cy={y} r={r}
                fill={active ? '#E8614A' : '#C0A882'}
                stroke="#fff" strokeWidth={2}
                opacity={active ? 1 : 0.45}
                filter="url(#pin-shadow-lg)"
              />

              {/* Label only on hover (static labels rendered above) */}
              {isHovered && (
                <text
                  x={x} y={y - r - 5}
                  textAnchor="middle" fontSize="10.5"
                  fontFamily="'Playfair Display', serif" fontWeight="700"
                  fill={active ? '#E8614A' : '#9E8C7A'}
                  stroke="#F5F0E8" strokeWidth={3} paintOrder="stroke"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {city.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="map-legend">
        <span className="legend-dots">
          {featuredPins.length > 0 && (
            <span className="legend-item">
              <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#F5C842" stroke="#fff" strokeWidth="1"/></svg>
              Featured city
            </span>
          )}
          {selectedPins.length > 0 && (
            <span className="legend-item">
              <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#E8614A"/></svg>
              Selected city
            </span>
          )}
          <span className="legend-item">
            <svg width="10" height="10"><polygon points="5,0 10,5 5,10 0,5" fill="#D4A017"/></svg>
            Archaeological site
          </span>
          {selectedPins.some(c => {
            const e = c.eras[currentEra?.id]; return e && e.population === 0;
          }) && (
            <span className="legend-item" style={{ opacity: 0.6 }}>
              <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#C0A882" opacity="0.5"/></svg>
              Not yet founded
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
