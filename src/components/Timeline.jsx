import { useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { ERA_RANGES, formatYear } from '../data/historicalData';

const TRACK_HEIGHT = 36;
const MIN_YEAR = -3000;
const MAX_YEAR = 2026;
const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

const ERA_COLORS = [
  '#C9BB9F',
  '#BDB09A',
  '#B1A594',
  '#C9BB9F',
  '#BDB09A',
  '#B1A594',
  '#C9BB9F',
];

export default function Timeline({ currentYear, onYearChange, currentEra }) {
  const xScale = useMemo(() =>
    d3.scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, 100]),
    []
  );

  const handleChange = useCallback((e) => {
    onYearChange(Number(e.target.value));
  }, [onYearChange]);

  const thumbPercent = ((currentYear - MIN_YEAR) / TOTAL_YEARS) * 100;

  return (
    <div className="timeline-wrapper">
      <div className="timeline-header">
        <div className="timeline-year-display">
          <span className="timeline-year-number">{formatYear(currentYear)}</span>
          <span className="timeline-era-badge">{currentEra?.label}</span>
        </div>
        <span className="timeline-hint">Drag to explore history</span>
      </div>

      {/* Era labels row — sits above the bar as plain HTML */}
      <div className="timeline-era-labels">
        {ERA_RANGES.map((era, i) => {
          const span = era.end - era.start;
          const isCurrent = currentEra?.id === era.id;
          return (
            <div
              key={era.id}
              className={`era-label-cell${isCurrent ? ' era-label-cell--active' : ''}`}
              style={{ flex: `${span} 0 0` }}
            >
              <span className="era-label-text">{era.label}</span>
              <span className="era-label-year">
                {era.start < 0 ? `${Math.abs(era.start)} BC` : `${era.start} AD`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bar row */}
      <div className="timeline-track-container">
        <svg
          className="timeline-svg"
          height={TRACK_HEIGHT}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none' }}
          preserveAspectRatio="none"
          viewBox={`0 0 100 ${TRACK_HEIGHT}`}
        >
          {ERA_RANGES.map((era, i) => {
            const x = xScale(era.start);
            const w = xScale(era.end) - xScale(era.start);
            const isCurrent = currentEra?.id === era.id;
            return (
              <g key={era.id}>
                <rect
                  x={x}
                  y={0}
                  width={w}
                  height={TRACK_HEIGHT}
                  fill={isCurrent ? '#E8614A' : ERA_COLORS[i % ERA_COLORS.length]}
                  opacity={isCurrent ? 0.18 : 0.35}
                  rx={i === 0 ? 6 : i === ERA_RANGES.length - 1 ? 6 : 0}
                  style={{ transition: 'opacity 0.3s, fill 0.3s' }}
                />
                {i > 0 && (
                  <line
                    x1={x} y1={0} x2={x} y2={TRACK_HEIGHT}
                    stroke="#A89570" strokeWidth={0.4} opacity={0.5}
                  />
                )}
              </g>
            );
          })}

          {/* Progress fill */}
          <rect
            x={0}
            y={0}
            width={thumbPercent}
            height={TRACK_HEIGHT}
            fill="#E8614A"
            opacity={0.12}
            rx={6}
            style={{ transition: 'width 0.05s' }}
          />

          {/* Current position line */}
          <line
            x1={thumbPercent}
            y1={0}
            x2={thumbPercent}
            y2={TRACK_HEIGHT}
            stroke="#E8614A"
            strokeWidth={0.8}
            opacity={0.9}
            style={{ transition: 'x1 0.05s, x2 0.05s' }}
          />
        </svg>

        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={1}
          value={currentYear}
          onChange={handleChange}
          className="timeline-range"
          style={{ height: TRACK_HEIGHT }}
          aria-label="Timeline year"
        />
      </div>
    </div>
  );
}
