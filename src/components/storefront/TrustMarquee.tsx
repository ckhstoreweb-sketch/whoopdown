"use client";

import React from "react";
import { useWhoopStore } from "@/store/useStore";

export default function TrustMarquee() {
  const { t } = useWhoopStore();

  // Load from site settings mock (Zustand helper or default array)
  const trustMessages = [
    t("trust_1") || "✓ 100% Authentic",
    t("trust_2") || "✓ Sealed & Brand New",
    t("trust_3") || "✓ Fast Delivery in Cairo & Giza",
    t("trust_4") || "✓ InstaPay & Vodafone Cash Accepted",
    t("trust_5") || "✓ Available at Rich Phone, Serag Mall",
  ];

  // Repeat items for seamless infinite scroll
  const repeatedMessages = [...trustMessages, ...trustMessages, ...trustMessages, ...trustMessages];

  return (
    <div className="w-full bg-neutral-950 border-y border-white/5 py-3.5 overflow-hidden select-none">
      <div className="flex items-center whitespace-nowrap animate-marquee">
        {repeatedMessages.map((msg, i) => (
          <div key={i} className="flex items-center mx-6">
            <span className="text-xs md:text-sm font-mono tracking-widest text-whoop-green uppercase font-bold">
              {msg}
            </span>
            <span className="ml-12 text-white/20">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
