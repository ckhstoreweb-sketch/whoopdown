"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWhoopStore } from "@/store/useStore";
import { CreditCard, AlertTriangle, MapPin, Truck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function PaymentLogistics() {
  const { t, lang } = useWhoopStore();
  const shouldReduceMotion = useReducedMotion();
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    async function fetchZones() {
      const { data } = await supabase
        .from("whoop_site_settings")
        .select("*")
        .eq("key", "delivery_zones")
        .single();
      
      if (data && data.value?.zones) {
        setZones(data.value.zones);
      } else {
        // Fallback default zones
        setZones([
          { name_en: "Nasr City", name_ar: "مدينة نصر", fee: 250 },
          { name_en: "New Cairo / Tagamoa", name_ar: "التجمع / القاهرة الجديدة", fee: 250 },
          { name_en: "Heliopolis / Masr El Gedida", name_ar: "مصر الجديدة", fee: 250 }
        ]);
      }
    }
    fetchZones();
  }, []);

  return (
    <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto space-y-12 select-none">
      
      {/* Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Delivery Zones */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-display uppercase tracking-wider text-whoop-green flex items-center gap-2">
              <Truck className="w-5 h-5 text-whoop-green" />
              {t("fastLogistics")}
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              We deliver directly to your doorstep. All Cairo and Giza deliveries are handled within 24-48 hours.
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block">
                Active Delivery Zones:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {zones.map((zone, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-whoop-green" />
                      <span className="text-xs font-mono text-white/95">
                        {lang === "ar" ? zone.name_ar : zone.name_en}
                      </span>
                    </div>
                    <span className="bg-whoop-green/10 text-whoop-green border border-whoop-green/20 text-[10px] font-mono font-bold px-2.5 py-1 rounded">
                      {zone.fee} EGP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-white/40 leading-relaxed border-t border-white/5 pt-4 mt-6">
            💡 {t("pickupNotice")}
          </div>
        </div>

        {/* Accepted Payment Methods */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-display uppercase tracking-wider text-whoop-green flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-whoop-green" />
              {lang === "ar" ? "طرق الدفع المدعومة" : "Flexible Payments"}
            </h3>
            <p className="text-xs text-white/50 leading-relaxed">
              We support instant cash-free digital payments. Transfer via mobile apps and upload proof at checkout.
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block">
                Accepted Channels:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* InstaPay */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                  className="flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-xl p-4 cursor-pointer text-center relative group"
                >
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-lg font-display tracking-widest text-white group-hover:text-whoop-green transition-colors">
                    INSTAPAY
                  </span>
                  <span className="text-[9px] font-mono text-white/40 mt-1 uppercase">انستاباي</span>
                </motion.div>

                {/* Vodafone Cash */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                  className="flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-xl p-4 cursor-pointer text-center relative group"
                >
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-lg font-display tracking-widest text-white group-hover:text-strain-red transition-colors">
                    VODAFONE CASH
                  </span>
                  <span className="text-[9px] font-mono text-white/40 mt-1 uppercase">فودافون كاش</span>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-white/40 leading-relaxed border-t border-white/5 pt-4 mt-6">
            🔒 Secure peer-to-peer transfers are validated by our store operators prior to order shipping.
          </div>
        </div>
      </div>

      {/* Return Policy Notice Box - Marching Ants Warning Stripe */}
      <div className="ants-border rounded-xl p-[2px] shadow-neon-red relative">
        <div className="bg-[#0D0A0A] rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start relative z-10">
          <div className="p-3 bg-strain-red/10 border border-strain-red/20 rounded-xl flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-strain-red" />
          </div>

          <div className="space-y-3 text-left">
            <h4 className="text-lg font-display tracking-wide uppercase text-strain-red">
              {t("sealPolicyTitle")}
            </h4>
            <div className="space-y-4 font-sans text-xs text-white/80 leading-relaxed">
              <p className="font-semibold text-white/95">
                {t("sealPolicyEN")}
              </p>
              <div className="w-full h-px bg-white/5" />
              <p className="text-white/60 dir-rtl text-right">
                لضمان استلامك منتج جديد تماماً، جميع الأجهزة والملحقات تأتي متبرشمة. لو العلبة اتفتحت أو السيلد اتفك، مفيش ترجيع أو استبدال نهائياً.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
