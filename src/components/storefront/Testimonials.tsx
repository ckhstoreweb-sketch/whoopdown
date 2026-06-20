"use client";

import React, { useState, useEffect } from "react";
import { useWhoopStore } from "@/store/useStore";
import { Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Testimonial {
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  stars: number;
  textEn: string;
  textAr: string;
}

export default function Testimonials() {
  const { lang } = useWhoopStore();
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const list: Testimonial[] = [
    {
      name: "Captain Sherif",
      nameAr: "كابتن شريف",
      role: "Elite Marathon Runner, Heliopolis",
      roleAr: "عداء ماراثون، مصر الجديدة",
      stars: 5,
      textEn: "Tracking my sleep and strain with WHOOP 5.0 completely changed my marathon recovery strategy. Authentic sealed device and fast local shipping!",
      textAr: "تتبع نومي وجهدي باستخدام ويب 5.0 غير تمامًا من استراتيجية الاستشفاء للماراثون. المنتج أصلي ومتبرشم وتوصيل محلي سريع جداً!",
    },
    {
      name: "Farida Mohsen",
      nameAr: "فريدة محسن",
      role: "CrossFit Coach, New Cairo",
      roleAr: "مدربة كروس فت، القاهرة الجديدة",
      stars: 5,
      textEn: "Ordered the WHOOP 5.0 Medical Grade edition. Delivery was made to Tagamoa in under 4 hours. Super authentic and highly supportive WhatsApp operator.",
      textAr: "طلبت نسخة ويب 5.0 الطبية. التوصيل للتجمع أخد أقل من 4 ساعات. منتج أصلي ومبرشم ومساعدة سريعة جداً عبر الواتساب.",
    },
    {
      name: "Omar K.",
      nameAr: "عمر خليل",
      role: "Fitness Enthusiast, Nasr City",
      roleAr: "محب للياقة البدنية، مدينة نصر",
      stars: 5,
      textEn: "The classic WHOOP 4.0 was my entry point. Best wearable for stats. Very reliable shop at Serag Mall, verified in person.",
      textAr: "جهاز ويب 4.0 الكلاسيكي كان مدخلي للتتبع الحقيقي. أفضل جهاز قابل للارتداء للبيانات الحيوية. محل موثوق جداً في سراج مول وتأكدت بنفسي.",
    },
  ];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % list.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, []);

  const active = list[activeIndex];

  return (
    <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto space-y-12 select-none">
      
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-white">
          {lang === "ar" ? "آراء الرياضيين في مصر" : "WHOOP LIFESTYLE"}
        </h2>
        <div className="w-16 h-1 bg-whoop-green mx-auto rounded-full" />
      </div>

      {/* Testimonial slider */}
      <div className="relative glass-panel rounded-2xl p-6 md:p-10 border border-white/10 overflow-hidden flex flex-col items-center text-center max-w-3xl mx-auto">
        <div className="absolute top-4 right-4 text-[64px] font-serif text-white/5 select-none leading-none">“</div>
        
        {/* Star icons - sequentially drawing */}
        <div className="flex gap-1 mb-4">
          {[...Array(active.stars)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={shouldReduceMotion ? { duration: 0.1 } : { delay: i * 0.1, type: "spring", stiffness: 200 }}
            >
              <Star className="w-5 h-5 text-whoop-green fill-whoop-green" />
            </motion.div>
          ))}
        </div>

        {/* Dynamic content */}
        <div className="h-32 sm:h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-sm sm:text-base text-white/80 italic leading-relaxed"
            >
              {lang === "ar" ? active.textAr : active.textEn}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* User signature */}
        <div className="mt-6">
          <div className="font-display tracking-widest text-lg text-white">
            {lang === "ar" ? active.nameAr : active.name}
          </div>
          <div className="text-[10px] font-mono text-white/40 uppercase mt-0.5">
            {lang === "ar" ? active.roleAr : active.role}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-8">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/55 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/55 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of customer wrists wearing WHOOP (Actual product photographs) */}
      <div className="space-y-4">
        <span className="text-[10px] font-mono tracking-widest text-white/35 uppercase text-center block">
          Instagram Lifestyle Grid
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tag: "#StrainScore", imageUrl: "/images/whoop-life.jpg" },
            { tag: "#SleepPerformance", imageUrl: "/images/straps-5-1200/strap_2.jpg" },
            { tag: "#PeakRecovery", imageUrl: "/images/straps-5-1200/strap_3.jpg" },
            { tag: "#MedicalGrade", imageUrl: "/images/straps-5-1200/strap_4.jpg" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-square bg-neutral-900 border border-white/5 rounded-xl overflow-hidden group cursor-pointer flex items-center justify-center"
            >
              {/* Actual image of the strap/wearable */}
              <img
                src={item.imageUrl}
                alt={item.tag}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Hover overlay with heart/likes animation */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 duration-300 select-none">
                <Heart className="w-6 h-6 text-strain-red animate-pulse fill-strain-red" />
                <span className="text-[10px] font-mono text-white/85">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
