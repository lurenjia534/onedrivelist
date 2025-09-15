"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset when a source changes
  useEffect(() => {
    setReady(false);
    setPlaying(false);
    setProgress(0);
    setDuration(0);
  }, [src]);

  // Bind audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setReady(true);
    };
    const onTime = () => setProgress(audio.currentTime || 0);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  // Sync mute state to element
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.muted = muted;
  }, [muted]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setProgress(value);
  };

  const fmt = (t: number) => {
    if (!isFinite(t)) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const pct = duration ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 p-4 backdrop-blur">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          className="grid place-items-center w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
          aria-label={playing ? "暂停" : "播放"}
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
        </button>

        <div className="flex-1">
          <div className="relative h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-black/60 dark:bg-white/70"
              style={{ width: `${pct}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress}
              onChange={onSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="进度"
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-black/60 dark:text-white/60 font-mono">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="grid place-items-center w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-black/70 dark:text-white/70"
          aria-label={muted ? "取消静音" : "静音"}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}
