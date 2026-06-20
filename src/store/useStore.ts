import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // product_id
  variantId?: string;
  nameEn: string;
  nameAr: string;
  variantNameEn?: string;
  variantNameAr?: string;
  price: number;
  quantity: number;
  imageUrl: string;
  maxStock: number;
}

export interface DiscountCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
}

export interface DeliveryZone {
  nameEn: string;
  nameAr: string;
  fee: number;
}

interface WhoopStore {
  lang: "en" | "ar";
  toggleLanguage: () => void;
  theme: "night" | "midnight";
  toggleTheme: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, qty: number, variantId?: string) => void;
  clearCart: () => void;
  discount: DiscountCode | null;
  applyDiscount: (discount: DiscountCode) => void;
  removeDiscount: () => void;
  deliveryZone: DeliveryZone | null;
  setDeliveryZone: (zone: DeliveryZone | null) => void;
  t: (key: string) => string;
}

// Complete Bilingual Dictionary
const translations: Record<string, { en: string; ar: string }> = {
  // Navigation
  home: { en: "Home", ar: "الرئيسية" },
  shop: { en: "Shop Collection", ar: "المتجر" },
  cart: { en: "Cart", ar: "السلة" },
  whatsapp: { en: "WhatsApp", ar: "واتساب" },
  admin: { en: "Admin", ar: "الأدمن" },
  storeLocation: { en: "Serag Mall Store", ar: "فرع السراج مول" },

  // Hero Section
  heroTitle: { en: "Unlock Your Ultimate Performance", ar: "أطلق العنان لأقصى درجات أدائك" },
  heroSubtitle: {
    en: "The world's most advanced fitness and health wearable—now available in Egypt. Track sleep, strain, and recovery with WHOOP 4.0 & the groundbreaking WHOOP 5.0.",
    ar: "جهاز تتبع الصحة واللياقة البدنية الأكثر تقدمًا في العالم - متوفر الآن في مصر. تتبع نومك وجهدك واستشفائك مع ويب 4.0 وويب 5.0 الجديد كلياً.",
  },
  shopNow: { en: "Shop the Collection", ar: "تسوق المجموعة" },
  visitStore: { en: "Visit Store at Serag Mall", ar: "زورونا في السراج مول" },
  unmute: { en: "Unmute Audio", ar: "تشغيل الصوت" },
  mute: { en: "Mute Audio", ar: "كتم الصوت" },

  // Devices & Accessories
  chooseWhoop: { en: "Choose Your WHOOP", ar: "اختر جهاز الويب الخاص بك" },
  subChooseWhoop: {
    en: "All devices come with a 1-Month Subscription included, so you can start tracking your data from day one.",
    ar: "جميع الأجهزة تأتي مع اشتراك مجاني لمدة شهر، لتتمكن من تتبع بياناتك من اليوم الأول.",
  },
  medicalGrade: { en: "MEDICAL GRADE", ar: "درجة طبية" },
  performance: { en: "PERFORMANCE", ar: "أداء رياضي" },
  classic: { en: "CLASSIC", ar: "كلاسيكي" },
  includesText: { en: "Includes:", ar: "يشمل:" },
  addToCart: { en: "Add to Cart", ar: "أضف إلى السلة" },
  addedToCart: { en: "Added ✅", ar: "تمت الإضافة ✅" },
  outOfStock: { en: "Out of Stock", ar: "نفذت الكمية" },
  notifyMe: { en: "Notify Me When Restocked", ar: "أبلغني عند التوفر" },
  quickView: { en: "Quick View", ar: "نظرة سريعة" },
  features: { en: "Key Features", ar: "الميزات الرئيسية" },
  specifications: { en: "Specifications", ar: "المواصفات" },

  // Customizer
  customizeRecovery: { en: "Customize Your Recovery", ar: "خصص أسلوب استشفائك" },
  strapsDesc: {
    en: "Built for 24/7 comfort, whether you're sleeping, swimming, or sprinting.",
    ar: "مصمم لتوفير الراحة على مدار الساعة، سواء كنت نائماً أو تسبح أو تجري سريعاً.",
  },
  batteryDesc: {
    en: "Never take your WHOOP off. Slide this waterproof power pack onto your device and charge on the go—even while you're in the shower.",
    ar: "لا تخلع ويب أبداً. اسحب هذا الشاحن اللاسلكي المقاوم للماء فوق جهازك واشحن أثناء التنقل - حتى تحت الدش.",
  },
  shopBands: { en: "Shop Accessory Bands", ar: "تسوق الأستيك الإضافي" },
  shopChargers: { en: "Shop Chargers", ar: "تسوق الشواحن" },
  onyxDesc: { en: "The sleek, goes-with-everything classic", ar: "اللون الأسود الأنيق الكلاسيكي المناسب لكل الأوقات" },
  arcticDesc: { en: "Crisp, clean, and ultra-sporty", ar: "اللون الأبيض الثلجي الرياضي الأنيق" },
  ivyDesc: { en: "A premium dark military olive", ar: "اللون الأخضر الزيتوني العسكري الفاخر" },
  heatherDesc: { en: "Modern and subtle for everyday wear", ar: "الرمادي العصري للمظهر اليومي المتميز" },

  // Widgets
  strainMeterTitle: { en: "Interactive Strain Meter", ar: "مقياس الجهد التفاعلي" },
  strainMeterDesc: {
    en: "Drag the slider to preview how the WHOOP app scores physical cardiovascular strain (from 0 to 21).",
    ar: "اسحب المؤشر لترى كيف يقيس تطبيق الويب الجهد البدني والقلبي (من 0 إلى 21).",
  },
  recoveryCalcTitle: { en: "Daily Recovery Calculator", ar: "حاسبة الاستشفاء اليومية" },
  recoveryCalcDesc: {
    en: "Calculate your simulated recovery percentage based on your sleep quality and exercise load.",
    ar: "احسب النسبة المئوية التقريبية للاستشفاء بناءً على جودة النوم وحجم المجهود البدني.",
  },
  sleepHours: { en: "Sleep Duration (Hours)", ar: "ساعات النوم" },
  workoutIntensity: { en: "Workout Intensity (1-10)", ar: "شدة التمرين (1-10)" },
  calcRecovery: { en: "Compute Recovery Score", ar: "احسب نتيجة الاستشفاء" },
  recoveryFeedback: { en: "Recovery Feedback", ar: "تقرير الاستشفاء اليومي" },

  // Comparison
  compareTitle: { en: "Compare WHOOP Models", ar: "قارن بين موديلات ويب" },
  highlightDiffs: { en: "Highlight Differences Only", ar: "إظهار الفروقات فقط" },

  // Logistics & Payments
  fastLogistics: { en: "Fast & Easy Logistics", ar: "خدمات التوصيل السريع والدفع" },
  deliveryZones: { en: "Delivery Zones (Flat Rate 250 EGP)", ar: "مناطق التوصيل (شحن موحد 250 ج.م)" },
  pickupNotice: {
    en: "Zones outside Cairo/Alexandria: Pickup available at Rich Phone, Serag Mall.",
    ar: "المناطق خارج القائمة: الاستلام متوفر من متجر ريتش فون بسراج مول.",
  },
  sealPolicyTitle: { en: "⚠️ STRICT SEAL POLICY (قاعدة هامة جداً)", ar: "⚠️ شروط الاسترجاع والاستبدال الهامة" },
  sealPolicyEN: {
    en: "Strict Return & Exchange Policy — To guarantee hygiene and authenticity, every customer receives a 100% brand-new, untouched device. All items are completely sealed. If the factory seal is broken or the box has been opened, the item CANNOT be returned or exchanged under any circumstances.",
    ar: "لضمان استلامك منتج جديد تماماً، جميع الأجهزة والملحقات تأتي متبرشمة. لو العلبة اتفتحت أو السيلد اتفك، مفيش ترجيع أو استبدال نهائياً.",
  },
  sealPolicyAgree: {
    en: "I understand and agree to the strict factory seal policy.",
    ar: "لقد قرأت وأوافق على شروط سياسة برشام المصنع والأمان الصحي.",
  },

  // Store Location
  visitUs: { en: "Visit Us In Person", ar: "تفضلوا بزيارتنا" },
  richPhoneMall: { en: "Rich Phone — Serag Mall", ar: "ريتش فون — السراج مول" },
  getDirections: { en: "Get Directions", ar: "احصل على الاتجاهات" },

  // Cart Drawer
  yourCart: { en: "Your Cart", ar: "عربة التسوق الخاصة بك" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  deliveryFee: { en: "Delivery Fee", ar: "مصاريف الشحن" },
  discountText: { en: "Discount Applied", ar: "الخصم المطبق" },
  totalText: { en: "Total Amount", ar: "المبلغ الإجمالي" },
  checkoutBtn: { en: "Proceed to Checkout", ar: "الذهاب للدفع" },
  emptyCart: { en: "Your cart is empty", ar: "حقيبة التسوق فارغة حالياً" },
  remove: { en: "Remove", ar: "حذف" },

  // Checkout Form
  customerInfo: { en: "1. Customer Information", ar: "١. بيانات العميل" },
  paymentMethod: { en: "2. Payment Method", ar: "٢. طريقة الدفع" },
  orderReview: { en: "3. Review Order & Place", ar: "٣. مراجعة الطلب وتأكيده" },
  fullname: { en: "Full Name", ar: "الاسم بالكامل" },
  phoneLabel: { en: "Phone Number", ar: "رقم الموبايل" },
  addressLabel: { en: "Full Address", ar: "العنوان بالتفصيل" },
  selectZone: { en: "Select Delivery Zone / Pickup", ar: "اختر منطقة التوصيل / الاستلام" },
  pickupOption: { en: "Store Pickup (Rich Phone, Serag Mall) - 0 EGP", ar: "استلام من المحل (ريتش فون، السراج مول) - 0 ج.م" },
  instapayInstructions: {
    en: "Send your payment to our InstaPay address. Take a screenshot of the transfer and upload it below.",
    ar: "قم بالتحويل إلى عنوان انستاباي الخاص بنا. التقط لقطة شاشة للتحويل وقم برفعها أدناه.",
  },
  vodafoneInstructions: {
    en: "Send payment to Vodafone Cash. Take a screenshot of the transfer and upload it below.",
    ar: "قم بتحويل المبلغ إلى رقم فودافون كاش. التقط لقطة شاشة للتحويل وقم برفعها أدناه.",
  },
  uploadProof: { en: "Upload Transfer Screenshot (Required)", ar: "رفع لقطة شاشة لإثبات التحويل (مطلوب)" },
  promoCode: { en: "Promo Code", ar: "كود الخصم" },
  applyBtn: { en: "Apply", ar: "تطبيق" },
  placeOrder: { en: "Place Order", ar: "تأكيد الطلب وإرساله" },

  // Order Success
  orderSuccessTitle: { en: "Order Placed Successfully! 🎉", ar: "تم تسجيل طلبك بنجاح! 🎉" },
  orderSuccessDesc: {
    en: "Thank you for shopping with WHOOP DOWN. Your order has been placed in 'Pending' status. We will verify your transfer screenshot and contact you via phone shortly.",
    ar: "نشكرك على التسوق من ويب داون. طلبك الآن قيد المراجعة. سنتحقق من لقطة شاشة التحويل ونتواصل معك عبر الهاتف قريباً.",
  },
  orderIdText: { en: "Order Reference ID:", ar: "رقم مرجع الطلب:" },
  sharePurchase: { en: "Share Purchase on WhatsApp", ar: "مشاركة الشراء عبر واتساب" },
  trackBtn: { en: "Track Order Status", ar: "تتبع حالة الطلب" },

  // FAQ
  faqTitle: { en: "Frequently Asked Questions", ar: "الأسئلة الشائعة" },
};

export const useWhoopStore = create<WhoopStore>()(
  persist(
    (set, get) => ({
      lang: "en",
      toggleLanguage: () =>
        set((state) => {
          const nextLang = state.lang === "en" ? "ar" : "en";
          // Update html tag dir for RTL/LTR
          if (typeof document !== "undefined") {
            document.documentElement.setAttribute("dir", nextLang === "ar" ? "rtl" : "ltr");
            document.documentElement.setAttribute("lang", nextLang);
          }
          return { lang: nextLang };
        }),
      theme: "night",
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "night" ? "midnight" : "night" })),
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (i) => i.id === item.id && i.variantId === item.variantId
          );
          if (existing) {
            const newQty = Math.min(existing.quantity + item.quantity, item.maxStock);
            return {
              cart: state.cart.map((i) =>
                i.id === item.id && i.variantId === item.variantId
                  ? { ...i, quantity: newQty }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),
      removeFromCart: (id, variantId) =>
        set((state) => ({
          cart: state.cart.filter((i) => !(i.id === id && i.variantId === variantId)),
        })),
      updateQuantity: (id, qty, variantId) =>
        set((state) => {
          const item = state.cart.find((i) => i.id === id && i.variantId === variantId);
          if (!item) return {};
          const finalQty = Math.max(1, Math.min(qty, item.maxStock));
          return {
            cart: state.cart.map((i) =>
              i.id === id && i.variantId === variantId ? { ...i, quantity: finalQty } : i
            ),
          };
        }),
      clearCart: () => set({ cart: [], discount: null }),
      discount: null,
      applyDiscount: (discount) => set({ discount }),
      removeDiscount: () => set({ discount: null }),
      deliveryZone: null,
      setDeliveryZone: (deliveryZone) => set({ deliveryZone }),
      t: (key) => {
        const item = translations[key];
        if (!item) return key;
        return item[get().lang] || key;
      },
    }),
    {
      name: "whoop-store-state",
      partialize: (state) => ({
        lang: state.lang,
        theme: state.theme,
        cart: state.cart,
        discount: state.discount,
        deliveryZone: state.deliveryZone,
      }),
    }
  )
);
