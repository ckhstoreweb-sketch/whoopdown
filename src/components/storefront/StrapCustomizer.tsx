"use client";

import React, { useState } from "react";
import { useWhoopStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface Swatch {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  colorName: string;
  price: number;
  imageUrl: string;
}

export default function StrapCustomizer() {
  const { t, lang, addToCart } = useWhoopStore();

  const swatches: Swatch[] = [
    {
      id: "a1000000-0000-0000-0000-000000000004", // matching Onyx Black variant
      nameEn: "Onyx Black",
      nameAr: "أسود أونيكس",
      descEn: "The sleek, goes-with-everything classic",
      descAr: "اللون الأسود الأنيق الكلاسيكي المناسب لكل الأوقات",
      colorName: "Onyx Black",
      price: 1600,
      imageUrl: "/images/whoop-5-strap-1600.jpg",
    },
    {
      id: "a1000000-0000-0000-0000-000000000005", // matching Arctic White variant
      nameEn: "Arctic White",
      nameAr: "أبيض ثلجي",
      descEn: "Crisp, clean, and ultra-sporty",
      descAr: "اللون الأبيض الثلجي الرياضي الأنيق",
      colorName: "Arctic White",
      price: 1600,
      imageUrl: "/images/straps-5-1200/strap_2.jpg",
    },
    {
      id: "a1000000-0000-0000-0000-000000000006", // matching Ivy Green variant
      nameEn: "Ivy Green",
      nameAr: "أخضر زيتوني",
      descEn: "A premium dark military olive",
      descAr: "اللون الأخضر الزيتوني العسكري الفاخر",
      colorName: "Ivy Green",
      price: 1600,
      imageUrl: "/images/straps-5-1200/strap_3.jpg",
    },
    {
      id: "a1000000-0000-0000-0000-000000000007", // matching Heather Grey variant
      nameEn: "Heather Grey",
      nameAr: "رمادي مودرن",
      descEn: "Modern and subtle for everyday wear",
      descAr: "الرمادي العصري للمظهر اليومي المتميز",
      colorName: "Heather Grey",
      price: 1600,
      imageUrl: "/images/straps-5-1200/strap_4.jpg",
    },
  ];

  const [activeSwatch, setActiveSwatch] = useState<Swatch>(swatches[0]);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddStrap = () => {
    addToCart({
      id: "e1000000-0000-0000-0000-000000000004", // Strap product ID
      variantId: activeSwatch.id,
      nameEn: "WHOOP 5.0 Strap (Premium)",
      nameAr: "استيك ويب 5.0 (مميز)",
      variantNameEn: activeSwatch.nameEn,
      variantNameAr: activeSwatch.nameAr,
      price: activeSwatch.price,
      quantity: 1,
      imageUrl: activeSwatch.imageUrl,
      maxStock: 40,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-neutral-950/40 border-y border-white/5 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Dynamic Morphing Visual */}
        <div className="flex justify-center relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-whoop-green to-strain-red rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
          
          <div className="w-full max-w-sm relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSwatch.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative w-full h-48 flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl overflow-hidden border border-white/5 select-none">
                  <img
                    src={activeSwatch.imageUrl}
                    alt={activeSwatch.nameEn}
                    className="max-w-full max-h-full object-contain p-4"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Copy & Customization Controls */}
        <div className="space-y-6 text-left">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-white">
              {t("customizeRecovery")}
            </h2>
            <div className="w-20 h-1 bg-whoop-green rounded-full" />
            <p className="text-sm text-white/60 leading-relaxed max-w-md">
              {t("strapsDesc")}
            </p>
          </div>

          {/* Color swatch buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center max-w-md">
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block">
                {lang === "ar" ? "١. اختر لون الاستيك" : "1. Choose Knit Color"}
              </span>
              <span className="text-xs font-mono text-white/80">
                {lang === "ar" ? "اللون: " : "Color: "}
                <span className="text-whoop-green font-bold">
                  {lang === "ar" ? activeSwatch.nameAr : activeSwatch.nameEn}
                </span>
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {swatches.map((swatch) => {
                const isActive = activeSwatch.id === swatch.id;
                
                const getSwatchBg = (name: string) => {
                  if (name.includes("Black")) return "#1A1A1A";
                  if (name.includes("White")) return "#F3F4F6";
                  if (name.includes("Green")) return "#3F4E3F";
                  if (name.includes("Grey")) return "#8A9A9A";
                  return "#555555";
                };

                return (
                  <button
                    key={swatch.id}
                    onClick={() => setActiveSwatch(swatch)}
                    className={`w-10 h-10 rounded-full transition-all duration-300 relative focus:outline-none hover:scale-110 ${isActive ? "ring-2 ring-offset-4 ring-offset-neutral-950 ring-whoop-green scale-105 border-transparent" : "border border-white/20"}`}
                    style={{ backgroundColor: getSwatchBg(swatch.colorName) }}
                    title={lang === "ar" ? swatch.nameAr : swatch.nameEn}
                  >
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className={`w-2.5 h-2.5 rounded-full ${swatch.colorName.includes("White") ? "bg-black" : "bg-white"}`} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSwatch.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white/5 border border-white/5 rounded-xl p-4 max-w-md"
            >
              <div className="text-xs font-bold text-white/80">
                {lang === "ar" ? activeSwatch.descAr : activeSwatch.descEn}
              </div>
              <div className="text-lg font-bold font-mono text-whoop-green mt-2">
                {activeSwatch.price.toLocaleString()} EGP
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Button */}
          <button
            onClick={handleAddStrap}
            className={`w-full max-w-xs py-3.5 rounded-xl font-display font-bold tracking-widest text-sm uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${isAdded ? "bg-whoop-green text-black scale-95" : "bg-whoop-green text-black shadow-neon-green hover:bg-whoop-green/90"}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isAdded ? t("addedToCart") : t("shopBands")}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
