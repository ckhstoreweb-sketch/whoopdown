"use client";

import React from "react";
import { useWhoopStore } from "@/store/useStore";
import { ShoppingBag, Moon, Languages, Shield, Store } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { lang, toggleLanguage, theme, toggleTheme, cart, t } = useWhoopStore();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between select-none">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-whoop-green flex items-center justify-center font-display text-xl text-black font-extrabold shadow-neon-green group-hover:scale-105 transition-transform">
          W
        </div>
        <span className="font-display text-2xl uppercase tracking-wider text-white">
          WHOOP <span className="text-whoop-green group-hover:glow-text">DOWN</span>
        </span>
      </Link>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Physical Store badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-[11px] font-mono text-white/50">
          <Store className="w-3.5 h-3.5 text-whoop-green" />
          <span>{t("storeLocation")}</span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/70 hover:text-whoop-green hover:bg-white/10 hover:border-whoop-green/20 transition-all focus:outline-none flex items-center gap-1.5 text-xs font-mono"
          title="Toggle Language"
        >
          <Languages className="w-4 h-4" />
          <span className="uppercase">{lang === "en" ? "العربية" : "English"}</span>
        </button>

        {/* Theme Toggler (Night vs Midnight) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/70 hover:text-whoop-green hover:bg-white/10 hover:border-whoop-green/20 transition-all focus:outline-none flex items-center gap-1.5 text-xs font-mono"
          title="Toggle Dark Intensity"
        >
          <Moon className={`w-4 h-4 ${theme === "midnight" ? "text-whoop-green fill-whoop-green" : "text-white/60"}`} />
          <span className="hidden md:inline uppercase text-[10px] tracking-wider font-bold">
            {theme === "night" ? "Night" : "Midnight"}
          </span>
        </button>

        {/* Admin Link */}
        <Link
          href="/admin"
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/70 hover:text-whoop-green hover:bg-white/10 hover:border-whoop-green/20 transition-all focus:outline-none flex items-center gap-1.5 text-xs font-mono"
          title="Admin Panel"
        >
          <Shield className="w-4 h-4" />
          <span className="hidden md:inline uppercase text-[10px] tracking-wider font-bold">
            {t("admin")}
          </span>
        </Link>

        {/* Shopping Cart Button */}
        <button
          onClick={onCartClick}
          className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 text-white hover:text-whoop-green hover:bg-white/10 hover:border-whoop-green/20 transition-all focus:outline-none"
        >
          <ShoppingBag className="w-5 h-5" />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                key={totalItems}
                className="absolute -top-1 -right-1 bg-whoop-green text-black font-mono text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-neon-green"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
