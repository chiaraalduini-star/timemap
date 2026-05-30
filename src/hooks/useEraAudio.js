import { useRef, useState, useCallback, useEffect } from 'react';

const CROSSFADE_MS = 1500;

function eraToSrc(eraId) {
  return `/audio/${eraId.replace(/_/g, '-')}.mp3`;
}

// Animate audio.volume from its current value to `toVol` over `ms` milliseconds.
// Returns a cancel function.
function tweenVolume(audio, toVol, ms, onComplete) {
  const fromVol = audio.volume;
  const t0 = performance.now();
  let rafId;
  let alive = true;

  function tick(now) {
    if (!alive) return;
    const p = Math.min((now - t0) / ms, 1);
    // ease-out cubic
    const e = 1 - Math.pow(1 - p, 3);
    audio.volume = Math.max(0, Math.min(1, fromVol + (toVol - fromVol) * e));
    if (p < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      audio.volume = toVol;
      onComplete?.();
    }
  }

  rafId = requestAnimationFrame(tick);
  return () => { alive = false; cancelAnimationFrame(rafId); };
}

export function useEraAudio(eraId) {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolumeState] = useState(0.5);

  // All mutable playback state lives in a single ref to avoid stale closures
  const r = useRef({
    muted: true,
    vol: 0.5,
    eraId: eraId ?? 'classical',
    active: 0,          // which pool slot is the "live" track
    started: false,     // have we successfully started playback at least once
    cancels: [],        // active tween cancel fns
    pool: null,         // two Audio elements
  });

  // Lazily create the audio pool
  if (!r.current.pool) {
    r.current.pool = [new Audio(), new Audio()];
    r.current.pool.forEach(a => { a.loop = true; a.volume = 0; });
  }

  const getLive     = () => r.current.pool[r.current.active];
  const getIncoming = () => r.current.pool[1 - r.current.active];

  const stopFades = useCallback(() => {
    r.current.cancels.forEach(c => c?.());
    r.current.cancels = [];
  }, []);

  // Start or crossfade to a new era track
  const playEra = useCallback((newEraId) => {
    stopFades();

    const targetVol = r.current.vol;

    if (!r.current.started) {
      // First play — just load + fade in the live slot
      const a = getLive();
      a.src = eraToSrc(newEraId);
      a.volume = 0;
      a.currentTime = 0;
      a.play()
        .then(() => {
          r.current.started = true;
          r.current.cancels = [tweenVolume(a, targetVol, 900)];
        })
        .catch(() => { /* autoplay blocked — user must interact first */ });
      return;
    }

    // Crossfade: live fades out, incoming fades in
    const live     = getLive();
    const incoming = getIncoming();
    const nextIdx  = 1 - r.current.active;

    // Reset incoming slot
    incoming.pause();
    incoming.volume = 0;
    incoming.src = eraToSrc(newEraId);
    incoming.currentTime = 0;

    incoming.play()
      .then(() => {
        // Flip the active pointer before starting tweens
        r.current.active = nextIdx;

        const cOut = tweenVolume(live, 0, CROSSFADE_MS, () => {
          live.pause();
          live.currentTime = 0;
        });
        const cIn = tweenVolume(incoming, targetVol, CROSSFADE_MS);

        r.current.cancels = [cOut, cIn];
      })
      .catch(() => {});
  }, [stopFades]); // eslint-disable-line react-hooks/exhaustive-deps

  // React to era changes
  useEffect(() => {
    if (!eraId) return;
    r.current.eraId = eraId;
    if (!r.current.muted) playEra(eraId);
  }, [eraId, playEra]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFades();
      r.current.pool?.forEach(a => { a.pause(); a.src = ''; });
    };
  }, [stopFades]);

  // Called by the first map click or timeline drag. Starts playback once;
  // every subsequent call is a no-op so there's no double-trigger risk.
  const autoStart = useCallback(() => {
    if (r.current.started || !r.current.muted) return;
    r.current.muted = false;
    setIsMuted(false);
    playEra(r.current.eraId);
  }, [playEra]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = useCallback(() => {
    const nowMuted = !r.current.muted;
    r.current.muted = nowMuted;
    setIsMuted(nowMuted);
    stopFades();

    if (nowMuted) {
      const live = getLive();
      r.current.cancels = [
        tweenVolume(live, 0, 700, () => {
          live.pause();
          r.current.started = false;
        }),
      ];
    } else {
      playEra(r.current.eraId);
    }
  }, [stopFades, playEra]); // eslint-disable-line react-hooks/exhaustive-deps

  const setVolume = useCallback((v) => {
    r.current.vol = v;
    setVolumeState(v);
    if (!r.current.muted && r.current.started) {
      stopFades();
      r.current.cancels = [tweenVolume(getLive(), v, 150)]; // eslint-disable-line react-hooks/exhaustive-deps
    }
  }, [stopFades]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isMuted, volume, autoStart, toggleMute, setVolume };
}
