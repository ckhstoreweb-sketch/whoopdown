"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserCheck, Star, Award, Shield } from "lucide-react";

export default function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("whoop_customers")
      .select("*")
      .order("total_spend", { ascending: false });
    
    if (data) setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleVIP = async (customer: any) => {
    const nextVIPState = !customer.is_vip;

    const { error } = await supabase
      .from("whoop_customers")
      .update({ is_vip: nextVIPState })
      .eq("id", customer.id);

    if (!error) {
      loadCustomers();
    } else {
      alert("VIP update failed.");
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-xs">
      
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h2 className="text-2xl font-display uppercase tracking-wider text-white">Client Directory</h2>
        <span className="text-[10px] font-mono text-white/45">Total Customers: {customers.length}</span>
      </div>

      {/* Customer registry table */}
      <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[600px] text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 bg-neutral-950/80 text-white/50 uppercase tracking-wider">
              <th className="p-3">Client Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Total Spend</th>
              <th className="p-3">Client Status</th>
              <th className="p-3 text-right">VIP Tagger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {customers.map((c) => {
              return (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-sans font-semibold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-whoop-green">
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="p-3 font-mono text-white/60">{c.phone}</td>
                  <td className="p-3 font-bold font-mono text-whoop-green">{c.total_spend.toLocaleString()} EGP</td>
                  <td className="p-3">
                    {c.is_vip ? (
                      <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[9px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 w-max">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <span>VIP ATHLETE</span>
                      </span>
                    ) : (
                      <span className="bg-white/5 text-white/40 text-[9px] px-2 py-0.5 rounded font-mono w-max block">
                        STANDARD
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleVIP(c)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase transition-all ${c.is_vip ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400" : "border-white/10 bg-transparent text-white/60 hover:text-white"}`}
                    >
                      {c.is_vip ? "Demote VIP" : "Promote VIP"}
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
