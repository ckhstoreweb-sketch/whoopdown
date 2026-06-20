"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Settings2 } from "lucide-react";

export default function SettingsTab() {
  const [instapay, setInstapay] = useState({ address: "", name: "" });
  const [vodafone, setVodafone] = useState({ number: "" });
  const [whatsapp, setWhatsapp] = useState({ phone: "", message: "" });
  const [storeLocation, setStoreLocation] = useState({
    name: "",
    floor: "",
    hours_en: "",
    hours_ar: "",
    directions_url: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadSettings = async () => {
    // Load InstaPay
    const { data: ip } = await supabase.from("whoop_site_settings").select("*").eq("key", "instapay_details").single();
    if (ip) setInstapay(ip.value);

    // Load Vodafone Cash
    const { data: vf } = await supabase.from("whoop_site_settings").select("*").eq("key", "vodafone_cash_details").single();
    if (vf) setVodafone(vf.value);

    // Load WhatsApp
    const { data: wa } = await supabase.from("whoop_site_settings").select("*").eq("key", "whatsapp_contacts").single();
    if (wa) setWhatsapp(wa.value);

    // Load Location
    const { data: loc } = await supabase.from("whoop_site_settings").select("*").eq("key", "store_location").single();
    if (loc) setStoreLocation(loc.value);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: any) => {
    setIsSaving(true);
    setSuccessMsg("");

    const { error } = await supabase
      .from("whoop_site_settings")
      .upsert({ key, value, updated_at: new Date() });

    setIsSaving(false);
    if (!error) {
      setSuccessMsg(`Setting '${key}' saved successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      loadSettings();
    } else {
      alert("Save failed.");
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs max-w-2xl relative">
      
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-whoop-green text-black px-4 py-2.5 rounded-xl font-mono text-xs font-bold shadow-neon-green">
          {successMsg}
        </div>
      )}

      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h2 className="text-2xl font-display uppercase tracking-wider text-white">Site Settings Customizer</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* InstaPay Details */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-mono tracking-widest text-whoop-green uppercase flex items-center gap-1.5">
            <Settings2 className="w-4 h-4" />
            <span>InstaPay Payment Details</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">InstaPay Address</label>
              <input
                type="text"
                value={instapay.address}
                onChange={(e) => setInstapay({ ...instapay, address: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Account Holder Name</label>
              <input
                type="text"
                value={instapay.name}
                onChange={(e) => setInstapay({ ...instapay, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
              />
            </div>
          </div>

          <button
            onClick={() => handleSaveSetting("instapay_details", instapay)}
            disabled={isSaving}
            className="px-4 py-2 bg-whoop-green text-black font-display font-bold uppercase rounded-lg shadow-neon-green"
          >
            Save InstaPay Details
          </button>
        </div>

        {/* Vodafone Cash Details */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-mono tracking-widest text-whoop-green uppercase flex items-center gap-1.5">
            <Settings2 className="w-4 h-4" />
            <span>Vodafone Cash Details</span>
          </h3>
          
          <div className="space-y-1 max-w-xs">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Vodafone Cash Number</label>
            <input
              type="text"
              value={vodafone.number}
              onChange={(e) => setVodafone({ number: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
            />
          </div>

          <button
            onClick={() => handleSaveSetting("vodafone_cash_details", vodafone)}
            disabled={isSaving}
            className="px-4 py-2 bg-whoop-green text-black font-display font-bold uppercase rounded-lg shadow-neon-green"
          >
            Save Vodafone Number
          </button>
        </div>

        {/* WhatsApp Contact Details */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-mono tracking-widest text-whoop-green uppercase flex items-center gap-1.5">
            <Settings2 className="w-4 h-4" />
            <span>WhatsApp Operator Contacts</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">WhatsApp Phone Number</label>
              <input
                type="text"
                value={whatsapp.phone}
                onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Default Message</label>
              <input
                type="text"
                value={whatsapp.message}
                onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
              />
            </div>
          </div>

          <button
            onClick={() => handleSaveSetting("whatsapp_contacts", whatsapp)}
            disabled={isSaving}
            className="px-4 py-2 bg-whoop-green text-black font-display font-bold uppercase rounded-lg shadow-neon-green"
          >
            Save WhatsApp Settings
          </button>
        </div>

        {/* Store Location Settings */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-mono tracking-widest text-whoop-green uppercase flex items-center gap-1.5">
            <Settings2 className="w-4 h-4" />
            <span>Store Coordinates & Location Info</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Store Name</label>
              <input
                type="text"
                value={storeLocation.name}
                onChange={(e) => setStoreLocation({ ...storeLocation, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Floor Info / Mall coordinates</label>
              <input
                type="text"
                value={storeLocation.floor}
                onChange={(e) => setStoreLocation({ ...storeLocation, floor: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Working Hours (EN)</label>
              <input
                type="text"
                value={storeLocation.hours_en}
                onChange={(e) => setStoreLocation({ ...storeLocation, hours_en: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Working Hours (AR)</label>
              <input
                type="text"
                value={storeLocation.hours_ar}
                onChange={(e) => setStoreLocation({ ...storeLocation, hours_ar: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white text-right"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Google Maps directions URL</label>
            <input
              type="text"
              value={storeLocation.directions_url}
              onChange={(e) => setStoreLocation({ ...storeLocation, directions_url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono"
            />
          </div>

          <button
            onClick={() => handleSaveSetting("store_location", storeLocation)}
            disabled={isSaving}
            className="px-4 py-2 bg-whoop-green text-black font-display font-bold uppercase rounded-lg shadow-neon-green"
          >
            Save Location Settings
          </button>
        </div>

      </div>

    </div>
  );
}
