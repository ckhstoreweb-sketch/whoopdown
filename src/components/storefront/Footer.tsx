"use client";

import React, { useState } from "react";
import { useWhoopStore } from "@/store/useStore";
import { Send, Phone, MessageSquare, ShieldCheck } from "lucide-react";

export default function Footer() {
  const { t, lang } = useWhoopStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="bg-neutral-950 border-t border-white/10 pt-16 pb-28 md:pb-12 px-6 md:px-12 select-none relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-strain-red/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Brand Block */}
        <div className="md:col-span-4 space-y-4 text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-whoop-green flex items-center justify-center font-display text-xl text-black font-extrabold shadow-neon-green">
              W
            </div>
            <span className="font-display text-2xl uppercase tracking-wider text-white">
              WHOOP <span className="text-whoop-green">DOWN</span>
            </span>
          </div>
          <p className="text-xs text-white/55 leading-relaxed max-w-sm">
            Egypt's premier, independent e-commerce store for sealed, brand-new WHOOP wearables. Connecting athletes in Cairo and Giza with clinical precision tracking.
          </p>
        </div>

        {/* Contact Block */}
        <div className="md:col-span-4 space-y-4 text-left">
          <h4 className="text-xs font-mono tracking-widest text-white/40 uppercase">
            Store & Support
          </h4>
          <div className="space-y-3 font-sans text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-whoop-green" />
              <span>+20 101 234 5678</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-whoop-green" />
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-whoop-green hover:underline transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-whoop-green" />
              <span>Physical Partner: Rich Phone, Serag Mall</span>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="md:col-span-4 space-y-4 text-left">
          <h4 className="text-xs font-mono tracking-widest text-white/40 uppercase">
            Stay Updated
          </h4>
          <p className="text-xs text-white/55">
            Receive restock announcements, new accessory color releases, and athletic performance insights.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl flex-1 outline-none text-white transition-all font-mono"
              required
            />
            <button
              type="submit"
              className="p-2.5 bg-whoop-green hover:bg-whoop-green/90 text-black rounded-xl transition-all shadow-neon-green focus:outline-none flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {subscribed && (
            <div className="text-[10px] font-mono text-whoop-green animate-pulse">
              ✓ Successfully subscribed!
            </div>
          )}
        </div>
      </div>

      {/* Heart rate line running horizontally across bottom border */}
      <div className="w-full h-8 relative mt-12 overflow-hidden flex items-center justify-center opacity-25">
        <svg
          className="w-full h-6"
          viewBox="0 0 1000 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,25 L350,25 L355,10 L360,40 L365,20 L370,30 L375,25 L1000,25"
            stroke="#00F19F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ekg-path"
            style={{ animationDuration: "5s" }}
          />
        </svg>
      </div>

      {/* Copyright line */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/40">
        <div>© 2026 WHOOP DOWN. All Rights Reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <span>Egypt (Bilingual RTL)</span>
        </div>
      </div>
    </footer>
  );
}
