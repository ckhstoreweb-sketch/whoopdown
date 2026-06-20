"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, ToggleLeft, ToggleRight, Trash2, Calendar, Percent } from "lucide-react";

export default function PromosTab() {
  const [promos, setPromos] = useState<any[]>([]);
  
  // Create state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [expiry, setExpiry] = useState("2026-12-31T23:59");
  const [limit, setLimit] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);

  const loadPromos = async () => {
    const { data } = await supabase.from("whoop_discount_codes").select("*").order("created_at", { ascending: false });
    if (data) setPromos(data);
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    try {
      const { error } = await supabase
        .from("whoop_discount_codes")
        .insert({
          code: code.trim().toUpperCase(),
          type: type,
          value: value,
          min_order_value: minOrder,
          expiry_date: new Date(expiry).toISOString(),
          usage_limit: limit === "" ? null : limit,
          is_active: isActive
        });

      if (!error) {
        setShowAddForm(false);
        setCode("");
        setValue(0);
        setMinOrder(0);
        setLimit("");
        loadPromos();
      } else {
        alert("Failed to save discount code. Make sure code name is unique.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePromo = async (promo: any) => {
    const nextState = !promo.is_active;

    const { error } = await supabase
      .from("whoop_discount_codes")
      .update({ is_active: nextState })
      .eq("id", promo.id);

    if (!error) {
      loadPromos();
    } else {
      alert("Failed to toggle status.");
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    const { error } = await supabase.from("whoop_discount_codes").delete().eq("id", id);
    if (!error) {
      loadPromos();
    } else {
      alert("Failed to delete promo code.");
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h2 className="text-2xl font-display uppercase tracking-wider text-white">Promo Codes</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-neon-green flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Create Code"}</span>
        </button>
      </div>

      {/* Add code form block */}
      {showAddForm && (
        <form onSubmit={handleSavePromo} className="glass-panel rounded-2xl p-6 border border-white/10 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end max-w-4xl">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Code Name</label>
            <input
              type="text"
              placeholder="WHOOPFREE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Discount Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-neutral-900 border border-white/10 text-xs px-3 py-2 rounded-lg text-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (EGP)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Discount Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Min Order Value (EGP)</label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Expiry Date</label>
            <input
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-white/40 uppercase block">Usage Limit (Total)</label>
            <input
              type="number"
              placeholder="Unlimited"
              value={limit}
              onChange={(e) => setLimit(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="promoActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-whoop-green w-4 h-4"
            />
            <label htmlFor="promoActiveCheck" className="text-white/80 cursor-pointer">Active on creation</label>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-whoop-green text-black font-display font-bold uppercase rounded-lg shadow-neon-green"
          >
            Save Promo Code
          </button>
        </form>
      )}

      {/* Promos Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[700px] text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 bg-neutral-950/80 text-white/50 uppercase tracking-wider">
              <th className="p-3">Promo Code</th>
              <th className="p-3">Discount Value</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3">Usage Statistics</th>
              <th className="p-3">Active Status</th>
              <th className="p-3 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {promos.map((p) => {
              const isExpired = new Date(p.expiry_date) < new Date();

              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-white tracking-widest">{p.code}</td>
                  
                  <td className="p-3">
                    {p.type === "percentage" ? (
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-whoop-green" />
                        <span>{p.value}% Off</span>
                      </span>
                    ) : (
                      <span>{p.value.toLocaleString()} EGP Off</span>
                    )}
                  </td>

                  <td className="p-3">{p.min_order_value.toLocaleString()} EGP</td>
                  
                  <td className={`p-3 font-mono ${isExpired ? "text-strain-red" : "text-white/60"}`}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(p.expiry_date).toLocaleDateString()}</span>
                    </div>
                  </td>

                  <td className="p-3 text-white/60">
                    {p.usage_count} / {p.usage_limit || "∞"} used
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleTogglePromo(p)}
                      className={`text-sm focus:outline-none ${p.is_active && !isExpired ? "text-whoop-green" : "text-white/20"}`}
                    >
                      {p.is_active && !isExpired ? (
                        <div className="flex items-center gap-1"><ToggleRight className="w-6 h-6" /><span>ACTIVE</span></div>
                      ) : (
                        <div className="flex items-center gap-1"><ToggleLeft className="w-6 h-6" /><span>INACTIVE</span></div>
                      )}
                    </button>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      className="p-1.5 rounded bg-strain-red/10 hover:bg-strain-red text-strain-red hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
