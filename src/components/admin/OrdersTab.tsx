"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, FileSpreadsheet, Eye, ChevronDown, ChevronUp, Check, X, Truck, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  
  // Selection for bulk actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Modals / Toast
  const [activeActionModal, setActiveActionModal] = useState<{ id: string; status: string } | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadOrders = async () => {
    const { data } = await supabase
      .from("whoop_orders")
      .select(`
        *,
        whoop_order_items (*)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data);
  };

  useEffect(() => {
    loadOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("admin-orders-tab")
      .on("postgres_changes", { event: "*", schema: "public", table: "whoop_orders" }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("whoop_orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      triggerToast(`Order status updated to ${newStatus} ✅`);
      setActiveActionModal(null);
      loadOrders();
    } else {
      alert("Failed to update status.");
    }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedOrderIds.length === 0) return;
    const { error } = await supabase
      .from("whoop_orders")
      .update({ status: newStatus })
      .in("id", selectedOrderIds);

    if (!error) {
      triggerToast(`Bulk status updated to ${newStatus} on ${selectedOrderIds.length} orders ✅`);
      setSelectedOrderIds([]);
      loadOrders();
    } else {
      alert("Bulk update failed.");
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID", "Customer Name", "Phone", "Address", "Delivery Zone", "Payment Method", "Subtotal", "Discount", "Total", "Status", "Date"];
    const rows = orders.map((o) => [
      o.id,
      o.customer_name,
      o.customer_phone,
      `"${o.customer_address.replace(/"/g, '""')}"`,
      o.delivery_zone,
      o.payment_method,
      o.subtotal,
      o.discount_amount,
      o.total,
      o.status,
      o.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whoop_down_orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesName = o.customer_name.toLowerCase().includes(filterName.toLowerCase()) || o.customer_phone.includes(filterName) || o.id.includes(filterName);
    const matchesStatus = filterStatus === "all" ? true : o.status === filterStatus;
    return matchesName && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none font-sans relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-whoop-green text-black px-4 py-2.5 rounded-xl font-mono text-xs font-bold shadow-neon-green"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-display uppercase tracking-wider text-white">Orders Logs</h2>
        
        {/* CSV export */}
        <button
          onClick={handleExportCSV}
          className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-whoop-green/30 text-white font-mono text-xs uppercase px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start"
        >
          <FileSpreadsheet className="w-4 h-4 text-whoop-green" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and controls bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 items-center">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 focus:border-whoop-green/40 text-xs pl-9 pr-4 py-2.5 rounded-lg outline-none text-white transition-all"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 text-xs px-3 py-2.5 rounded-lg outline-none text-white focus:border-whoop-green/40"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        <div className="sm:col-span-3 flex gap-2 justify-end">
          {selectedOrderIds.length > 0 && (
            <>
              <button
                onClick={() => handleBulkStatus("Confirmed")}
                className="p-2 bg-whoop-green/10 text-whoop-green border border-whoop-green/20 rounded-lg text-xs font-mono font-bold"
                title="Mark Confirmed"
              >
                Confirm
              </button>
              <button
                onClick={() => handleBulkStatus("Delivered")}
                className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-mono font-bold"
                title="Mark Delivered"
              >
                Deliver
              </button>
            </>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[700px] text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 bg-neutral-950/80 text-white/50 uppercase tracking-wider">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={toggleSelectAll}
                  className="accent-whoop-green"
                />
              </th>
              <th className="p-3">Order ID / Date</th>
              <th className="p-3">Customer Info</th>
              <th className="p-3">Method / Zone</th>
              <th className="p-3">Total Sum</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {filteredOrders.map((order) => {
              const isExpanded = !!expandedOrders[order.id];
              const isSelected = selectedOrderIds.includes(order.id);

              return (
                <React.Fragment key={order.id}>
                  <tr className={`hover:bg-white/5 transition-colors ${isSelected ? "bg-whoop-green/5" : ""}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="accent-whoop-green"
                      />
                    </td>
                    
                    <td className="p-3 space-y-1">
                      <div className="font-bold text-white selection:bg-white selection:text-black">{order.id.substring(0, 8)}...</div>
                      <div className="text-[10px] text-white/45">{new Date(order.created_at).toLocaleString()}</div>
                    </td>

                    <td className="p-3 space-y-0.5">
                      <div className="font-sans font-bold text-white/95">{order.customer_name}</div>
                      <div className="text-[10px] text-white/50">{order.customer_phone}</div>
                    </td>

                    <td className="p-3 space-y-0.5">
                      <div>{order.payment_method}</div>
                      <div className="text-[10px] text-white/45">{order.delivery_zone}</div>
                    </td>

                    <td className="p-3 font-bold text-whoop-green">
                      {order.total.toLocaleString()} EGP
                    </td>

                    <td className="p-3">
                      <span className={`inline-block text-[9px] uppercase px-1.5 py-0.5 rounded ${order.status === "Pending" ? "bg-yellow-400/10 text-yellow-400" : order.status === "Confirmed" ? "bg-whoop-green/10 text-whoop-green" : order.status === "Delivered" ? "bg-blue-500/10 text-blue-400" : "bg-strain-red/10 text-strain-red"}`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-1.5">
                      {/* Confirm/Verify */}
                      {order.status === "Pending" && (
                        <button
                          onClick={() => setActiveActionModal({ id: order.id, status: "Confirmed" })}
                          className="p-1.5 rounded bg-whoop-green/10 hover:bg-whoop-green text-whoop-green hover:text-black transition-colors focus:outline-none"
                          title="Confirm Payment"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Ship/Deliver */}
                      {order.status === "Confirmed" && (
                        <button
                          onClick={() => setActiveActionModal({ id: order.id, status: "Delivered" })}
                          className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-colors focus:outline-none"
                          title="Mark Delivered"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Reject */}
                      {order.status === "Pending" && (
                        <button
                          onClick={() => setActiveActionModal({ id: order.id, status: "Rejected" })}
                          className="p-1.5 rounded bg-strain-red/10 hover:bg-strain-red text-strain-red hover:text-white transition-colors focus:outline-none"
                          title="Reject Screenshot"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors focus:outline-none"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Accordion Row */}
                  <AnimatePresence>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0 bg-neutral-950/40">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-12 gap-6"
                          >
                            {/* Items details */}
                            <div className="md:col-span-5 space-y-3 font-sans">
                              <span className="text-[10px] font-mono text-white/40 uppercase block">Cart Items:</span>
                              <div className="divide-y divide-white/5 text-xs">
                                {order.whoop_order_items?.map((item: any, idx: number) => (
                                  <div key={idx} className="py-2 flex justify-between">
                                    <div>
                                      <span className="font-bold text-white">{item.product_name_en}</span>
                                      {item.variant_name_en && <span className="text-[10px] text-white/50 block font-mono">Strap: {item.variant_name_en}</span>}
                                    </div>
                                    <span className="font-mono text-white/60">x{item.quantity} - {item.price.toLocaleString()} EGP</span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-white/5 pt-2 text-xs flex justify-between font-mono">
                                <span className="text-white/40">Subtotal:</span>
                                <span>{order.subtotal.toLocaleString()} EGP</span>
                              </div>
                              {order.discount_amount > 0 && (
                                <div className="text-xs flex justify-between font-mono text-whoop-green">
                                  <span>Discount Applied ({order.discount_code}):</span>
                                  <span>-{order.discount_amount.toLocaleString()} EGP</span>
                                </div>
                              )}
                              <div className="text-xs flex justify-between font-mono text-white/45">
                                  <span>Delivery Fee:</span>
                                  <span>{order.delivery_fee.toLocaleString()} EGP</span>
                                </div>
                            </div>

                            {/* Full Address details */}
                            <div className="md:col-span-3 space-y-2 font-sans">
                              <span className="text-[10px] font-mono text-white/40 uppercase block">Shipping Address:</span>
                              <p className="text-xs text-white/80 leading-relaxed bg-black/40 border border-white/5 p-3 rounded-lg">
                                {order.customer_address}
                              </p>
                            </div>

                            {/* Screenshot proof */}
                            <div className="md:col-span-4 space-y-2">
                              <span className="text-[10px] font-mono text-white/40 uppercase block">Payment Screenshot:</span>
                              {order.payment_screenshot_url ? (
                                <div className="relative group max-w-[200px] border border-white/10 rounded-lg overflow-hidden bg-neutral-900 shadow">
                                  <img
                                    src={order.payment_screenshot_url}
                                    alt="payment proof screenshot"
                                    className="w-full h-auto object-cover cursor-zoom-in"
                                    onClick={() => window.open(order.payment_screenshot_url, "_blank")}
                                  />
                                </div>
                              ) : (
                                <div className="text-xs text-white/35 italic">No transfer screenshot uploaded.</div>
                              )}
                            </div>

                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CONFIRMATION ACTION MODAL (SLIDE UP) */}
      <AnimatePresence>
        {activeActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveActionModal(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-neutral-950 border border-white/10 rounded-2xl p-6 text-center space-y-5"
            >
              <h3 className="text-lg font-display uppercase tracking-wider text-white">
                Are you sure?
              </h3>
              <p className="text-xs text-white/65 leading-relaxed">
                Confirm updating order <span className="font-mono text-white">{activeActionModal.id.substring(0,8)}...</span> to status <span className="font-bold text-whoop-green">{activeActionModal.status}</span>.
              </p>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveActionModal(null)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-mono text-xs uppercase rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeActionModal.id, activeActionModal.status)}
                  className="flex-1 py-2.5 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-neon-green"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
