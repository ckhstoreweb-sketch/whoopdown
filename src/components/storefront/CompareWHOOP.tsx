"use client";

import React, { useState } from "react";
import { useWhoopStore } from "@/store/useStore";
import { Check, X, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonRow {
  featureEn: string;
  featureAr: string;
  w4: string;
  w5Peak: string;
  w5Life: string;
  isDiff: boolean; // marks if this row shows differences
}

export default function CompareWHOOP() {
  const { t, lang } = useWhoopStore();
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  const rows: ComparisonRow[] = [
    {
      featureEn: "Subscription Included",
      featureAr: "الاشتراك المرفق",
      w4: "1-Month Included",
      w5Peak: "1-Year Included",
      w5Life: "1-Year Included",
      isDiff: true,
    },
    {
      featureEn: "Battery Life",
      featureAr: "عمر البطارية",
      w4: "Up to 5 Days",
      w5Peak: "Up to 14 Days",
      w5Life: "Up to 14 Days",
      isDiff: true,
    },
    {
      featureEn: "Medical Screening (ECG)",
      featureAr: "فحص طبي رسم قلب (ECG)",
      w4: "No",
      w5Peak: "No",
      w5Life: "Yes (Medical Grade)",
      isDiff: true,
    },
    {
      featureEn: "AFib & Heart Rhythm Screener",
      featureAr: "كشف الرجفان واضطراب نبضات القلب",
      w4: "No",
      w5Peak: "No",
      w5Life: "Yes (Clinical-Level)",
      isDiff: true,
    },
    {
      featureEn: "Blood Pressure Insights",
      featureAr: "مؤشرات ضغط الدم",
      w4: "No",
      w5Peak: "No",
      w5Life: "Yes",
      isDiff: true,
    },
    {
      featureEn: "Size & Weight Profile",
      featureAr: "الوزن والحجم",
      w4: "Standard",
      w5Peak: "20% Smaller & Lighter",
      w5Life: "20% Smaller & Lighter",
      isDiff: true,
    },
    {
      featureEn: "Heart Rate Sensors",
      featureAr: "مستشعرات نبضات القلب",
      w4: "3-Diode Sensor",
      w5Peak: "Advanced 5-Diode",
      w5Life: "Clinical Grade 5-Diode",
      isDiff: true,
    },
    {
      featureEn: "Waterproof Charging Pack",
      featureAr: "شاحن لاسلكي مضاد للمياه",
      w4: "Yes (IP68)",
      w5Peak: "Yes (IP68 - Upgraded)",
      w5Life: "Yes (IP68 - Upgraded)",
      isDiff: false,
    },
    {
      featureEn: "Retail Price",
      featureAr: "السعر",
      w4: "10,000 EGP",
      w5Peak: "15,800 EGP",
      w5Life: "23,500 EGP",
      isDiff: true,
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto space-y-8 select-none">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2 text-left">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-white">
            {t("compareTitle")}
          </h2>
          <div className="w-16 h-1 bg-whoop-green rounded-full" />
        </div>

        {/* Highlight toggle */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-whoop-green" />
          <span className="text-xs font-mono text-white/60">
            {t("highlightDiffs")}
          </span>
          <button
            onClick={() => setHighlightDiffs(!highlightDiffs)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${highlightDiffs ? "bg-whoop-green" : "bg-neutral-850"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${highlightDiffs ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-neutral-950/80">
              <th className="p-4 text-xs font-mono text-white/50 uppercase tracking-widest sticky left-0 bg-neutral-950/90 z-10">
                Specs & Metrics
              </th>
              <th className="p-4 font-display text-lg tracking-wider text-white/90 text-center">
                WHOOP 4.0
              </th>
              <th className="p-4 font-display text-lg tracking-wider text-whoop-green text-center">
                WHOOP 5.0 PEAK
              </th>
              <th className="p-4 font-display text-lg tracking-wider text-yellow-400 text-center">
                WHOOP 5.0 LIFE (MG)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs text-white/80">
            {rows.map((row, index) => {
              const shouldHighlight = highlightDiffs && row.isDiff;
              if (highlightDiffs && !row.isDiff) return null;

              return (
                <tr 
                  key={index} 
                  className={`transition-colors duration-300 ${shouldHighlight ? "bg-whoop-green/5 text-whoop-green" : "hover:bg-white/5"}`}
                >
                  <td className="p-4 font-bold sticky left-0 bg-neutral-950/70 backdrop-blur-sm z-10 border-r border-white/5">
                    {lang === "ar" ? row.featureAr : row.featureEn}
                  </td>
                  <td className="p-4 text-center text-white/70">
                    {row.w4 === "No" ? <X className="w-4 h-4 text-strain-red mx-auto" /> : row.w4 === "Yes" ? <Check className="w-4 h-4 text-whoop-green mx-auto" /> : row.w4}
                  </td>
                  <td className="p-4 text-center">
                    {row.w5Peak === "No" ? <X className="w-4 h-4 text-strain-red mx-auto" /> : row.w5Peak === "Yes" ? <Check className="w-4 h-4 text-whoop-green mx-auto" /> : row.w5Peak}
                  </td>
                  <td className="p-4 text-center font-bold">
                    {row.w5Life === "No" ? <X className="w-4 h-4 text-strain-red mx-auto" /> : row.w5Life === "Yes" ? <Check className="w-4 h-4 text-whoop-green mx-auto" /> : row.w5Life}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
