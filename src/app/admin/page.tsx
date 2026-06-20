"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FolderKanban, ClipboardList, Settings, Users, Percent, LogOut, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// Import tabs
import DashboardTab from "@/components/admin/DashboardTab";
import OrdersTab from "@/components/admin/OrdersTab";
import ProductsTab from "@/components/admin/ProductsTab";
import InventoryTab from "@/components/admin/InventoryTab";
import SettingsTab from "@/components/admin/SettingsTab";
import CustomersTab from "@/components/admin/CustomersTab";
import PromosTab from "@/components/admin/PromosTab";

type AdminTab = "dashboard" | "orders" | "products" | "inventory" | "settings" | "customers" | "promos";

export default function AdminPage() {
  const router = useRouter();
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const checkAuth = async () => {
    setLoading(true);
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (currentSession) {
      setSession(currentSession);
      // Validate role in public.whoop_admin_users
      const { data: adminRecord } = await supabase
        .from("whoop_admin_users")
        .select("*")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (adminRecord && adminRecord.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        // Clean session if not admin
        await supabase.auth.signOut();
        setAuthError("Access Denied: You are not registered as an administrator.");
      }
    } else {
      setSession(null);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.session) {
        // Validate admin role
        const { data: adminRecord } = await supabase
          .from("whoop_admin_users")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (adminRecord && adminRecord.role === "admin") {
          setSession(data.session);
          setIsAdmin(true);
        } else {
          setAuthError("Access Denied: You are not authorized as an administrator.");
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error(err);
      setAuthError("Failed to authenticate.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    router.push("/");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "orders":
        return <OrdersTab />;
      case "products":
        return <ProductsTab />;
      case "inventory":
        return <InventoryTab />;
      case "settings":
        return <SettingsTab />;
      case "customers":
        return <CustomersTab />;
      case "promos":
        return <PromosTab />;
      default:
        return <DashboardTab />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-whoop-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative select-none">
        
        {/* Background radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-whoop-green/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-sm glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-whoop-green flex items-center justify-center font-display text-2xl text-black font-extrabold shadow-neon-green mx-auto">
              W
            </div>
            <h3 className="text-2xl font-display uppercase tracking-widest text-white">
              WHOOP DOWN ADMIN
            </h3>
            <p className="text-xs text-white/50">Operator Dashboard Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Operator Email</label>
              <input
                type="email"
                placeholder="admin@whoopdown.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/40 uppercase block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all font-mono"
                required
              />
            </div>

            {authError && (
              <p className="text-[10px] font-mono text-strain-red text-center bg-strain-red/5 border border-strain-red/10 p-2 rounded-lg">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold tracking-widest text-xs uppercase rounded-xl transition-all shadow-neon-green flex items-center justify-center"
            >
              {authLoading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Verify Identity"}
            </button>
          </form>

          {/* Go Back Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => router.push("/")}
              className="text-[10px] text-white/40 hover:text-white uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN PANEL FRAME
  const navItems = [
    { id: "dashboard" as AdminTab, label: "Overview", icon: LayoutDashboard },
    { id: "orders" as AdminTab, label: "Orders", icon: ShoppingBag },
    { id: "products" as AdminTab, label: "Catalog", icon: FolderKanban },
    { id: "inventory" as AdminTab, label: "Inventory", icon: ClipboardList },
    { id: "customers" as AdminTab, label: "Customers", icon: Users },
    { id: "promos" as AdminTab, label: "Promos", icon: Percent },
    { id: "settings" as AdminTab, label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col md:flex-row relative">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-950 border-r border-white/10 flex flex-col justify-between flex-shrink-0 md:h-screen sticky top-0 z-30 select-none">
        
        {/* Brand info */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-whoop-green flex items-center justify-center font-display text-lg text-black font-extrabold shadow-neon-green">
              W
            </div>
            <span className="font-display tracking-widest text-white uppercase text-sm">
              WHOOP <span className="text-whoop-green">ADMIN</span>
            </span>
          </div>
          
          <button
            onClick={() => router.push("/")}
            className="md:hidden p-1.5 rounded bg-white/5 text-white/60"
            title="Go to store"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-xs font-mono font-bold focus:outline-none ${isActive ? "bg-whoop-green text-black shadow-neon-green" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Back to store */}
          <button
            onClick={() => router.push("/")}
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-mono text-[10px] uppercase text-center transition-all focus:outline-none flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-whoop-green" />
            <span>View Storefront</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-lg bg-strain-red/10 border border-strain-red/20 text-strain-red hover:bg-strain-red hover:text-white font-mono text-[10px] uppercase text-center transition-all focus:outline-none flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Tab Content Panel */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {renderActiveTab()}
      </main>

    </div>
  );
}
