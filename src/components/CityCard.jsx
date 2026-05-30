import { formatYear } from '../data/historicalData';

function PopulationBar({ population, maxPop = 1200000 }) {
  const pct = Math.min((population / maxPop) * 100, 100);
  const label = population === 0
    ? 'Not settled'
    : population >= 1000000
    ? `${(population / 1000000).toFixed(1)}M`
    : `${(population / 1000).toFixed(0)}K`;

  return (
    <div className="pop-bar-wrapper">
      <div className="pop-bar-track">
        <div
          className="pop-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="pop-bar-label">{label}</span>
    </div>
  );
}

export default function CityCard({ city, eraData, currentEra, onDeselect, isCompact }) {
  if (!eraData) return null;

  return (
    <div className={`city-card ${isCompact ? 'city-card--compact' : ''}`}>
      <div className="city-card-header">
        <div>
          <h2 className="city-card-name">{city.name}</h2>
          <p className="city-card-era">{currentEra?.label} Era</p>
        </div>
        <button
          className="city-card-close"
          onClick={() => onDeselect(city.id)}
          aria-label={`Deselect ${city.name}`}
        >
          ×
        </button>
      </div>

      <div className="city-card-highlight">
        "{eraData.highlight}"
      </div>

      <div className="city-card-section">
        <label className="city-card-label">Civilization</label>
        <span className="city-card-value">{eraData.civilization}</span>
      </div>

      <div className="city-card-section">
        <label className="city-card-label">Status</label>
        <span className="city-card-value city-card-status">{eraData.status}</span>
      </div>

      <div className="city-card-section">
        <label className="city-card-label">Population</label>
        <PopulationBar population={eraData.population} />
      </div>

      {!isCompact && (
        <div className="city-card-section">
          <label className="city-card-label">Key Events</label>
          <ul className="city-card-events">
            {eraData.events.map((evt, i) => (
              <li key={i}>{evt}</li>
            ))}
          </ul>
        </div>
      )}

      {isCompact && (
        <div className="city-card-section">
          <label className="city-card-label">Key Events</label>
          <ul className="city-card-events">
            {eraData.events.slice(0, 3).map((evt, i) => (
              <li key={i}>{evt}</li>
            ))}
            {eraData.events.length > 3 && (
              <li className="events-more">+{eraData.events.length - 3} more…</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
