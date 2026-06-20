"use client";

import React, { useState } from "react";
import { useWhoopStore } from "@/store/useStore";
import { Activity } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function StrainMeter() {
  const { t } = useWhoopStore();
  const [strain, setStrain] = useState(12.5);
  const shouldReduceMotion = useReducedMotion();

  // Map strain to WHOOP training categories
  const getStrainCategory = (score: number) => {
    if (score < 10) return { name: "Recovery / Active Rest", nameAr: "استشفاء / راحة نشطة", color: "text-whoop-green", stroke: "#00F19F", desc: "Allows cardiovascular recovery. Ideal for light activity.", descAr: "يسمح باستشفاء عضلة القلب. مثالي للنشاط الخفيف." };
    if (score < 14) return { name: "Optimal Training", nameAr: "تمرين مثالي", color: "text-yellow-400", stroke: "#FACC15", desc: "Builds cardiovascular fitness without excessive strain.", descAr: "يبني اللياقة القلبية والتنفسية دون إجهاد مفرط." };
    if (score < 18) return { name: "Overreaching", nameAr: "مجهود زائد", color: "text-orange-500", stroke: "#F97316", desc: "High cardiovascular load. Promotes fitness gains but requires extra sleep.", descAr: "حمولة قلبية عالية. يعزز مكاسب اللياقة ولكن يتطلب نوماً إضافياً." };
    return { name: "Peak / All-Out Strain", nameAr: "أقصى جهد بدني", color: "text-strain-red", stroke: "#FF3D3D", desc: "Extreme cardiovascular demand. Peak capacity reached.", descAr: "مجهود قلب عالي جداً. تم الوصول للحد الأقصى للقدرة الاستيعابية." };
  };

  const currentCategory = getStrainCategory(strain);

  // SVG circular properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (strain / 21) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-white/10 relative overflow-hidden group">
      {/* Background radial glow */}
      <div 
        className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full blur-[100px] transition-colors duration-500 pointer-events-none opacity-20"
        style={{ backgroundColor: currentCategory.stroke }}
      />

      {/* Circle Gauge Container */}
      <div className="relative w-40 h-40 flex items-center justify-center select-none flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1a1a1a"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Foreground strain indicator */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={currentCategory.stroke}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={shouldReduceMotion ? { duration: 0.1 } : { type: "spring", stiffness: 60, damping: 15 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute text-center flex flex-col items-center">
          <Activity className="w-5 h-5 mb-0.5 text-white/40" />
          <span className="text-4xl font-bold font-mono tracking-tighter">
            {strain.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
            STRAIN
          </span>
        </div>
      </div>

      {/* Control sliders & labels */}
      <div className="flex-1 w-full space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-display uppercase tracking-wider text-whoop-green flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-whoop-green animate-ping" />
            {t("strainMeterTitle")}
          </h4>
          <p className="text-xs text-white/60">
            {t("strainMeterDesc")}
          </p>
        </div>

        {/* Dynamic Category Badge */}
        <div className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg space-y-1">
          <div className={`font-mono text-sm font-bold ${currentCategory.color}`}>
            {useWhoopStore.getState().lang === "ar" ? currentCategory.nameAr : currentCategory.name}
          </div>
          <div className="text-[11px] text-white/50 leading-relaxed">
            {useWhoopStore.getState().lang === "ar" ? currentCategory.descAr : currentCategory.desc}
          </div>
        </div>

        {/* Range Input */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-white/40">
            <span>0.0 (REST)</span>
            <span>10.0</span>
            <span>15.0</span>
            <span>21.0 (MAX)</span>
          </div>
          <input
            type="range"
            min="0"
            max="21"
            step="0.1"
            value={strain}
            onChange={(e) => setStrain(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer custom-slider outline-none border border-white/5"
          />
        </div>
      </div>
    </div>
  );
}
