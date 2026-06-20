"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWhoopStore } from "@/store/useStore";
import { Volume2, VolumeX } from "lucide-react";

export default function AudioEqualizer() {
  const { t } = useWhoopStore();
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const schedulerTimerRef = useRef<number | null>(null);
  const currentBeatRef = useRef(0);
  const nextNoteTimeRef = useRef(0.0);

  // Equalizer bar animations
  const [barHeights, setBarHeights] = useState([15, 10, 20, 8, 12, 18, 14, 10]);

  // Handle visualizer bar heights when playing
  useEffect(() => {
    let animFrame: number;
    const updateBars = (timestamp: number) => {
      if (!isMuted && isPlayingRef.current) {
        // Rhythmic bouncing based on a sine wave that pulses faster at 128 BPM (2.13 Hz)
        const tempoFactor = (timestamp * 0.01) % (Math.PI * 2);
        setBarHeights(
          barHeights.map((_, i) => {
            const phase = (i * Math.PI) / 4;
            const multiplier = Math.sin(tempoFactor * 1.5 + phase);
            return Math.max(10, Math.floor(25 + multiplier * 25));
          })
        );
      } else {
        // Muted / idle state
        setBarHeights(barHeights.map((h) => Math.max(4, h - 2)));
      }
      animFrame = requestAnimationFrame(updateBars);
    };
    animFrame = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animFrame);
  }, [isMuted]);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.0, ctx.currentTime);
    mainGain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = mainGain;
  };

  // Rhythmic synthesizer beat scheduler
  // 128 BPM: 4 beats per bar, 2.13 beats per second. 
  // Beat duration: ~468ms. 
  const playSynthesizedBeat = (time: number, beat: number) => {
    const ctx = audioCtxRef.current;
    const mainGain = gainNodeRef.current;
    if (!ctx || !mainGain) return;

    // 1. Synth Kick Drum (every beat: 0, 1, 2, 3)
    const oscKick = ctx.createOscillator();
    const gainKick = ctx.createGain();
    oscKick.connect(gainKick);
    gainKick.connect(mainGain);

    oscKick.frequency.setValueAtTime(150, time); // start high
    oscKick.frequency.exponentialRampToValueAtTime(45, time + 0.15); // sweep down

    gainKick.gain.setValueAtTime(0.35, time);
    gainKick.gain.exponentialRampToValueAtTime(0.001, time + 0.15); // quick decay

    oscKick.start(time);
    oscKick.stop(time + 0.3);

    // 2. Sub Bass Pulse (beats 0.5, 1.5, 2.5, 3.5 - offbeat syncopation)
    if (beat % 2 === 1) {
      const oscBass = ctx.createOscillator();
      const gainBass = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscBass.connect(filter);
      filter.connect(gainBass);
      gainBass.connect(mainGain);

      oscBass.type = "triangle";
      oscBass.frequency.setValueAtTime(beat === 1 ? 55 : 48.99, time); // A1 or G1

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(80, time);
      filter.frequency.exponentialRampToValueAtTime(40, time + 0.2);

      gainBass.gain.setValueAtTime(0.0, time);
      gainBass.gain.linearRampToValueAtTime(0.15, time + 0.05);
      gainBass.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

      oscBass.start(time);
      oscBass.stop(time + 0.4);
    }

    // 3. Hi-Hat click (on half beats)
    const oscHat = ctx.createOscillator();
    const gainHat = ctx.createGain();
    const hatFilter = ctx.createBiquadFilter();

    oscHat.connect(hatFilter);
    hatFilter.connect(gainHat);
    gainHat.connect(mainGain);

    oscHat.type = "triangle";
    oscHat.frequency.setValueAtTime(10000, time);

    hatFilter.type = "bandpass";
    hatFilter.frequency.setValueAtTime(8000, time);

    gainHat.gain.setValueAtTime(0.0, time);
    gainHat.gain.linearRampToValueAtTime(0.03, time + 0.01);
    gainHat.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    oscHat.start(time);
    oscHat.stop(time + 0.1);
  };

  const startLoop = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Fade in main track volume
    gainNodeRef.current?.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);

    isPlayingRef.current = true;
    nextNoteTimeRef.current = ctx.currentTime;
    currentBeatRef.current = 0;

    const scheduleAheadTime = 0.1; // schedule 100ms in advance
    const beatDuration = 60.0 / 128.0; // 468.75ms

    const scheduler = () => {
      while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
        playSynthesizedBeat(nextNoteTimeRef.current, currentBeatRef.current);
        nextNoteTimeRef.current += beatDuration;
        currentBeatRef.current = (currentBeatRef.current + 1) % 4;
      }
      schedulerTimerRef.current = window.setTimeout(scheduler, 25);
    };

    scheduler();
  };

  const stopLoop = () => {
    isPlayingRef.current = false;
    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
    }
    // Fade out main track volume
    const ctx = audioCtxRef.current;
    if (ctx && gainNodeRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.5);
    }
  };

  const togglePlay = () => {
    initAudio();
    if (isMuted) {
      setIsMuted(false);
      startLoop();
    } else {
      setIsMuted(true);
      stopLoop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (schedulerTimerRef.current) {
        clearTimeout(schedulerTimerRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-neon-glow select-none">
      {/* Visualizer bars */}
      <div className="flex items-end gap-0.5 h-6 w-16">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="w-1 bg-whoop-green rounded-t-sm transition-all duration-75"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <button
        onClick={togglePlay}
        className="flex items-center gap-1.5 text-xs uppercase font-mono tracking-wider text-whoop-green hover:text-white transition-colors duration-200 focus:outline-none"
      >
        {isMuted ? (
          <>
            <VolumeX className="w-4 h-4 animate-pulse text-strain-red" />
            <span>{t("unmute")}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-whoop-green animate-bounce" />
            <span>{t("mute")}</span>
          </>
        )}
      </button>
    </div>
  );
}
