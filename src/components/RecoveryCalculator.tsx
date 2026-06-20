"use client";

import React, { useState } from "react";
import { useWhoopStore } from "@/store/useStore";
import { BatteryCharging, ShieldAlert } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function RecoveryCalculator() {
  const { t, lang } = useWhoopStore();
  const [sleep, setSleep] = useState(7.5);
  const [intensity, setIntensity] = useState(5);
  const [score, setScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Egyptian-specific feedback generator
  const getRecoveryFeedback = (recScore: number) => {
    if (recScore < 33) {
      return {
        category: "Red Zone (Adrenal Fatigue)",
        categoryAr: "منطقة الخطر الحمراء (إجهاد حاد)",
        color: "text-strain-red",
        stroke: "#FF3D3D",
        en: "Critical recovery! Skip the gym today. Go order a warm plate of Abou Tarek Kushari, drink some sugarcane juice, and rest.",
        ar: "استشفاء حرج جداً! بلاش تمرين النهاردة خالص. اطلب علبة كشري أبو طارق مع عصير قصب، ونام بدري.",
        ekgSpeed: "0.8s", // Rapid pulse
      };
    }
    if (recScore < 67) {
      return {
        category: "Yellow Zone (Optimal Strain)",
        categoryAr: "المنطقة الصفراء (جهد متوسط)",
        color: "text-yellow-400",
        stroke: "#FACC15",
        en: "Moderate recovery. Your body is ready for active work, but don't overdo it. Cairo traffic might feel slightly annoying today.",
        ar: "استشفاء متوسط. جسمك مستعد لجهد معتدل، بلاش تضغط على نفسك. زحمة التجمع وصلاح سالم ممكن تضايقك شوية النهاردة.",
        ekgSpeed: "1.5s", // Normal pulse
      };
    }
    return {
      category: "Green Zone (Peak Performance)",
      categoryAr: "منطقة الأمان الخضراء (جاهز للانطلاق)",
      color: "text-whoop-green",
      stroke: "#00F19F",
      en: "Peak recovery! You are fully charged. You can run down El-Rehab streets, face Cairo traffic, and smash your workout easily.",
      ar: "استشفاء مثالي! بطاريتك مشحونة بالكامل وجاهز تدمر التمرين، وحتى زحمة المحور الدائري مش هتعرف تضايقك النهاردة.",
      ekgSpeed: "2.5s", // Steady, relaxed pulse
    };
  };

  const handleCompute = () => {
    setIsCalculating(true);
    setScore(null);
    setTimeout(() => {
      // Semi-realistic formula: Sleep increases recovery, intensity decreases it
      const sleepMultiplier = Math.min(1.0, sleep / 9.0); // 9 hours is 100% sleep
      const intensityPenalty = (intensity - 1) * 0.08; // 1-10 scale penalty
      const rawScore = Math.floor((sleepMultiplier * 100 - intensityPenalty * 100) + Math.random() * 10);
      const finalScore = Math.max(5, Math.min(99, rawScore));
      setScore(finalScore);
      setIsCalculating(false);
    }, 1200);
  };

  const feedback = score !== null ? getRecoveryFeedback(score) : null;

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 relative overflow-hidden flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h4 className="text-lg font-display uppercase tracking-wider text-whoop-green flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-whoop-green" />
            {t("recoveryCalcTitle")}
          </h4>
          <p className="text-xs text-white/60">
            {t("recoveryCalcDesc")}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4 pt-2">
          {/* Sleep hours */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-white/70">
              <span>{t("sleepHours")}</span>
              <span className="text-whoop-green font-bold">{sleep} hrs</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={sleep}
              onChange={(e) => setSleep(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer custom-slider outline-none border border-white/5"
            />
          </div>

          {/* Workout intensity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-white/70">
              <span>{t("workoutIntensity")}</span>
              <span className="text-strain-red font-bold">{intensity} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer custom-slider outline-none border border-white/5"
            />
          </div>
        </div>
      </div>

      {/* Calculator Output Display */}
      <div className="mt-6 space-y-4">
        {/* Compute Button */}
        {score === null && !isCalculating && (
          <button
            onClick={handleCompute}
            className="w-full py-3 bg-whoop-green hover:bg-whoop-green/90 text-black font-display tracking-widest text-sm uppercase rounded-xl transition-all duration-300 font-bold shadow-neon-green hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("calcRecovery")}
          </button>
        )}

        {/* Loading Indicator */}
        {isCalculating && (
          <div className="w-full py-4 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-whoop-green border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
              Analyzing Sleep Cycle...
            </span>
          </div>
        )}

        {/* Results display */}
        {score !== null && feedback && !isCalculating && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  RECOVERY SCORE
                </div>
                <div className={`text-4xl font-extrabold font-mono tracking-tighter ${feedback.color}`}>
                  {score}%
                </div>
              </div>

              {/* Dynamic pulsing heart */}
              <div className="flex flex-col items-center">
                <svg
                  className="w-16 h-10"
                  viewBox="0 0 100 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0,25 L35,25 L40,10 L45,40 L50,20 L55,30 L60,25 L100,25"
                    stroke={feedback.stroke}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ekg-path"
                    style={{ animationDuration: feedback.ekgSpeed }}
                  />
                </svg>
                <span className={`text-[9px] font-mono mt-1 ${feedback.color}`}>
                  {lang === "ar" ? feedback.categoryAr : feedback.category}
                </span>
              </div>
            </div>

            {/* Bilingual Message Block */}
            <div className="text-xs text-white/80 leading-relaxed border-t border-white/5 pt-3">
              {lang === "ar" ? feedback.ar : feedback.en}
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setScore(null)}
              className="text-[10px] text-white/40 hover:text-white uppercase font-mono tracking-wider transition-colors duration-200 mt-2 block"
            >
              ← Recalculate
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
