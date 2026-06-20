"use client";

import React, { useState, useEffect } from "react";
import { useWhoopStore, CartItem, DiscountCode, DeliveryZone } from "@/store/useStore";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Upload, Check, MessageSquare } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    discount,
    applyDiscount,
    removeDiscount,
    deliveryZone,
    setDeliveryZone,
    t,
    lang
  } = useWhoopStore();

  const shouldReduceMotion = useReducedMotion();

  // Wizard state: 'cart' | 'info' | 'payment' | 'review' | 'success'
  const [step, setStep] = useState<"cart" | "info" | "payment" | "review" | "success">("cart");

  // Form Fields
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedZone, setSelectedZone] = useState<any>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<"InstaPay" | "Vodafone Cash">("InstaPay");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  
  const [sealPolicyChecked, setSealPolicyChecked] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Available Zones list
  const [zonesList, setZonesList] = useState<any[]>([]);
  // Site settings for accounts
  const [instapayDetails, setInstapayDetails] = useState<any>({ address: "whoopdown@instapay", name: "Rich Phone Store" });
  const [vodafoneDetails, setVodafoneDetails] = useState<any>({ number: "01012345678" });

  useEffect(() => {
    async function loadLogistics() {
      // Load zones
      const { data: zData } = await supabase.from("whoop_site_settings").select("*").eq("key", "delivery_zones").single();
      if (zData && zData.value?.zones) {
        setZonesList(zData.value.zones);
      } else {
        setZonesList([
          { name_en: "Nasr City", name_ar: "مدينة نصر", fee: 250 },
          { name_en: "New Cairo / Tagamoa", name_ar: "التجمع / القاهرة الجديدة", fee: 250 },
          { name_en: "Heliopolis / Masr El Gedida", name_ar: "مصر الجديدة", fee: 250 }
        ]);
      }

      // Load InstaPay details
      const { data: ipData } = await supabase.from("whoop_site_settings").select("*").eq("key", "instapay_details").single();
      if (ipData) setInstapayDetails(ipData.value);

      // Load Vodafone details
      const { data: vfData } = await supabase.from("whoop_site_settings").select("*").eq("key", "vodafone_cash_details").single();
      if (vfData) setVodafoneDetails(vfData.value);
    }
    if (isOpen) {
      loadLogistics();
    }
  }, [isOpen]);

  // Totals calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = selectedZone ? selectedZone.fee : 0;
  
  let discountAmount = 0;
  if (discount) {
    if (discount.type === "percentage") {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }
  }
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Handle Promo Code Apply
  const handleApplyPromo = async () => {
    setPromoError("");
    setPromoSuccess("");
    if (!promoInput) return;

    const { data, error } = await supabase
      .from("whoop_discount_codes")
      .select("*")
      .eq("code", promoInput.trim().toUpperCase())
      .single();

    if (error || !data) {
      setPromoError(lang === "ar" ? "كود غير صحيح" : "Invalid promo code");
      return;
    }

    if (!data.is_active || new Date(data.expiry_date) < new Date()) {
      setPromoError(lang === "ar" ? "الكود منتهي الصلاحية" : "Expired promo code");
      return;
    }

    if (subtotal < data.min_order_value) {
      setPromoError(
        lang === "ar" 
          ? `الحد الأدنى لتطبيق الكود هو ${data.min_order_value} ج.م` 
          : `Minimum order value for this code is ${data.min_order_value} EGP`
      );
      return;
    }

    if (data.usage_limit && data.usage_count >= data.usage_limit) {
      setPromoError(lang === "ar" ? "نفذت مرات استخدام الكود" : "Promo code usage limit reached");
      return;
    }

    applyDiscount({
      code: data.code,
      type: data.type,
      value: data.value,
      minOrderValue: data.min_order_value
    });
    setPromoSuccess(lang === "ar" ? "تم تطبيق الخصم بنجاح!" : "Promo code applied successfully!");
    setPromoInput("");
  };

  // Convert screenshot to Base64
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Checkout submission
  const handlePlaceOrder = async () => {
    if (!sealPolicyChecked) return;
    setIsSubmitting(true);

    try {
      // Format items array for PG jsonb
      const itemsPayload = cart.map((item) => ({
        product_id: item.id,
        variant_id: item.variantId || null,
        name_en: item.nameEn,
        name_ar: item.nameAr,
        variant_name_en: item.variantNameEn || null,
        variant_name_ar: item.variantNameAr || null,
        price: item.price,
        quantity: item.quantity
      }));

      const { data: orderId, error } = await supabase.rpc("whoop_place_order", {
        p_customer_name: fullname,
        p_customer_phone: phone,
        p_customer_address: address,
        p_delivery_zone: selectedZone ? (selectedZone === "pickup" ? "Store Pickup" : selectedZone.name_en) : "Store Pickup",
        p_delivery_fee: deliveryFee,
        p_payment_method: paymentMethod,
        p_payment_screenshot: screenshotBase64,
        p_subtotal: subtotal,
        p_discount_amount: discountAmount,
        p_discount_code: discount?.code || null,
        p_total: total,
        p_items: itemsPayload
      });

      if (error || !orderId) {
        throw new Error(error?.message || "Checkout RPC failed");
      }

      setCreatedOrderId(orderId);
      setStep("success");
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please check your data and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === "success") {
      setStep("cart");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer Body */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={shouldReduceMotion ? { duration: 0.1 } : { type: "tween", duration: 0.35, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-md bg-neutral-950 border-l border-white/10 h-full flex flex-col justify-between"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl uppercase tracking-wider text-white">
              {step === "success" ? t("orderSuccessTitle") : t("yourCart")}
            </h3>
            {step !== "cart" && step !== "success" && (
              <span className="text-[10px] bg-whoop-green/10 text-whoop-green px-2 py-0.5 rounded font-mono uppercase font-bold">
                Step {step === "info" ? "1/3" : step === "payment" ? "2/3" : "3/3"}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CART VIEW */}
            {step === "cart" && (
              <motion.div
                key="cart-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <Trash2 className="w-10 h-10 mx-auto text-white/20 animate-bounce" />
                    <p className="text-sm text-white/45">{t("emptyCart")}</p>
                  </div>
                ) : (
                  <>
                    {/* Cart list */}
                    <div className="divide-y divide-white/5 max-h-[40vh] overflow-y-auto pr-1">
                      {cart.map((item, i) => (
                        <div key={i} className="py-4 flex gap-4 items-start justify-between">
                          {/* Mini visual */}
                          <div className="w-12 h-16 bg-neutral-900 border border-white/5 rounded flex items-center justify-center flex-shrink-0 text-white/50 text-[10px]">
                            {item.variantNameEn ? item.variantNameEn[0] : item.nameEn[0]}
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-1">
                            <h4 className="text-xs font-semibold text-white">
                              {lang === "ar" ? item.nameAr : item.nameEn}
                            </h4>
                            {item.variantNameEn && (
                              <p className="text-[10px] text-white/40 font-mono">
                                {lang === "ar" ? item.variantNameAr : item.variantNameEn}
                              </p>
                            )}

                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 pt-1 select-none">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                                className="p-1 rounded bg-white/5 text-white/60 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono font-bold w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                                className="p-1 rounded bg-white/5 text-white/60 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Price and delete */}
                          <div className="text-right space-y-2">
                            <div className="text-xs font-bold font-mono text-whoop-green">
                              {(item.price * item.quantity).toLocaleString()} EGP
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, item.variantId)}
                              className="text-white/30 hover:text-strain-red transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Promo Code Application */}
                    <div className="border-t border-white/5 pt-4 space-y-2">
                      <label className="text-[10px] font-mono tracking-widest text-white/40 uppercase block">
                        {t("promoCode")}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="WHOOPGREEN"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-whoop-green/40 text-xs px-3 py-2 rounded-lg flex-1 outline-none text-white transition-all font-mono"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-4 bg-white/10 hover:bg-whoop-green hover:text-black font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                        >
                          {t("applyBtn")}
                        </button>
                      </div>
                      {promoError && <p className="text-[10px] font-mono text-strain-red">{promoError}</p>}
                      {promoSuccess && <p className="text-[10px] font-mono text-whoop-green">{promoSuccess}</p>}
                      {discount && (
                        <div className="flex justify-between items-center bg-whoop-green/10 border border-whoop-green/20 px-3 py-1.5 rounded-lg text-[10px] font-mono">
                          <span className="text-whoop-green">Active Discount: {discount.code}</span>
                          <button onClick={removeDiscount} className="text-strain-red hover:underline uppercase text-[9px] font-bold">Remove</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 2: CUSTOMER INFO */}
            {step === "info" && (
              <motion.div
                key="info-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white/5 px-3 py-2 rounded-lg text-[10px] font-mono text-white/50 uppercase">
                  {t("customerInfo")}
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">{t("fullname")}</label>
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Ahmed Ali"
                    className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">{t("phoneLabel")}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all font-mono"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">{t("addressLabel")}</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat 3, Building 45, Street 9..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all"
                    required
                  />
                </div>

                {/* Delivery Zone dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">{t("selectZone")}</label>
                  <select
                    value={selectedZone ? selectedZone.name_en : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setSelectedZone(null);
                      } else {
                        const zone = zonesList.find(z => z.name_en === val);
                        setSelectedZone(zone || null);
                      }
                    }}
                    className="w-full bg-neutral-900 border border-white/10 focus:border-whoop-green/40 text-xs px-4 py-2.5 rounded-xl outline-none text-white transition-all"
                    required
                  >
                    <option value="">-- Select Zone --</option>
                    {zonesList.map((z, idx) => (
                      <option key={idx} value={z.name_en}>
                        {lang === "ar" ? z.name_ar : z.name_en} (+{z.fee} EGP)
                      </option>
                    ))}
                    <option value="pickup">
                      {lang === "ar" ? "استلام من الفرع بسراج مول (0 ج.م)" : t("pickupOption")}
                    </option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT DETAILS */}
            {step === "payment" && (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white/5 px-3 py-2 rounded-lg text-[10px] font-mono text-white/50 uppercase">
                  {t("paymentMethod")}
                </div>

                {/* Payment Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("InstaPay")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center font-display text-xs tracking-wider transition-all ${paymentMethod === "InstaPay" ? "border-whoop-green bg-white/5 text-whoop-green" : "border-white/10 bg-transparent text-white/60"}`}
                  >
                    <span>INSTAPAY</span>
                    <span className="text-[8px] font-mono uppercase mt-0.5">انستاباي</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("Vodafone Cash")}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center font-display text-xs tracking-wider transition-all ${paymentMethod === "Vodafone Cash" ? "border-whoop-green bg-white/5 text-whoop-green" : "border-white/10 bg-transparent text-white/60"}`}
                  >
                    <span>VODAFONE CASH</span>
                    <span className="text-[8px] font-mono uppercase mt-0.5">فودافون كاش</span>
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Transfer Details:</span>
                  {paymentMethod === "InstaPay" ? (
                    <div className="space-y-1.5 font-sans text-xs">
                      <p className="text-white/80">{t("instapayInstructions")}</p>
                      <div className="bg-black/40 border border-white/5 p-3 rounded-lg font-mono text-center">
                        <div className="text-[9px] text-white/40">INSTAPAY ADDRESS</div>
                        <div className="text-sm font-bold text-whoop-green tracking-wider">{instapayDetails.address}</div>
                        <div className="text-[10px] text-white/50 mt-1">{instapayDetails.name}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 font-sans text-xs">
                      <p className="text-white/80">{t("vodafoneInstructions")}</p>
                      <div className="bg-black/40 border border-white/5 p-3 rounded-lg font-mono text-center">
                        <div className="text-[9px] text-white/40">VODAFONE CASH NUMBER</div>
                        <div className="text-sm font-bold text-strain-red tracking-widest">{vodafoneDetails.number}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Screenshot upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">
                    {t("uploadProof")}
                  </label>
                  <div className="relative border border-dashed border-white/10 hover:border-whoop-green/30 rounded-xl p-4 bg-white/5 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer select-none">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <Upload className="w-6 h-6 text-white/40" />
                    <span className="text-xs text-white/60">
                      {screenshotBase64 ? "Image Uploaded ✅" : "Choose File or Drop Image"}
                    </span>
                    <span className="text-[9px] font-mono text-white/35">JPEG, PNG up to 5MB</span>
                  </div>
                  {screenshotBase64 && (
                    <div className="mt-2 relative w-16 h-16 border border-white/10 rounded-lg overflow-hidden bg-neutral-900">
                      <img src={screenshotBase64} alt="screenshot proof" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: ORDER REVIEW & PLACE */}
            {step === "review" && (
              <motion.div
                key="review-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-white/5 px-3 py-2 rounded-lg text-[10px] font-mono text-white/50 uppercase">
                  {t("orderReview")}
                </div>

                {/* Customer summary */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 font-sans text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-white/40">Recipient:</span><span className="text-white/95 font-bold">{fullname}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Phone:</span><span className="text-white/95 font-mono">{phone}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Address:</span><span className="text-white/70 text-right max-w-[200px] leading-relaxed">{address}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Zone:</span><span className="text-white/95 font-mono">{selectedZone ? selectedZone.name_en : "Store Pickup"}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Payment:</span><span className="text-white/95 font-mono">{paymentMethod}</span></div>
                </div>

                {/* Items Summary list */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2 max-h-[15vh] overflow-y-auto">
                  <span className="text-[9px] font-mono text-white/35 uppercase tracking-widest block">Ordered Items:</span>
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-white/80 line-clamp-1 max-w-[220px]">
                        {lang === "ar" ? item.nameAr : item.nameEn} (x{item.quantity})
                      </span>
                      <span className="font-mono text-white/60">{(item.price * item.quantity).toLocaleString()} EGP</span>
                    </div>
                  ))}
                </div>

                {/* Mandatory Seal Checkbox */}
                <div className="bg-strain-red/5 border border-strain-red/20 rounded-xl p-4 space-y-3">
                  <div className="flex gap-2 items-start cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="sealPolicyCheck"
                      checked={sealPolicyChecked}
                      onChange={(e) => setSealPolicyChecked(e.target.checked)}
                      className="mt-1 accent-whoop-green"
                    />
                    <label htmlFor="sealPolicyCheck" className="text-[11px] text-white/80 leading-relaxed cursor-pointer font-bold">
                      {t("sealPolicyAgree")}
                    </label>
                  </div>
                  <div className="text-[9px] leading-relaxed text-white/45 pl-6 border-l border-white/5">
                    EN: Box seals must remain unbroken. Opens block returns.
                    <br />
                    AR: مفيش ترجيع نهائياً لو العلبة اتفتحت أو السيلد اتفك.
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: ORDER SUCCESS */}
            {step === "success" && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-8"
              >
                <div className="w-16 h-16 bg-whoop-green/10 border border-whoop-green/20 rounded-full flex items-center justify-center mx-auto text-whoop-green animate-bounce">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-display uppercase tracking-widest text-whoop-green">
                    Order Saved!
                  </h4>
                  <p className="text-xs text-white/65 max-w-sm mx-auto leading-relaxed">
                    {t("orderSuccessDesc")}
                  </p>
                </div>

                {/* Order ID */}
                {createdOrderId && (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 font-mono text-center">
                    <span className="text-[9px] text-white/40 block uppercase tracking-wider">{t("orderIdText")}</span>
                    <span className="text-xs font-bold text-white selection:bg-white selection:text-black">{createdOrderId}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-3 pt-4">
                  {/* Whatsapp share purchase */}
                  <a
                    href={`https://wa.me/201234567890?text=Hi%2C+I+just+placed+order+${createdOrderId}+on+WHOOP+DOWN.+Please+verify+my+screenshot.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-display tracking-widest text-xs uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t("sharePurchase")}</span>
                  </a>

                  {/* Track status */}
                  <Link
                    href={`/track?id=${createdOrderId}&phone=${phone}`}
                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-whoop-green/30 text-white font-display tracking-widest text-xs uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShieldCheck className="w-4 h-4 text-whoop-green" />
                    <span>{t("trackBtn")}</span>
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Drawer Footer & Dynamic CTAs */}
        {step !== "success" && (
          <div className="p-5 border-t border-white/10 space-y-4 bg-neutral-950/80">
            {/* Totals */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-white/50">
                <span>{t("subtotal")}</span>
                <span>{subtotal.toLocaleString()} EGP</span>
              </div>
              
              <div className="flex justify-between text-white/50">
                <span>{t("deliveryFee")}</span>
                <span>{selectedZone === "pickup" ? "0" : deliveryFee.toLocaleString()} EGP</span>
              </div>

              {discount && (
                <div className="flex justify-between text-whoop-green font-bold">
                  <span>{t("discountText")} (-{discount.value}{discount.type === "percentage" ? "%" : " EGP"})</span>
                  <span>-{discountAmount.toLocaleString()} EGP</span>
                </div>
              )}

              <div className="w-full h-px bg-white/5" />

              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>{t("totalText")}</span>
                <span className="text-whoop-green">{total.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Wizard Controls */}
            <div className="pt-2">
              {step === "cart" && (
                <button
                  disabled={cart.length === 0}
                  onClick={() => setStep("info")}
                  className="w-full py-3.5 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold tracking-widest text-sm uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed shadow-neon-green"
                >
                  <span>{t("checkoutBtn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === "info" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("cart")}
                    className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none"
                  >
                    Back
                  </button>
                  <button
                    disabled={!fullname || !phone || !address || !selectedZone}
                    onClick={() => setStep("payment")}
                    className="flex-1 py-3 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-green"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {step === "payment" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("info")}
                    className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none"
                  >
                    Back
                  </button>
                  <button
                    disabled={!screenshotBase64}
                    onClick={() => setStep("review")}
                    className="flex-1 py-3 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-green"
                  >
                    <span>Review Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {step === "review" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("payment")}
                    className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none"
                  >
                    Back
                  </button>
                  <button
                    disabled={!sealPolicyChecked || isSubmitting}
                    onClick={handlePlaceOrder}
                    className="flex-1 py-3 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-green"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Place Order</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
