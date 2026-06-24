/**
 * Player store — the single source of truth for "what's playing": the current
 * track, the queue, and transport state. Actions command the shared <audio>
 * element; the element's events (wired up in AudioHost) feed state back in.
 * Components subscribe via selectors so a per-second position tick doesn't
 * re-render the whole app.
 */
import { create } from "zustand";

import type { Track } from "@/lib/api";

// The one shared <audio> for the whole app, kept outside React so actions can
// command it without triggering re-renders. Registered by <AudioHost> on mount.
let audioElement: HTMLAudioElement | null = null;

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;

  play: (track?: Track, queue?: Track[]) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;

  // Wiring called by <AudioHost> from the <audio> element's events.
  _setPosition: (seconds: number) => void;
  _setDuration: (seconds: number) => void;
  _setPlaying: (isPlaying: boolean) => void;
  _handleEnded: () => void;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 1,

  play: (track, queue) => {
    const el = audioElement;

    if (track) {
      const nextQueue = queue ?? [track];
      const index = nextQueue.findIndex((t) => t.id === track.id);
      set({
        currentTrack: track,
        queue: nextQueue,
        currentIndex: index === -1 ? 0 : index,
        position: 0,
        duration: 0,
        isPlaying: true,
      });
      if (el) {
        el.src = track.streamUrl;
        el.currentTime = 0;
        // play() can reject under the browser's autoplay policy.
        void el.play().catch(() => set({ isPlaying: false }));
      }
      return;
    }

    if (!get().currentTrack) return;
    set({ isPlaying: true });
    if (el) void el.play().catch(() => set({ isPlaying: false }));
  },

  pause: () => {
    set({ isPlaying: false });
    audioElement?.pause();
  },

  next: () => {
    const { queue, currentIndex } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      get().play(queue[nextIndex], queue);
      return;
    }
    set({ isPlaying: false });
    audioElement?.pause();
  },

  prev: () => {
    const { queue, currentIndex, position } = get();
    // Once a few seconds in, "previous" restarts the current track instead.
    if (position > 3 || currentIndex <= 0) {
      get().seek(0);
      return;
    }
    get().play(queue[currentIndex - 1], queue);
  },

  seek: (seconds) => {
    set({ position: seconds });
    if (audioElement) audioElement.currentTime = seconds;
  },

  setVolume: (volume) => {
    const clamped = Math.min(1, Math.max(0, volume));
    set({ volume: clamped });
    if (audioElement) audioElement.volume = clamped;
  },

  _setPosition: (seconds) => set({ position: seconds }),
  _setDuration: (seconds) => set({ duration: seconds }),
  _setPlaying: (isPlaying) => set({ isPlaying }),
  _handleEnded: () => get().next(),
}));

export function registerAudioElement(el: HTMLAudioElement | null): void {
  audioElement = el;
  if (el) el.volume = usePlayerStore.getState().volume;
}

// The visualizer (P1-7) must tap this exact element: the Web Audio API allows
// only one MediaElementSource per <audio>.
export function getAudioElement(): HTMLAudioElement | null {
  return audioElement;
}

// Selector hooks: subscribe to a single slice so a component re-renders only
// when that slice changes.
export const useCurrentTrack = () => usePlayerStore((s) => s.currentTrack);
export const useIsPlaying = () => usePlayerStore((s) => s.isPlaying);
export const usePosition = () => usePlayerStore((s) => s.position);
export const useDuration = () => usePlayerStore((s) => s.duration);
export const useVolume = () => usePlayerStore((s) => s.volume);
