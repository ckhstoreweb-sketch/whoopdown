"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, ShoppingCart, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardTab() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    pending: 0,
    lowStock: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Fetch orders for stats
      const { data: orders } = await supabase
        .from("whoop_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (orders) {
        const rev = orders.reduce((sum, o) => sum + (o.status === "Delivered" || o.status === "Confirmed" ? o.total : 0), 0);
        const pend = orders.filter((o) => o.status === "Pending").length;
        setStats((prev) => ({
          ...prev,
          revenue: rev,
          orders: orders.length,
          pending: pend
        }));
        setRecentOrders(orders.slice(0, 5));

        // Group by day for Recharts chart
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split("T")[0];
        }).reverse();

        const dailyGroup = last7Days.map((date) => {
          const dayOrders = orders.filter(
            (o) => o.created_at.split("T")[0] === date && (o.status === "Delivered" || o.status === "Confirmed")
          );
          const totalRev = dayOrders.reduce((sum, o) => sum + o.total, 0);
          return {
            date: date.substring(5), // MM-DD
            Sales: totalRev
          };
        });
        setChartData(dailyGroup);
      }

      // 2. Fetch products for low stock alert
      const { data: prods } = await supabase.from("whoop_products").select("stock_quantity, low_stock_threshold");
      if (prods) {
        const low = prods.filter((p) => p.stock_quantity <= p.low_stock_threshold).length;
        setStats((prev) => ({ ...prev, lowStock: low }));
      }
    }

    loadDashboardData();

    // Subscribe to real-time order notifications
    const channel = supabase
      .channel("admin-realtime-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "whoop_orders" },
        (payload) => {
          // Play synthesized browser alert tone
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
          } catch (e) {
            console.warn("Could not play sound ping: ", e);
          }

          // Reload stats & recent feed
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-8 select-none">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display uppercase tracking-wider text-white">Dashboard Overview</h2>
        {stats.lowStock > 0 && (
          <div className="bg-strain-red/15 border border-strain-red/30 text-strain-red font-mono text-xs px-3 py-1.5 rounded-lg animate-pulse flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>{stats.lowStock} Low Stock Alert Banners Active!</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-whoop-green/10 text-whoop-green rounded-xl border border-whoop-green/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase">Total Revenue</div>
            <div className="text-xl font-bold font-mono text-white">{stats.revenue.toLocaleString()} EGP</div>
          </div>
        </div>

        {/* Orders */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-white/5 text-white/70 rounded-xl border border-white/10">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase">Total Orders</div>
            <div className="text-xl font-bold font-mono text-white">{stats.orders}</div>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-yellow-400/10 text-yellow-400 rounded-xl border border-yellow-400/20">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase">Pending Review</div>
            <div className="text-xl font-bold font-mono text-white">{stats.pending}</div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-strain-red/10 text-strain-red rounded-xl border border-strain-red/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase">Low Stock items</div>
            <div className="text-xl font-bold font-mono text-white">{stats.lowStock}</div>
          </div>
        </div>
      </div>

      {/* Chart and Feed split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Sales Recharts Graph */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <h3 className="text-sm font-mono tracking-widest text-white/50 uppercase mb-4">Sales History (Last 7 Days)</h3>
          <div className="h-64 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "#0A0A0A", borderColor: "#333", color: "#fff" }} />
                <Line type="monotone" dataKey="Sales" stroke="#00F19F" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-mono tracking-widest text-white/50 uppercase">Recent Orders</h3>
          
          <div className="divide-y divide-white/5 font-sans text-xs">
            {recentOrders.map((ord, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white/90">{ord.customer_name}</div>
                  <div className="text-[10px] font-mono text-white/40 mt-0.5">{ord.customer_phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-whoop-green">{ord.total.toLocaleString()} EGP</div>
                  <span className={`inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded mt-1 ${ord.status === "Pending" ? "bg-yellow-400/10 text-yellow-400" : ord.status === "Confirmed" ? "bg-whoop-green/10 text-whoop-green" : ord.status === "Delivered" ? "bg-blue-500/10 text-blue-400" : "bg-strain-red/10 text-strain-red"}`}>
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
