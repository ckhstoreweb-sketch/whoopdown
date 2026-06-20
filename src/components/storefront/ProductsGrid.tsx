"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWhoopStore, CartItem } from "@/store/useStore";
import { ShoppingCart, Eye, Plus, Minus, X, Info } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Beautiful interactive Vector Strap rendering fallback
export function WhoopStrapVisual({ color }: { color: string }) {
  const getColorHex = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("white") || n.includes("arctic")) return "#F9FAFB";
    if (n.includes("green") || n.includes("ivy")) return "#3F4E3F";
    if (n.includes("grey") || n.includes("heather")) return "#8A9A9A";
    if (n.includes("gold")) return "#D4AF37";
    return "#171717"; // Black/Onyx
  };

  const strapColor = getColorHex(color);

  return (
    <div className="relative w-full h-48 flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-xl overflow-hidden border border-white/5 group-hover:border-whoop-green/20 transition-all select-none">
      {/* Background radial sensor glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,241,159,0.08)_0%,transparent_70%)]" />

      {/* Strap body (Vertical curved band) */}
      <div 
        className="w-16 h-36 rounded-md shadow-lg relative flex items-center justify-center transition-all duration-500 group-hover:scale-105"
        style={{ 
          backgroundColor: strapColor,
          backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.15), rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.25))",
          boxShadow: `0 8px 20px ${strapColor === "#F9FAFB" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.5)"}`
        }}
      >
        {/* Fabric knit textures */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#fff_2px,#fff_4px)]" />

        {/* Central Sensor Buckle (The WHOOP module clasp) */}
        <div className="w-12 h-20 bg-neutral-950 border border-white/10 rounded-lg shadow-2xl flex flex-col items-center justify-between py-2.5">
          <div className="w-6 h-1 bg-white/10 rounded-full" />
          
          {/* Pulsing sensor light */}
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-whoop-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-whoop-green"></span>
          </div>

          <span className="text-[7px] font-mono text-white/40 tracking-wider">WHOOP</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductsGrid() {
  const { t, lang, addToCart, cart } = useWhoopStore();
  const shouldReduceMotion = useReducedMotion();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [addedStates, setAddedStates] = useState<Record<string, boolean>>({});
  const [activeVariants, setActiveVariants] = useState<Record<string, any>>({});

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch categories
      const { data: cats } = await supabase
        .from("whoop_categories")
        .select("*")
        .order("created_at", { ascending: true });

      // 2. Fetch products & variants
      const { data: prods } = await supabase
        .from("whoop_products")
        .select(`
          *,
          whoop_product_variants (*),
          whoop_product_images (*)
        `)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
    }
    fetchData();
  }, []);

  const handleAddToCart = (product: any, variant: any) => {
    const id = `${product.id}-${variant?.id || "default"}`;
    addToCart({
      id: product.id,
      variantId: variant?.id,
      nameEn: product.name_en,
      nameAr: product.name_ar,
      variantNameEn: variant?.name_en,
      variantNameAr: variant?.name_ar,
      price: variant?.price_override || product.price,
      quantity: 1,
      imageUrl: variant?.image_url || product.whoop_product_images?.[0]?.image_url || "/images/whoop-placeholder.png",
      maxStock: variant?.stock_quantity || product.stock_quantity,
    });

    setAddedStates((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedStates((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const handleQuickViewAdd = () => {
    if (!quickViewProduct) return;
    const variant = selectedVariant || quickViewProduct.whoop_product_variants?.[0];
    addToCart({
      id: quickViewProduct.id,
      variantId: variant?.id,
      nameEn: quickViewProduct.name_en,
      nameAr: quickViewProduct.name_ar,
      variantNameEn: variant?.name_en,
      variantNameAr: variant?.name_ar,
      price: variant?.price_override || quickViewProduct.price,
      quantity: quickViewQty,
      imageUrl: variant?.image_url || quickViewProduct.whoop_product_images?.[0]?.image_url || "/images/whoop-placeholder.png",
      maxStock: variant?.stock_quantity || quickViewProduct.stock_quantity,
    });

    const key = `${quickViewProduct.id}-${variant?.id || "default"}`;
    setAddedStates((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedStates((prev) => ({ ...prev, [key]: false }));
    }, 1500);

    setQuickViewProduct(null);
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  return (
    <section id="devices-section" className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-12 select-none">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-white">
          {t("chooseWhoop")}
        </h2>
        <div className="w-24 h-1 bg-whoop-green mx-auto rounded-full" />
        <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
          {t("subChooseWhoop")}
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2 rounded-full font-mono text-xs uppercase transition-all focus:outline-none ${selectedCategory === "all" ? "bg-whoop-green text-black font-bold" : "bg-white/5 border border-white/10 text-white/70 hover:text-white"}`}
        >
          {lang === "ar" ? "الكل" : "All Products"}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2 rounded-full font-mono text-xs uppercase transition-all focus:outline-none ${selectedCategory === cat.id ? "bg-whoop-green text-black font-bold" : "bg-white/5 border border-white/10 text-white/70 hover:text-white"}`}
          >
            {lang === "ar" ? cat.name_ar : cat.name_en}
          </button>
        ))}
      </div>

      {/* Products Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {filteredProducts.map((product) => {
          const activeVariant = activeVariants[product.id] || product.whoop_product_variants?.[0];
          const price = activeVariant?.price_override || product.price;
          const isAdded = addedStates[`${product.id}-${activeVariant?.id || "default"}`];
          const isOutOfStock = product.stock_quantity === 0 || (activeVariant && activeVariant.stock_quantity === 0);

          return (
            <div
              key={product.id}
              className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-white/10 glass-panel-hover transition-transform duration-300 ease-out origin-center"
            >
              {/* Card Header & Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className="bg-white/5 border border-white/10 text-[9px] font-mono text-white/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.category_id === "c1000000-0000-0000-0000-000000000001" ? (
                    product.id === "e1000000-0000-0000-0000-000000000001" ? t("medicalGrade") : t("performance")
                  ) : t("classic")}
                </span>

                {product.stock_quantity <= product.low_stock_threshold && !isOutOfStock && (
                  <span className="bg-strain-red/10 border border-strain-red/30 text-strain-red text-[9px] font-mono px-2 py-0.5 rounded animate-pulse">
                    Only {product.stock_quantity} Left!
                  </span>
                )}
              </div>

              {/* Product Image */}
              <div className="mb-6 relative w-full h-48 flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-xl overflow-hidden border border-white/5 group-hover:border-whoop-green/20 transition-all select-none">
                <img
                  src={activeVariant?.image_url || product.whoop_product_images?.[0]?.image_url || "/images/whoop-placeholder.png"}
                  alt={product.name_en}
                  className="max-w-full max-h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white group-hover:text-whoop-green transition-colors">
                    {lang === "ar" ? product.name_ar : product.name_en}
                  </h3>
                  <p className="text-xs text-white/65 mt-1 line-clamp-2 leading-relaxed">
                    {lang === "ar" ? product.description_ar : product.description_en}
                  </p>
                </div>

                {/* Shopify-Style Variant Swatches on the card */}
                {product.whoop_product_variants && product.whoop_product_variants.length > 1 && (
                  <div className="space-y-1.5 py-1">
                    <span className="text-[9px] font-mono text-white/40 uppercase block">Available Colors:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.whoop_product_variants.map((v: any) => {
                        const isSelected = activeVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => {
                              setActiveVariants((prev) => ({ ...prev, [product.id]: v }));
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center p-0.5 border transition-all ${isSelected ? "border-whoop-green scale-110" : "border-white/10 opacity-70 hover:opacity-100"}`}
                            title={lang === "ar" ? v.name_ar : v.name_en}
                          >
                            <span
                              className="w-full h-full rounded-full border border-black/45"
                              style={{ backgroundColor: v.color_hex || '#555555' }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feature pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(lang === "ar" ? product.features_ar : product.features_en).slice(0, 3).map((f: string, i: number) => (
                    <span key={i} className="text-[10px] bg-white/5 border border-white/5 px-2.5 py-1 rounded text-white/60 font-mono">
                      {f}
                    </span>
                  ))}
                </div>

                {/* What's included */}
                {product.category_id === "c1000000-0000-0000-0000-000000000001" && (
                  <div className="text-[11px] text-white/50 space-y-0.5 border-t border-white/5 pt-3">
                    <div className="font-bold text-white/60">{t("includesText")}</div>
                    <div>• SuperKnit Luxe Band</div>
                    <div>• Wireless PowerPack Charger</div>
                  </div>
                )}

                {/* Price and CTAs */}
                <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                  <div>
                    <div className="text-[9px] font-mono text-white/40 uppercase">Price</div>
                    <div className="text-lg font-bold font-mono text-whoop-green">
                      {price.toLocaleString()} EGP
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick View Button */}
                    <button
                      onClick={() => {
                        setQuickViewProduct(product);
                        setQuickViewQty(1);
                        const initialVariant = activeVariant || product.whoop_product_variants?.[0] || null;
                        setSelectedVariant(initialVariant);
                        setSelectedImage(initialVariant?.image_url || product.whoop_product_images?.[0]?.image_url || null);
                      }}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all focus:outline-none"
                      title={t("quickView")}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Add to Cart button */}
                    <button
                      disabled={isOutOfStock}
                      onClick={() => handleAddToCart(product, activeVariant)}
                      className={`px-4 py-2.5 rounded-lg font-display text-xs uppercase tracking-wider font-bold transition-all focus:outline-none flex items-center gap-1.5 ${isOutOfStock ? "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed" : isAdded ? "bg-whoop-green text-black scale-95" : "bg-whoop-green hover:bg-whoop-green/90 text-black shadow-neon-green"}`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? t("outOfStock") : isAdded ? t("addedToCart") : t("addToCart")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK VIEW MODAL (SLIDE UP) */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4">
            {/* Modal backdrop click */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setQuickViewProduct(null)} />

            {/* Modal Box */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0.1 } : { type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-10 w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-t-3xl p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="space-y-1 pr-8">
                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-wider text-white">
                  {lang === "ar" ? quickViewProduct.name_ar : quickViewProduct.name_en}
                </h3>
                <div className="w-16 h-0.5 bg-whoop-green rounded-full" />
              </div>

              {/* Layout split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left pane: visual */}
                <div className="space-y-4">
                  <div className="relative w-full h-48 flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-xl overflow-hidden border border-white/5 select-none">
                    <img
                      src={selectedImage || "/images/whoop-placeholder.png"}
                      alt={quickViewProduct.name_en}
                      className="max-w-full max-h-full object-contain p-4"
                    />
                  </div>
                  
                  {/* Product Images Gallery (if images exist) */}
                  {quickViewProduct.whoop_product_images && quickViewProduct.whoop_product_images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/10 select-none">
                      {quickViewProduct.whoop_product_images.map((img: any, idx: number) => {
                        const isSelected = selectedImage === img.image_url;
                        return (
                          <button
                            key={img.id || idx}
                            onClick={() => setSelectedImage(img.image_url)}
                            className={`w-12 h-12 rounded-lg overflow-hidden border bg-neutral-900 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? "border-whoop-green scale-105" : "border-white/10 opacity-70 hover:opacity-100"}`}
                          >
                            <img src={img.image_url} alt="Product Gallery" className="max-w-full max-h-full object-contain p-1" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Variant Swatches (if variants exist) */}
                  {quickViewProduct.whoop_product_variants && quickViewProduct.whoop_product_variants.length > 1 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase">
                        {lang === "ar" ? "اختر اللون:" : "Select Color:"}
                      </span>
                      <div className="flex gap-2">
                        {quickViewProduct.whoop_product_variants.map((v: any) => {
                          const isSelected = selectedVariant?.id === v.id;
                          return (
                            <button
                              key={v.id}
                              onClick={() => {
                                setSelectedVariant(v);
                                if (v.image_url) {
                                  setSelectedImage(v.image_url);
                                }
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center p-0.5 border-2 transition-all ${isSelected ? "border-whoop-green scale-110" : "border-transparent opacity-60 hover:opacity-100"}`}
                              title={lang === "ar" ? v.name_ar : v.name_en}
                            >
                              <span
                                className="w-full h-full rounded-full border border-black/45"
                                style={{ backgroundColor: v.color_hex || '#555555' }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right pane: description, specs table, quantity, and cart */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-white/70 leading-relaxed">
                      {lang === "ar" ? quickViewProduct.description_ar : quickViewProduct.description_en}
                    </p>

                    {/* Specs Table */}
                    {quickViewProduct.specs && Object.keys(quickViewProduct.specs).length > 0 && (
                      <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                        <div className="bg-white/5 px-3 py-2 text-[10px] font-mono text-white/50 uppercase flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-whoop-green" />
                          <span>{t("specifications")}</span>
                        </div>
                        <div className="divide-y divide-white/5 text-[11px] font-mono px-3 py-1">
                          {Object.entries(quickViewProduct.specs).map(([key, val]: any) => (
                            <div key={key} className="py-1.5 flex justify-between">
                              <span className="text-white/40">{key}</span>
                              <span className="text-white/80">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity & Action Panel */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <div>
                        <span className="text-[9px] font-mono text-white/40 uppercase">Price</span>
                        <div className="text-xl font-bold font-mono text-whoop-green">
                          {((selectedVariant?.price_override || quickViewProduct.price) * quickViewQty).toLocaleString()} EGP
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg select-none">
                        <button
                          onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center">
                          {quickViewQty}
                        </span>
                        <button
                          onClick={() => setQuickViewQty((q) => Math.min(q + 1, selectedVariant?.stock_quantity || quickViewProduct.stock_quantity))}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart CTA */}
                    <button
                      onClick={handleQuickViewAdd}
                      className="w-full py-3 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold tracking-widest text-sm uppercase rounded-xl transition-all duration-300 shadow-neon-green flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t("addToCart")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
