"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useWhoopStore } from "@/store/useStore";
import { ShieldAlert, ArrowLeft, CheckCircle2, Clock, Truck, ShieldCheck, HeartPulse } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

function TrackOrderContent() {
  const { t, lang } = useWhoopStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId || !phone) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const { data, error: rpcErr } = await supabase.rpc("whoop_track_order", {
        order_uuid: orderId.trim(),
        phone: phone.trim()
      });

      if (rpcErr || !data || data.length === 0) {
        setError(lang === "ar" ? "تعذر العثور على الطلب. يرجى التحقق من الرقم والرمز." : "Order not found. Please verify the ID and phone number.");
      } else {
        setOrder(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if query params exist
  useEffect(() => {
    if (searchParams.get("id") && searchParams.get("phone")) {
      handleTrack();
    }
  }, [searchParams]);

  // Timeline definition
  const statuses = ["Pending", "Confirmed", "Rejected", "Delivered"];
  const statusLabels = {
    Pending: { en: "Order Placed", ar: "تم تسجيل الطلب", desc: "Awaiting operator validation", descAr: "في انتظار مراجعة التحويل" },
    Confirmed: { en: "Transfer Verified", ar: "تم تأكيد التحويل", desc: "Payment screenshot approved", descAr: "تمت مراجعة التحويل وتجهيز الطلب" },
    Rejected: { en: "Payment Failed", ar: "الطلب مرفوض", desc: "Screenshot invalid or rejected", descAr: "تعذر التحقق من لقطة شاشة التحويل" },
    Delivered: { en: "Order Delivered", ar: "تم التوصيل", desc: "Wearable is on your wrist!", descAr: "تم تسليم المنتج بنجاح!" }
  };

  const getStatusIndex = (currentStatus: string) => {
    if (currentStatus === "Rejected") return 1; // display as failed at step 2
    return statuses.indexOf(currentStatus);
  };

  const activeIndex = order ? getStatusIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6 md:p-12 max-w-3xl mx-auto space-y-8 select-none">
      
      {/* Back to Home Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-whoop-green transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <span className="font-display text-lg tracking-wider">
          WHOOP <span className="text-whoop-green">DOWN</span>
        </span>
      </div>

      {/* Tracker Form Card */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 space-y-4">
        <h3 className="text-xl md:text-2xl font-display uppercase tracking-wider text-whoop-green flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-whoop-green animate-pulse" />
          {lang === "ar" ? "تتبع حالة شحنتك" : "Live Order Tracker"}
        </h3>
        
        <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5 space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Order UUID</label>
            <input
              type="text"
              placeholder="88888888-8888-..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all font-mono"
              required
            />
          </div>

          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Recipient Phone</label>
            <input
              type="tel"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-3 w-full py-2.5 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-neon-green flex items-center justify-center gap-1.5"
          >
            {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Track Order"}
          </button>
        </form>

        {error && (
          <div className="text-[11px] font-mono text-strain-red bg-strain-red/5 border border-strain-red/10 p-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* TRACKING TIMELINE DISPLAY */}
      {order && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 space-y-8"
        >
          {/* Order Details Header */}
          <div className="flex justify-between items-start border-b border-white/5 pb-4 font-mono text-xs">
            <div>
              <span className="text-white/40 uppercase block">Tracking Reference</span>
              <span className="font-bold text-white selection:bg-white selection:text-black">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-white/40 uppercase block">Order Total</span>
              <span className="text-whoop-green font-bold">{order.total.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Timeline Animation */}
          <div className="relative pl-8 md:pl-0 md:grid md:grid-cols-3 gap-4 items-start select-none pt-4">
            
            {/* Background tracking line */}
            <div className="absolute left-3.5 md:left-auto md:top-4 md:right-1/6 md:w-2/3 h-full md:h-1 bg-white/5 z-0" />
            
            {/* Green progress line */}
            {activeIndex > 0 && (
              <div 
                className="absolute left-3.5 md:left-auto md:top-4 md:right-1/6 h-full md:h-1 bg-whoop-green z-0 origin-top md:origin-left transition-all duration-1000"
                style={{ 
                  height: typeof window !== "undefined" && window.innerWidth < 768 ? `${(activeIndex / 2) * 100}%` : "auto",
                  width: typeof window !== "undefined" && window.innerWidth >= 768 ? `${(activeIndex / 2) * 100}%` : "auto" 
                }}
              />
            )}

            {/* Step 1: Placed */}
            <div className="relative z-10 flex md:flex-col items-start md:items-center gap-4 md:gap-3 text-left md:text-center pb-8 md:pb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${activeIndex >= 0 ? "border-whoop-green bg-black text-whoop-green shadow-neon-green" : "border-white/10 bg-neutral-900 text-white/30"}`}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-display uppercase tracking-wider text-white">
                  {lang === "ar" ? statusLabels.Pending.ar : statusLabels.Pending.en}
                </h4>
                <p className="text-[10px] text-white/50 leading-tight">
                  {lang === "ar" ? statusLabels.Pending.descAr : statusLabels.Pending.desc}
                </p>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div className="relative z-10 flex md:flex-col items-start md:items-center gap-4 md:gap-3 text-left md:text-center pb-8 md:pb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${order.status === "Rejected" ? "border-strain-red bg-black text-strain-red" : activeIndex >= 1 ? "border-whoop-green bg-black text-whoop-green shadow-neon-green" : "border-white/10 bg-neutral-900 text-white/30"}`}>
                {order.status === "Rejected" ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-display uppercase tracking-wider text-white">
                  {order.status === "Rejected" 
                    ? (lang === "ar" ? statusLabels.Rejected.ar : statusLabels.Rejected.en) 
                    : (lang === "ar" ? statusLabels.Confirmed.ar : statusLabels.Confirmed.en)}
                </h4>
                <p className="text-[10px] text-white/50 leading-tight">
                  {order.status === "Rejected" 
                    ? (lang === "ar" ? statusLabels.Rejected.descAr : statusLabels.Rejected.desc) 
                    : (lang === "ar" ? statusLabels.Confirmed.descAr : statusLabels.Confirmed.desc)}
                </p>
              </div>
            </div>

            {/* Step 3: Delivered */}
            <div className="relative z-10 flex md:flex-col items-start md:items-center gap-4 md:gap-3 text-left md:text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${activeIndex >= 3 ? "border-whoop-green bg-black text-whoop-green shadow-neon-green" : "border-white/10 bg-neutral-900 text-white/30"}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-display uppercase tracking-wider text-white">
                  {lang === "ar" ? statusLabels.Delivered.ar : statusLabels.Delivered.en}
                </h4>
                <p className="text-[10px] text-white/50 leading-tight">
                  {lang === "ar" ? statusLabels.Delivered.descAr : statusLabels.Delivered.desc}
                </p>
              </div>
            </div>

          </div>

          {/* Admin Comments */}
          {order.admin_notes && (
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-1.5">
              <div className="text-[10px] font-mono text-white/40 uppercase">Operator Comments:</div>
              <p className="text-xs text-white/80 leading-relaxed font-sans">{order.admin_notes}</p>
            </div>
          )}

          {/* Order Meta details */}
          <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 font-sans text-xs">
            <div>
              <span className="text-white/40 block">Delivery Zone</span>
              <span className="text-white/80">{order.delivery_zone}</span>
            </div>
            <div>
              <span className="text-white/40 block">Payment Method</span>
              <span className="text-white/80">{order.payment_method}</span>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-whoop-green border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
