"use client";

import React from "react";
import { useWhoopStore } from "@/store/useStore";
import { Home, ShoppingBag, MessageSquare, Shield, Store } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MobileBottomNavProps {
  onCartClick: () => void;
}

export default function MobileBottomNav({ onCartClick }: MobileBottomNavProps) {
  const { t, cart } = useWhoopStore();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleScrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-t border-white/10 px-4 py-3 flex items-center justify-around select-none">
      
      {/* 1. Home button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex flex-col items-center gap-1 text-[10px] font-mono text-white/60 hover:text-whoop-green transition-colors focus:outline-none"
      >
        <Home className="w-5 h-5" />
        <span>{t("home")}</span>
      </button>

      {/* 2. Shop button */}
      <button
        onClick={() => handleScrollToId("devices-section")}
        className="flex flex-col items-center gap-1 text-[10px] font-mono text-white/60 hover:text-whoop-green transition-colors focus:outline-none"
      >
        <Store className="w-5 h-5" />
        <span>{t("shop")}</span>
      </button>

      {/* 3. Cart button (with badge) */}
      <button
        onClick={onCartClick}
        className="relative flex flex-col items-center gap-1 text-[10px] font-mono text-white/60 hover:text-whoop-green transition-colors focus:outline-none"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={totalItems}
              className="absolute -top-1.5 -right-1.5 bg-whoop-green text-black font-mono text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-neon-green"
            >
              {totalItems}
            </motion.span>
          )}
        </div>
        <span>{t("cart")}</span>
      </button>

      {/* 4. WhatsApp link */}
      <a
        href="https://wa.me/201234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-[10px] font-mono text-white/60 hover:text-whoop-green transition-colors focus:outline-none"
      >
        <MessageSquare className="w-5 h-5 text-emerald-400" />
        <span>{t("whatsapp")}</span>
      </a>

      {/* 5. Admin link */}
      <Link
        href="/admin"
        className="flex flex-col items-center gap-1 text-[10px] font-mono text-white/60 hover:text-whoop-green transition-colors focus:outline-none"
      >
        <Shield className="w-5 h-5" />
        <span>Admin</span>
      </Link>
    </div>
  );
}
