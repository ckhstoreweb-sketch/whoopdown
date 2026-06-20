"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/storefront/Header";
import Hero from "@/components/storefront/Hero";
import TrustMarquee from "@/components/storefront/TrustMarquee";
import ProductsGrid from "@/components/storefront/ProductsGrid";
import CompareWHOOP from "@/components/storefront/CompareWHOOP";
import StrainMeter from "@/components/StrainMeter";
import RecoveryCalculator from "@/components/RecoveryCalculator";
import StoreLocator from "@/components/storefront/StoreLocator";
import PaymentLogistics from "@/components/storefront/PaymentLogistics";
import Testimonials from "@/components/storefront/Testimonials";
import FAQAccordion from "@/components/storefront/FAQAccordion";
import Footer from "@/components/storefront/Footer";
import MobileBottomNav from "@/components/storefront/MobileBottomNav";
import CartDrawer from "@/components/storefront/CartDrawer";
import { useWhoopStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { theme, lang } = useWhoopStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch when reading localStorage
  useEffect(() => {
    setMounted(true);
    // Initialize html lang & dir
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-whoop-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${theme === "midnight" ? "bg-darker-bg" : "bg-dark-bg"}`}>
      
      {/* 1. Header Navigation */}
      <Header onCartClick={() => setIsCartOpen(true)} />

      {/* 2. Hero Billboard */}
      <Hero />

      {/* 3. Infinite Trust Ticker */}
      <TrustMarquee />

      {/* 4. Choose Your WHOOP Grid */}
      <ProductsGrid />

      {/* 5. Model Comparison Sheet */}
      <CompareWHOOP />

      {/* 7. Interactive Engagement Widgets (Side-by-side) */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-white">
            {lang === "ar" ? "تفاعل مع بيانات الويب" : "INTERACTIVE EXPERIENCES"}
          </h2>
          <div className="w-16 h-1 bg-whoop-green mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <StrainMeter />
          <RecoveryCalculator />
        </div>
      </section>

      {/* 8. Visit Us Store Location */}
      <StoreLocator />

      {/* 9. Payment Channels & Strict Return policy */}
      <PaymentLogistics />

      {/* 10. Customer Testimonials */}
      <Testimonials />

      {/* 11. FAQ Accordion */}
      <FAQAccordion />

      {/* 12. Footer Information */}
      <Footer />

      {/* 13. Mobile Bottom navigation */}
      <MobileBottomNav onCartClick={() => setIsCartOpen(true)} />

      {/* 14. Slide-in Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
