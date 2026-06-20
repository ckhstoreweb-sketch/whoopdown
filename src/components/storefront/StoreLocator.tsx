"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWhoopStore } from "@/store/useStore";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

export default function StoreLocator() {
  const { t, lang } = useWhoopStore();
  const [storeInfo, setStoreInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchStoreSettings() {
      const { data } = await supabase
        .from("whoop_site_settings")
        .select("*")
        .eq("key", "store_location")
        .single();
      
      if (data) {
        setStoreInfo(data.value);
      } else {
        // Fallback default
        setStoreInfo({
          name: "Rich Phone - Serag Mall",
          mall: "Serag Mall",
          floor: "Tower 1, Ground Floor",
          city: "Nasr City, Cairo, Egypt",
          hours_en: "Daily 12:00 PM - 11:00 PM",
          hours_ar: "يومياً من ١٢ ظهراً حتى ١١ مساءً",
          directions_url: "https://maps.app.goo.gl/yX3s5fV82cTsdmD17",
          lat: 30.0614,
          lng: 31.3418
        });
      }
    }
    fetchStoreSettings();
  }, []);

  if (!storeInfo) return null;

  return (
    <section id="location-section" className="py-20 px-6 md:px-12 bg-neutral-950/20 border-t border-white/5 select-none">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-white">
            {t("visitUs")}
          </h2>
          <div className="w-20 h-1 bg-whoop-green mx-auto rounded-full" />
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Info Card - Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between glass-panel rounded-2xl p-6 md:p-8 border border-white/10 relative overflow-hidden">
            {/* Background pulsing glow */}
            <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-whoop-green/10 blur-[60px]" />
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-display uppercase text-whoop-green">
                  {lang === "ar" ? "ريتش فون - السراج مول" : storeInfo.name}
                </h3>
                <p className="text-xs text-white/50 font-mono uppercase tracking-wider">
                  Physical Store Partner
                </p>
              </div>

              {/* Detail Blocks */}
              <div className="space-y-4 font-sans text-xs">
                {/* Location */}
                <div className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-whoop-green flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="font-bold text-white/90">Address</div>
                    <div className="text-white/60 leading-relaxed">
                      {storeInfo.floor}, {storeInfo.mall}, {storeInfo.city}
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-3 items-start">
                  <Clock className="w-5 h-5 text-whoop-green flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="font-bold text-white/90">Opening Hours</div>
                    <div className="text-white/60 leading-relaxed">
                      {lang === "ar" ? storeInfo.hours_ar : storeInfo.hours_en}
                    </div>
                  </div>
                </div>

                {/* Direct Contact */}
                <div className="flex gap-3 items-start">
                  <Phone className="w-5 h-5 text-whoop-green flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="font-bold text-white/90">Store Support</div>
                    <div className="text-white/60 leading-relaxed">+20 101 234 5678</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Directions button */}
            <div className="pt-8">
              <a
                href={storeInfo.directions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-whoop-green/30 text-white font-display text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Navigation className="w-4 h-4 text-whoop-green" />
                <span>{t("getDirections")}</span>
              </a>
            </div>
          </div>

          {/* Dark themed map container - Right Column */}
          <div className="lg:col-span-7 h-[350px] lg:h-auto rounded-2xl overflow-hidden border border-white/10 relative shadow-neon-glow">
            {/* Overlay to darken map styling */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none mix-blend-color-burn" />
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.649646030999!2d31.3418!3d30.0614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583e6012c41865%3A0xe54e3d36ea1f7b88!2sSerag%20Mall!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(100%) invert(90%) contrast(120%)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
