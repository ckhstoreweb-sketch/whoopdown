"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Minus, AlertTriangle, ListFilter, ClipboardList } from "lucide-react";

export default function InventoryTab() {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [restockLeads, setRestockLeads] = useState<any[]>([]);
  
  // Quick restock states
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState(0);

  const loadInventory = async () => {
    // 1. Fetch products
    const { data: prods } = await supabase.from("whoop_products").select("*").order("name_en", { ascending: true });
    
    // 2. Fetch variants
    const { data: variants } = await supabase.from("whoop_product_variants").select("*");

    if (prods) {
      // Flatten products & variants for simple row view
      const items: any[] = [];
      prods.forEach((p) => {
        const prodVariants = variants ? variants.filter((v) => v.product_id === p.id) : [];
        
        if (prodVariants.length > 0) {
          prodVariants.forEach((v) => {
            items.push({
              key: `${p.id}-${v.id}`,
              productId: p.id,
              variantId: v.id,
              name: `${p.name_en} - ${v.name_en}`,
              sku: v.sku || "N/A",
              stock: v.stock_quantity,
              threshold: p.low_stock_threshold,
              isVariant: true
            });
          });
        } else {
          items.push({
            key: `${p.id}-default`,
            productId: p.id,
            variantId: null,
            name: p.name_en,
            sku: "N/A",
            stock: p.stock_quantity,
            threshold: p.low_stock_threshold,
            isVariant: false
          });
        }
      });
      setStockItems(items);
    }

    // 3. Fetch Stock History logs
    const { data: logs } = await supabase
      .from("whoop_stock_history")
      .select(`
        *,
        whoop_products (name_en)
      `)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (logs) setStockLogs(logs);

    // 4. Fetch Restock Leads alerts
    const { data: leads } = await supabase
      .from("whoop_restock_alerts")
      .select(`
        *,
        whoop_products (name_en)
      `)
      .order("created_at", { ascending: false });
    
    if (leads) setRestockLeads(leads);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdjustStock = async (item: any) => {
    if (adjustValue === 0) return;
    const finalStock = Math.max(0, item.stock + adjustValue);

    try {
      if (item.isVariant) {
        // Update variant
        await supabase
          .from("whoop_product_variants")
          .update({ stock_quantity: finalStock })
          .eq("id", item.variantId);
      } else {
        // Update product
        await supabase
          .from("whoop_products")
          .update({ stock_quantity: finalStock })
          .eq("id", item.productId);
      }

      // Log Stock History
      await supabase.from("whoop_stock_history").insert({
        product_id: item.productId,
        variant_id: item.variantId || null,
        change_amount: adjustValue,
        reason: "Manual Adjustment (Quick Restock)"
      });

      setEditingStockId(null);
      setAdjustValue(0);
      loadInventory();
    } catch (err) {
      console.error(err);
      alert("Restock adjustment failed.");
    }
  };

  // Find out if any item has fallen below threshold
  const lowStockItems = stockItems.filter((i) => i.stock <= i.threshold);

  return (
    <div className="space-y-8 select-none font-sans text-xs">
      
      {/* Alert banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-strain-red/10 border border-strain-red/30 p-4 rounded-xl flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-strain-red flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-strain-red text-sm">Low Stock Alert!</div>
            <p className="text-white/60 leading-relaxed mt-0.5">
              The following {lowStockItems.length} catalog profiles have fallen below their configured stock safety thresholds. Please restock immediately to avoid catalog buy-lockouts.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Inventory Table - Left 8 columns */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono tracking-widest text-white/50 uppercase">Stock Levels Registry</h3>
            <span className="text-[10px] font-mono text-white/45">Total Profiles: {stockItems.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-neutral-950/80 text-white/50 uppercase tracking-wider">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name / Color</th>
                  <th className="p-3">Current Qty</th>
                  <th className="p-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {stockItems.map((item) => {
                  const isLow = item.stock <= item.threshold;
                  const isEditing = editingStockId === item.key;

                  return (
                    <tr key={item.key} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-white/60">{item.sku}</td>
                      <td className="p-3 font-sans font-semibold text-white">{item.name}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded ${isLow ? "bg-strain-red/10 text-strain-red" : "bg-whoop-green/10 text-whoop-green"}`}>
                          {item.stock} pcs
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 justify-end">
                            <input
                              type="number"
                              value={adjustValue === 0 ? "" : adjustValue}
                              onChange={(e) => setAdjustValue(parseInt(e.target.value) || 0)}
                              placeholder="+/-"
                              className="w-16 bg-neutral-900 border border-white/10 text-xs px-2 py-1 rounded text-center text-white outline-none font-bold"
                            />
                            <button
                              onClick={() => handleAdjustStock(item)}
                              className="px-2 py-1 bg-whoop-green text-black font-display font-bold text-[10px] uppercase rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="px-2 py-1 bg-white/5 text-white/60 hover:text-white rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStockId(item.key);
                              setAdjustValue(0);
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white font-mono text-[10px] uppercase px-3 py-1 rounded-lg transition-all"
                          >
                            Quick Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar logs and leads - Right 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stock changes history logs */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-mono tracking-widest text-white/50 uppercase flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-whoop-green" />
              <span>Stock History Log</span>
            </h3>

            <div className="space-y-3 font-sans text-[11px]">
              {stockLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-start border-b border-white/5 pb-2">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white/80">{log.whoop_products?.name_en}</div>
                    <div className="text-[9px] text-white/35 font-mono">{log.reason}</div>
                  </div>
                  <span className={`font-mono font-bold ${log.change_amount > 0 ? "text-whoop-green" : "text-strain-red"}`}>
                    {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Restock Leads */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-mono tracking-widest text-white/50 uppercase flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-whoop-green" />
              <span>Restock Leads Alerts</span>
            </h3>

            {restockLeads.length === 0 ? (
              <div className="text-center py-6 text-white/30 italic">No restock alerts requested yet.</div>
            ) : (
              <div className="space-y-3 font-sans text-[11px]">
                {restockLeads.map((lead) => (
                  <div key={lead.id} className="space-y-1 border-b border-white/5 pb-2">
                    <div className="flex justify-between font-semibold text-white/80">
                      <span>{lead.whoop_products?.name_en}</span>
                      <span className="text-[9px] text-white/40 font-mono">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-whoop-green font-mono">{lead.customer_contact}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
