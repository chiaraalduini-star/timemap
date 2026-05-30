const IconNotes = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="9" y1="9" x2="21" y2="7" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconSpeaker = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const IconSpeakerMuted = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export default function MusicPlayer({ isMuted, volume, toggleMute, setVolume, currentEra }) {
  return (
    <div className="music-player">
      <div className="music-player-top">
        <span className="music-player-note" aria-hidden="true">
          <IconNotes />
        </span>
        <span className="music-player-label">
          {isMuted ? 'Music off' : (currentEra?.label ?? '—')}
        </span>
      </div>

      <div className="music-player-controls">
        <button
          className={`music-mute-btn${isMuted ? ' music-mute-btn--muted' : ''}`}
          onClick={toggleMute}
          aria-label={isMuted ? 'Enable music' : 'Mute music'}
          title={isMuted ? 'Enable era music' : 'Mute music'}
        >
          {isMuted ? <IconSpeakerMuted /> : <IconSpeaker />}
        </button>

        <input
          type="range"
          className="music-volume-slider"
          min={0}
          max={1}
          step={0.02}
          value={volume}
          disabled={isMuted}
          onChange={e => setVolume(Number(e.target.value))}
          aria-label="Music volume"
          title={`Volume: ${Math.round(volume * 100)}%`}
          style={{ '--vol': Math.round(volume * 100) }}
        />
      </div>

      {!isMuted && (
        <div className="music-playing-indicator" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}
