const DiamondIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <polygon points="5,0 10,5 5,10 0,5" fill="#D4A017" />
  </svg>
);

export default function SiteCard({ site, onDeselect, isCompact }) {
  return (
    <div className={`site-card${isCompact ? ' site-card--compact' : ''}`}>
      <div className="city-card-header">
        <div>
          <div className="site-card-badge">
            <DiamondIcon />
            Archaeological Site
          </div>
          <h2 className="site-card-name">{site.name}</h2>
          <p className="site-card-period">{site.period}</p>
        </div>
        <button
          type="button"
          className="city-card-close"
          onClick={() => onDeselect(site.id)}
          aria-label={`Deselect ${site.name}`}
        >
          ×
        </button>
      </div>

      {!isCompact && (
        <div className="site-card-description">
          "{site.description}"
        </div>
      )}

      <div className="city-card-section">
        <label className="city-card-label">Civilization</label>
        <span className="city-card-value">{site.civilization}</span>
      </div>

      <div className="city-card-section">
        <label className="city-card-label">Status</label>
        <span className="city-card-value city-card-status">{site.status}</span>
      </div>

      <div className="city-card-section">
        <label className="city-card-label">Key Facts</label>
        <ul className="city-card-events">
          {(isCompact ? site.keyFacts.slice(0, 3) : site.keyFacts).map((fact, i) => (
            <li key={i}>{fact}</li>
          ))}
          {isCompact && site.keyFacts.length > 3 && (
            <li className="events-more">+{site.keyFacts.length - 3} more…</li>
          )}
        </ul>
      </div>
    </div>
  );
}
