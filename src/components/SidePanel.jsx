import CityCard from './CityCard';
import SiteCard from './SiteCard';
import { CITIES, SITES } from '../data/historicalData';

export default function SidePanel({
  selectedCities, selectedSites,
  currentEra,
  onDeselect, onSiteDeselect,
}) {
  const selectedCityList = CITIES.filter(c => selectedCities.has(c.id));
  const selectedSiteList = SITES.filter(s => selectedSites.has(s.id));
  const totalCount       = selectedCityList.length + selectedSiteList.length;
  const isComparison     = totalCount > 1;
  const isEmpty          = totalCount === 0;

  return (
    <aside className={`side-panel${isComparison ? ' side-panel--comparison' : ''}`}>

      {isEmpty && (
        <div className="side-panel-empty-content">
          <div className="side-panel-empty-icon">⊕</div>
          <h3>Nothing selected</h3>
          <p>Search for <strong>cities</strong> or <strong>archaeological sites</strong> and add them to the map.</p>
          <p>Compare up to <strong>4 locations</strong> across history.</p>
        </div>
      )}

      {isComparison && (
        <div className="comparison-header">
          <h3 className="comparison-title">Comparing {totalCount} Locations</h3>
          <span className="comparison-era">{currentEra?.label} Era</span>
        </div>
      )}

      {!isEmpty && (
        <div className={`cards-container${isComparison ? ' cards-container--grid' : ''}`}>
          {selectedCityList.map(city => (
            <CityCard
              key={city.id}
              city={city}
              eraData={city.eras[currentEra?.id]}
              currentEra={currentEra}
              onDeselect={onDeselect}
              isCompact={isComparison}
            />
          ))}
          {selectedSiteList.map(site => (
            <SiteCard
              key={site.id}
              site={site}
              onDeselect={onSiteDeselect}
              isCompact={isComparison}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
