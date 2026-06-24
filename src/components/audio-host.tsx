"use client";

import { useEffect, useRef } from "react";

import { registerAudioElement, usePlayerStore } from "@/store/player";

/**
 * Owns the single hidden <audio> element for the whole app (mounted once in the
 * root layout). It registers the element with the player store and forwards the
 * element's native events back into the store. Renders nothing visible — the
 * now-playing bar (P1-6) provides the controls.
 */
export default function AudioHost() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    registerAudioElement(el);

    // Store action identities are stable, so read them once.
    const { _setPosition, _setDuration, _setPlaying, _handleEnded } =
      usePlayerStore.getState();

    const onTimeUpdate = () => _setPosition(el.currentTime);
    const onDuration = () => {
      // Streams can briefly report Infinity/NaN before metadata settles.
      if (Number.isFinite(el.duration)) _setDuration(el.duration);
    };
    const onPlay = () => _setPlaying(true);
    const onPause = () => _setPlaying(false);
    const onEnded = () => _handleEnded();

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onDuration);
    el.addEventListener("durationchange", onDuration);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onDuration);
      el.removeEventListener("durationchange", onDuration);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      registerAudioElement(null);
    };
  }, []);

  return <audio ref={audioRef} hidden preload="metadata" />;
}
