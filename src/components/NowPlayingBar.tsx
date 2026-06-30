"use client";

/**
 * Persistent now-playing bar: artwork/title/artist on the left, transport
 * controls + seekbar in the middle, volume on the right.
 *
 * Each section subscribes to its own narrow store slice, so the per-second
 * `position` tick re-renders only <SeekBar /> — the buttons, track info, and
 * volume control stay put (see P1-6 "watch out").
 */

import { useRef, useState } from "react";
import {
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  useCurrentTrack,
  useDuration,
  useIsPlaying,
  usePlayerStore,
  usePosition,
  useVolume,
} from "@/store/player";

function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function TrackInfo() {
  const track = useCurrentTrack();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {track?.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Jamendo art; static export runs with images.unoptimized
          <img
            src={track.artworkUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <Music className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {track?.title ?? "Nothing playing"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {track?.artist ?? "—"}
        </p>
      </div>
    </div>
  );
}

function TransportControls() {
  const isPlaying = useIsPlaying();
  const hasTrack = usePlayerStore((s) => s.currentTrack !== null);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={prev}
        disabled={!hasTrack}
        aria-label="Previous track"
      >
        <SkipBack />
      </Button>
      <Button
        variant="default"
        size="icon"
        onClick={() => (isPlaying ? pause() : play())}
        disabled={!hasTrack}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={next}
        disabled={!hasTrack}
        aria-label="Next track"
      >
        <SkipForward />
      </Button>
    </div>
  );
}

function SeekBar() {
  const position = usePosition();
  const duration = useDuration();
  const seek = usePlayerStore((s) => s.seek);

  // While dragging, show the dragged value instead of the live tick; commit the
  // seek (and hand control back to the store) only on release.
  const [dragValue, setDragValue] = useState<number | null>(null);
  const seekable = duration > 0;
  const value = dragValue ?? position;

  return (
    <div className="flex w-full items-center gap-2">
      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
        {formatTime(value)}
      </span>
      <Slider
        aria-label="Seek"
        min={0}
        max={seekable ? duration : 1}
        step={1}
        value={Math.min(value, seekable ? duration : 1)}
        disabled={!seekable}
        onValueChange={(v) => setDragValue(v as number)}
        onValueCommitted={(v) => {
          seek(v as number);
          setDragValue(null);
        }}
      />
      <span className="w-10 text-xs tabular-nums text-muted-foreground">
        {formatTime(duration)}
      </span>
    </div>
  );
}

function VolumeControl() {
  const volume = useVolume();
  const setVolume = usePlayerStore((s) => s.setVolume);
  // Remember the level before muting so the toggle can restore it.
  const lastNonZero = useRef(1);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(lastNonZero.current || 1);
    } else {
      lastNonZero.current = volume;
      setVolume(0);
    }
  };

  return (
    <div className="flex w-32 items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        aria-label={volume === 0 ? "Unmute" : "Mute"}
      >
        <VolumeIcon />
      </Button>
      <Slider
        aria-label="Volume"
        min={0}
        max={100}
        step={1}
        value={Math.round(volume * 100)}
        onValueChange={(v) => setVolume((v as number) / 100)}
      />
    </div>
  );
}

export default function NowPlayingBar() {
  return (
    <footer className="sticky bottom-0 z-50 border-t bg-background">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-3">
        <TrackInfo />
        <div className="flex flex-col items-center gap-2">
          <TransportControls />
          <div className="hidden w-full max-w-md md:block">
            <SeekBar />
          </div>
        </div>
        <div className="hidden justify-end md:flex">
          <VolumeControl />
        </div>
      </div>
    </footer>
  );
}
