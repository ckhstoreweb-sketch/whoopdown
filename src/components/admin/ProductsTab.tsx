"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [featuresEn, setFeaturesEn] = useState<string[]>([]);
  const [featuresAr, setFeaturesAr] = useState<string[]>([]);
  
  // Custom Dynamic Tag inputs
  const [newTagEn, setNewTagEn] = useState("");
  const [newTagAr, setNewTagAr] = useState("");

  // Variants builder array
  const [variants, setVariants] = useState<any[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // Product gallery images array
  const [productImages, setProductImages] = useState<any[]>([]);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  // Undo Toast state
  const [deletedProductBackup, setDeletedProductBackup] = useState<any | null>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadProducts = async () => {
    // Categories
    const { data: cats } = await supabase.from("whoop_categories").select("*");
    if (cats) setCategories(cats);

    // Products
    const { data: prods } = await supabase
      .from("whoop_products")
      .select(`
        *,
        whoop_product_variants (*)
      `)
      .order("created_at", { ascending: false });
    
    if (prods) setProducts(prods);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddForm = () => {
    setEditingProduct(null);
    setNameEn("");
    setNameAr("");
    setDescEn("");
    setDescAr("");
    setCategoryId(categories[0]?.id || "");
    setPrice(0);
    setStock(0);
    setThreshold(5);
    setIsFeatured(false);
    setIsActive(true);
    setFeaturesEn([]);
    setFeaturesAr([]);
    setVariants([]);
    setProductImages([]);
    setIsFormOpen(true);
  };

  const openEditForm = async (prod: any) => {
    setEditingProduct(prod);
    setNameEn(prod.name_en);
    setNameAr(prod.name_ar);
    setDescEn(prod.description_en);
    setDescAr(prod.description_ar);
    setCategoryId(prod.category_id || "");
    setPrice(prod.price);
    setStock(prod.stock_quantity);
    setThreshold(prod.low_stock_threshold);
    setIsFeatured(prod.is_featured);
    setIsActive(prod.is_active);
    setFeaturesEn(prod.features_en || []);
    setFeaturesAr(prod.features_ar || []);
    setVariants(prod.whoop_product_variants || []);
    
    // Fetch product images gallery
    const { data: prodImgs } = await supabase
      .from("whoop_product_images")
      .select("*")
      .eq("product_id", prod.id)
      .order("display_order", { ascending: true });
    
    setProductImages(prodImgs || []);
    setIsFormOpen(true);
  };

  // Add Dynamic Feature tags
  const handleAddTag = () => {
    if (newTagEn && newTagAr) {
      setFeaturesEn([...featuresEn, newTagEn.trim()]);
      setFeaturesAr([...featuresAr, newTagAr.trim()]);
      setNewTagEn("");
      setNewTagAr("");
    }
  };

  const handleRemoveTag = (idx: number) => {
    setFeaturesEn(featuresEn.filter((_, i) => i !== idx));
    setFeaturesAr(featuresAr.filter((_, i) => i !== idx));
  };

  // Add Variant item
  const handleAddVariantRow = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        name_en: "",
        name_ar: "",
        color_hex: "#1A1A1A",
        image_url: "",
        stock_quantity: 10,
        sku: `WP-${Date.now().toString().slice(-4)}`,
        price_override: null
      }
    ]);
  };

  const handleUpdateVariantField = (idx: number, field: string, value: any) => {
    setVariants(
      variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const handleUploadImage = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(idx);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
      const filePath = `variants/${fileName}`;

      const { data, error } = await supabase.storage
        .from("whoop-images")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("whoop-images")
        .getPublicUrl(filePath);

      handleUpdateVariantField(idx, "image_url", publicUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleRemoveVariantRow = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingProductImage(true);

    try {
      const newImages = [...productImages];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
          .from("whoop-images")
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("whoop-images")
          .getPublicUrl(filePath);

        newImages.push({
          id: `temp-${Date.now()}-${Math.random()}`,
          image_url: publicUrl
        });
      }
      setProductImages(newImages);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image(s). Please try again.");
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleRemoveProductImage = (idx: number) => {
    setProductImages(productImages.filter((_, i) => i !== idx));
  };

  // Save Product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descEn,
      description_ar: descAr,
      category_id: categoryId,
      price: price,
      stock_quantity: stock,
      low_stock_threshold: threshold,
      is_featured: isFeatured,
      is_active: isActive,
      features_en: featuresEn,
      features_ar: featuresAr
    };

    try {
      let savedProd = null;

      if (editingProduct) {
        // Update
        const { data, error } = await supabase
          .from("whoop_products")
          .update(payload)
          .eq("id", editingProduct.id)
          .select()
          .single();

        if (error) throw error;
        savedProd = data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("whoop_products")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        savedProd = data;
      }

      // Sync Variants & Product Gallery Images
      if (savedProd) {
        // Delete old variants
        if (editingProduct) {
          await supabase.from("whoop_product_variants").delete().eq("product_id", savedProd.id);
        }

        // Insert fresh variants list
        for (const v of variants) {
          await supabase.from("whoop_product_variants").insert({
            product_id: savedProd.id,
            name_en: v.name_en,
            name_ar: v.name_ar,
            stock_quantity: v.stock_quantity,
            sku: v.sku,
            price_override: v.price_override || null,
            image_url: v.image_url || null,
            color_hex: v.color_hex || null
          });
        }

        // Delete and sync product gallery images
        await supabase.from("whoop_product_images").delete().eq("product_id", savedProd.id);
        for (let i = 0; i < productImages.length; i++) {
          const img = productImages[i];
          await supabase.from("whoop_product_images").insert({
            product_id: savedProd.id,
            image_url: img.image_url,
            display_order: i
          });
        }
      }

      setIsFormOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    }
  };

  // Delete product with 5s Undo timer
  const handleDeleteProduct = async (product: any) => {
    if (undoTimer) {
      clearTimeout(undoTimer);
    }

    setDeletedProductBackup(product);
    setToastMessage(`Deleted product '${product.name_en}' 🗑️`);

    // Hide product locally first
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    const timer = window.setTimeout(async () => {
      // Execute database delete once 5s expires
      const { error } = await supabase.from("whoop_products").delete().eq("id", product.id);
      if (error) {
        console.error("Delete failed: ", error);
      }
      setDeletedProductBackup(null);
      setToastMessage("");
    }, 5000);

    setUndoTimer(timer);
  };

  const handleUndoDelete = () => {
    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);
    }
    if (deletedProductBackup) {
      // Restore locally
      setProducts((prev) => [deletedProductBackup, ...prev]);
      setDeletedProductBackup(null);
      setToastMessage("Deletion cancelled (Product Restored) ✅");
      setTimeout(() => setToastMessage(""), 2000);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans relative">
      
      {/* Undo Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-neutral-950 border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-neon-green"
          >
            <span className="text-xs text-white">{toastMessage}</span>
            {deletedProductBackup && (
              <button
                onClick={handleUndoDelete}
                className="bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase px-3 py-1.5 rounded-lg"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display uppercase tracking-wider text-white">Catalog Manager</h2>
        
        <button
          onClick={openAddForm}
          className="bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-neon-green flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const defaultVariant = product.whoop_product_variants?.[0];
          const price = defaultVariant?.price_override || product.price;
          
          const isLow = product.stock_quantity <= product.low_stock_threshold;
          const isOut = product.stock_quantity === 0;

          return (
            <div
              key={product.id}
              className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-[9px] font-mono text-white/50 uppercase">
                  {categories.find(c => c.id === product.category_id)?.name_en || "General"}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOut ? "bg-strain-red" : isLow ? "bg-yellow-400" : "bg-whoop-green"}`} />
                  <span className="text-[10px] font-mono text-white/60">Stock: {product.stock_quantity}</span>
                </div>
              </div>

              {/* Title & Price */}
              <div className="my-4 space-y-1">
                <h4 className="text-base font-display text-white uppercase tracking-wider line-clamp-1">
                  {product.name_en}
                </h4>
                <div className="text-sm font-bold font-mono text-whoop-green">{price.toLocaleString()} EGP</div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-white/5 pt-3 flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  {product.is_active ? (
                    <Eye className="w-3.5 h-3.5 text-whoop-green" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-white/30" />
                  )}
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {product.is_active ? "Active" : "Hidden"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(product)}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="p-1.5 rounded bg-strain-red/10 hover:bg-strain-red text-strain-red hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* FORM MODAL FORM (SLIDE UP) & LIVE SPLIT PREVIEW */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-sm">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsFormOpen(false)} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative z-10 w-full max-w-4xl bg-neutral-950 border-l border-white/10 h-full flex flex-col justify-between"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-display uppercase tracking-wider text-white">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Split Body */}
              <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Form fields pane */}
                <form onSubmit={handleSave} className="space-y-4 font-sans text-xs">
                  {/* Name EN */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Product Name (EN)</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-3 py-2.5 rounded-xl outline-none text-white"
                      required
                    />
                  </div>

                  {/* Name AR */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Product Name (AR)</label>
                    <input
                      type="text"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-3 py-2.5 rounded-xl outline-none text-white text-right"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 text-xs px-3 py-2.5 rounded-xl outline-none text-white"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/40 uppercase block">Base Price (EGP)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-3 py-2.5 rounded-xl outline-none text-white font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/40 uppercase block">Total Stock</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-3 py-2.5 rounded-xl outline-none text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Threshold */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-3 py-2.5 rounded-xl outline-none text-white font-mono"
                    />
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Description (EN)</label>
                    <textarea
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-3 py-2.5 rounded-xl outline-none text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Description (AR)</label>
                    <textarea
                      value={descAr}
                      onChange={(e) => setDescAr(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 focus:border-whoop-green/40 text-xs px-3 py-2.5 rounded-xl outline-none text-white text-right"
                      required
                    />
                  </div>

                  {/* Featured & Active switches */}
                  <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="accent-whoop-green w-4 h-4"
                      />
                      <span>Featured Product</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="accent-whoop-green w-4 h-4"
                      />
                      <span>Active Visibility</span>
                    </label>
                  </div>

                  {/* Product Photos Gallery */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <span className="text-[10px] font-mono text-white/40 uppercase block text-left">Product Gallery Photos</span>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {productImages.map((img, idx) => (
                        <div key={img.id || idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40 group flex items-center justify-center">
                          <img src={img.image_url} alt="Product Gallery" className="max-w-full max-h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-strain-red text-[10px] font-bold font-mono uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload Button Box */}
                      <label className="border border-dashed border-white/20 hover:border-whoop-green/45 bg-white/5 hover:bg-white/10 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all gap-1 text-center select-none">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleUploadProductImage}
                          disabled={uploadingProductImage}
                        />
                        {uploadingProductImage ? (
                          <span className="text-[9px] font-mono text-white/40 animate-pulse">Uploading...</span>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 text-white/40" />
                            <span className="text-[9px] font-mono uppercase text-white/40 font-bold">Add Photo</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Feature Tags Builder */}
                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Add Feature Pills</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tag (EN)"
                        value={newTagEn}
                        onChange={(e) => setNewTagEn(e.target.value)}
                        className="w-1/2 bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg outline-none text-white"
                      />
                      <input
                        type="text"
                        placeholder="Tag (AR)"
                        value={newTagAr}
                        onChange={(e) => setNewTagAr(e.target.value)}
                        className="w-1/2 bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg outline-none text-white text-right"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 bg-white/10 hover:bg-whoop-green hover:text-black rounded-lg transition-colors font-mono text-xs uppercase font-bold"
                      >
                        Add
                      </button>
                    </div>
                    {/* Tags List */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {featuresEn.map((tag, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 px-2.5 py-1 rounded flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-white/70">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(idx)}
                            className="text-strain-red text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variants Builder row */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-white/40 uppercase">Color Swatches / Variants Builder</span>
                      <button
                        type="button"
                        onClick={handleAddVariantRow}
                        className="text-whoop-green hover:underline text-xs uppercase font-mono tracking-wider font-bold"
                      >
                        + Add Variant
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {variants.map((v, i) => (
                        <div key={v.id || i} className="bg-neutral-900 border border-white/10 p-4 rounded-xl space-y-3 relative text-left">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-xs font-mono font-bold text-white/80">Variant #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(i)}
                              className="text-strain-red text-xs hover:underline uppercase font-bold"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {/* Color EN */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-white/40 uppercase block text-left">Color Name (EN)</label>
                              <input
                                type="text"
                                placeholder="e.g. Onyx Black"
                                value={v.name_en || ""}
                                onChange={(e) => handleUpdateVariantField(i, "name_en", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg text-white"
                                required
                              />
                            </div>
                            
                            {/* Color AR */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-white/40 uppercase block text-left font-sans">Color Name (AR)</label>
                              <input
                                type="text"
                                placeholder="e.g. أسود"
                                value={v.name_ar || ""}
                                onChange={(e) => handleUpdateVariantField(i, "name_ar", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg text-white text-right"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Color Hex */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-white/40 uppercase block text-left">Color Hex (e.g. #000000)</label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  placeholder="#1A1A1A"
                                  value={v.color_hex || ""}
                                  onChange={(e) => handleUpdateVariantField(i, "color_hex", e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg text-white font-mono"
                                  required
                                />
                                <input
                                  type="color"
                                  value={v.color_hex && v.color_hex.startsWith("#") ? v.color_hex : "#000000"}
                                  onChange={(e) => handleUpdateVariantField(i, "color_hex", e.target.value)}
                                  className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                                />
                              </div>
                            </div>
                                                    {/* Image Upload */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-white/40 uppercase block text-left font-sans">Variant Photo</label>
                              <div className="flex items-center gap-3">
                                {v.image_url ? (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex-shrink-0 flex items-center justify-center">
                                    <img src={v.image_url} alt="Variant Preview" className="max-w-full max-h-full object-contain" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg border border-dashed border-white/20 bg-white/5 flex-shrink-0 flex items-center justify-center text-[9px] font-mono text-white/30 text-center">
                                    No Pic
                                  </div>
                                )}
                                
                                <div className="flex-1">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    id={`file-upload-${i}`}
                                    className="hidden"
                                    onChange={(e) => handleUploadImage(i, e)}
                                    disabled={uploadingIdx === i}
                                  />
                                  <label
                                    htmlFor={`file-upload-${i}`}
                                    className={`px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono uppercase font-bold cursor-pointer block text-center transition-all ${uploadingIdx === i ? "opacity-55 cursor-not-allowed" : ""}`}
                                  >
                                    {uploadingIdx === i ? "Uploading..." : v.image_url ? "Change Photo" : "Upload Photo"}
                                  </label>
                                </div>
                              </div>
                            </div>      </div>

                          <div className="grid grid-cols-3 gap-2">
                            {/* Stock Qty */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-white/40 uppercase block text-left">Stock Qty</label>
                              <input
                                type="number"
                                placeholder="10"
                                value={v.stock_quantity || 0}
                                onChange={(e) => handleUpdateVariantField(i, "stock_quantity", parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg text-white font-mono"
                                required
                              />
                            </div>
                            
                            {/* Price Override */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-white/40 uppercase block text-left">Price Override</label>
                              <input
                                type="number"
                                placeholder="Optional"
                                value={v.price_override || ""}
                                onChange={(e) => handleUpdateVariantField(i, "price_override", parseFloat(e.target.value) || null)}
                                className="w-full bg-white/5 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg text-white font-mono"
                              />
                            </div>

                            {/* SKU */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-white/40 uppercase block text-left font-sans">SKU</label>
                              <input
                                type="text"
                                placeholder="SKU"
                                value={v.sku || ""}
                                onChange={(e) => handleUpdateVariantField(i, "sku", e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </form>

                {/* Split live preview card */}
                <div className="glass-panel border-white/10 rounded-2xl p-6 sticky top-0 space-y-4">
                  <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Live Storefront Card Preview</h4>
                  
                  {/* Mimic storefront product card */}
                  <div className="border border-white/10 bg-neutral-900/60 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="bg-white/5 border border-white/10 text-[9px] font-mono text-white/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        PREVIEW BADGE
                      </span>
                      {stock <= threshold && (
                        <span className="bg-strain-red/10 border border-strain-red/30 text-strain-red text-[9px] font-mono px-2 py-0.5 rounded">
                          Only {stock} Left!
                        </span>
                      )}
                    </div>

                    {/* Live preview image */}
                    <div className="w-full h-32 bg-black/40 rounded flex items-center justify-center overflow-hidden border border-white/5">
                      {variants[0]?.image_url || productImages[0]?.image_url ? (
                        <img
                          src={variants[0]?.image_url || productImages[0]?.image_url}
                          alt="Live Preview"
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">No Image Uploaded</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-display uppercase tracking-wider text-white">
                        {nameEn || "Product Title (English)"}
                      </h4>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {descEn || "Your product's sales copy details will print here in a tidy, responsive clamp window."}
                      </p>
                    </div>

                    {/* Tags preview */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {featuresEn.length > 0 ? (
                        featuresEn.map((tag, idx) => (
                          <span key={idx} className="bg-white/5 border border-white/5 text-[9px] font-mono text-white/45 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] font-mono text-white/20 italic">No feature tags added yet.</span>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-3 flex justify-between items-center mt-3">
                      <div>
                        <div className="text-[8px] font-mono text-white/40 uppercase">Price</div>
                        <div className="text-base font-bold font-mono text-whoop-green">{price.toLocaleString()} EGP</div>
                      </div>

                      <button
                        type="button"
                        className="px-4 py-2 bg-whoop-green text-black font-display font-bold text-xs uppercase rounded-lg shadow-neon-green"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Actions bar */}
              <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-neutral-950/80">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-mono text-xs uppercase rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-2.5 bg-whoop-green hover:bg-whoop-green/90 text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-neon-green"
                >
                  Save Product Changes
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
