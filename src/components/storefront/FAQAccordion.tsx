"use client";

import React, { useState } from "react";
import { useWhoopStore } from "@/store/useStore";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  qEn: string;
  qAr: string;
  aEn: string;
  aAr: string;
}

export default function FAQAccordion() {
  const { t, lang } = useWhoopStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      qEn: "Is there an active subscription included with the device?",
      qAr: "هل الجهاز يشتمل على اشتراك مفعل؟",
      aEn: "Yes! Every device purchased from WHOOP DOWN includes an initial 1-Month Subscription out of the box. You can pair the device with your phone and start recording metrics immediately.",
      aAr: "نعم! كل جهاز تشتريه من ويب داون يشتمل على اشتراك مجاني لمدة شهر مفعل تلقائياً. تقدر تربطه بموبايلك وتسجل بياناتك فوراً.",
    },
    {
      qEn: "What is your return and exchange policy?",
      qAr: "ما هي سياسة الاسترجاع أو الاستبدال؟",
      aEn: "To guarantee hygiene and authenticity, every device is sold in 100% sealed, untouched box. If the factory seal is broken or the box is opened, the item CANNOT be returned or exchanged under any circumstances.",
      aAr: "لضمان أقصى درجات الأمان الطبي وجودة المنتج، جميع الأجهزة تأتي متبرشمة. في حالة فك البرشام أو فتح العلبة لا يمكن الاسترجاع أو الاستبدال نهائياً.",
    },
    {
      qEn: "How do I pay via InstaPay or Vodafone Cash?",
      qAr: "كيف يمكنني الدفع عبر انستاباي أو فودافون كاش؟",
      aEn: "During checkout, the system will display our verified InstaPay address and Vodafone Cash number. Simply transfer the exact total amount, take a screenshot of the transaction receipt, upload it, and complete the order. We will verify and dispatch within 24 hours.",
      aAr: "أثناء الدفع، هيظهرلك عنوان انستاباي ورقم فودافون كاش المعتمدين. حول المبلغ بالظبط، خد سكرين شوت للتحويل وارفعها على الموقع وأكد الطلب. بنراجع التحويل ونشحن في أقل من ٢٤ ساعة.",
    },
    {
      qEn: "Can I pick up my order in person?",
      qAr: "هل يمكنني الاستلام بنفسي من المحل؟",
      aEn: "Absolutely! You can select 'Store Pickup' at checkout (0 EGP fee) and collect your sealed box directly from our physical branch partners: Rich Phone, located inside Serag Mall, Nasr City, Cairo.",
      aAr: "بالتأكيد! يمكنك اختيار 'استلام من المتجر' عند الدفع (بدون مصاريف شحن) واستلام جهازك متبرشم مباشرة من فرع ريتش فون، داخل سراج مول، مدينة نصر، القاهرة.",
    },
    {
      qEn: "Are your WHOOP wearables 100% authentic?",
      qAr: "هل أجهزة الويب المعروضة أصلية ١٠٠٪؟",
      aEn: "Yes, all wearables, straps, and power packs are 100% authentic, imported directly, and come sealed in their original factory retail packaging.",
      aAr: "نعم، جميع الأجهزة والأستيك والشواحن أصلية ١٠٠٪ ومستوردة مباشرة من مصنعها وتأتي متبرشمة بالكامل ببرشام بلادها.",
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto space-y-12 select-none">
      
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-white">
          {t("faqTitle")}
        </h2>
        <div className="w-16 h-1 bg-whoop-green mx-auto rounded-full" />
      </div>

      {/* Accordion Rows */}
      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;

          return (
            <div
              key={i}
              className="glass-panel rounded-xl border border-white/10 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm font-semibold text-white/95 font-sans">
                  {lang === "ar" ? faq.qAr : faq.qEn}
                </span>
                <span className="p-1 rounded-lg bg-white/5 border border-white/5 text-whoop-green flex-shrink-0">
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-6 pt-2 text-xs text-white/70 leading-relaxed font-sans border-t border-white/5 bg-neutral-950/20">
                      {lang === "ar" ? faq.aAr : faq.aEn}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
