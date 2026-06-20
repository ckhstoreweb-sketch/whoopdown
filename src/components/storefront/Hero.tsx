"use client";

import React from "react";
import { useWhoopStore } from "@/store/useStore";
import AudioEqualizer from "../AudioEqualizer";
import { ArrowDown, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function Hero() {
  const { t } = useWhoopStore();
  const shouldReduceMotion = useReducedMotion();

  // Staggered letters reveal settings
  const titleText = t("heroTitle");
  const letters = Array.from(titleText);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.2 * i },
    }),
  };

  const childVariants: any = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const handleShopScroll = () => {
    const section = document.getElementById("devices-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMapScroll = () => {
    const section = document.getElementById("location-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-[calc(100vh-73px)] w-full flex items-center justify-center overflow-hidden bg-black select-none">
      {/* Background loop video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-35"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-man-doing-exercises-with-kettlebell-in-gym-40285-large.mp4"
          type="video/mp4"
        />
        {/* Fallback image or color */}
      </video>

      {/* Dark overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/80 via-transparent to-dark-bg/80" />

      {/* Audio Synthesizer overlay */}
      <div className="absolute top-6 right-6 z-10">
        <AudioEqualizer />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 flex flex-col items-center">
        {/* Staggered Title Reveal */}
        {shouldReduceMotion ? (
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-tight text-white glow-text leading-none">
            {titleText}
          </h1>
        ) : (
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-tight text-white leading-none flex flex-wrap justify-center"
          >
            {letters.map((char, index) => (
              <motion.span
                key={index}
                variants={childVariants}
                className={char === " " ? "mx-2" : "inline-block"}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        )}

        {/* Self-drawing glowing underline */}
        <div className="w-64 h-4 relative -mt-2">
          <svg className="w-full h-full" viewBox="0 0 250 16" fill="none">
            <motion.path
              d="M5,10 C80,3 170,12 245,5"
              stroke="#00F19F"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="text-sm sm:text-lg md:text-xl text-white/80 max-w-2xl font-sans font-light leading-relaxed text-balance"
        >
          {t("heroSubtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-4"
        >
          {/* Primary CTA */}
          <button
            onClick={handleShopScroll}
            className="w-full sm:w-auto px-8 py-3.5 bg-whoop-green hover:bg-whoop-green/95 text-black font-display font-bold tracking-widest text-sm uppercase rounded-xl transition-all duration-300 shadow-neon-green hover:scale-105 active:scale-95"
          >
            {t("shopNow")}
          </button>

          {/* Secondary CTA */}
          <button
            onClick={handleMapScroll}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-whoop-green/35 text-white font-display tracking-widest text-sm uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <MapPin className="w-4 h-4 text-whoop-green" />
            <span>{t("visitStore")}</span>
          </button>
        </motion.div>
      </div>

      {/* Bouncing Scroll Down indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" onClick={handleShopScroll}>
        <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
          Scroll Down
        </span>
        <ArrowDown className="w-4 h-4 text-whoop-green animate-bounce" />
      </div>
    </section>
  );
}
