import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../components/accordion";

const HelpFAQ = ({ faqs, searchQuery }) => {
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="relative bg-background-light dark:bg-navy-charcoal py-20 overflow-hidden transition-colors duration-300">
      {/* Subtle background blob */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 dark:bg-premium-gold/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="w-1 h-10 bg-primary dark:bg-premium-gold rounded-full shrink-0" />
          <div>
            <span className="text-xs font-bold text-primary dark:text-premium-gold uppercase tracking-widest block mb-1">
              Self-Service
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-lexend leading-tight">
              Frequently Asked Questions
            </h2>
          </div>
        </motion.div>

        {/* Empty state */}
        {filteredFaqs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-transparent dark:dark-glass rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm"
          >
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-4 block">
              search_off
            </span>
            <p className="text-slate-500 dark:text-slate-400 font-semibold">
              No results found for{" "}
              <span className="text-primary dark:text-premium-gold">"{searchQuery}"</span>
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Try different keywords or browse the categories above.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white dark:bg-transparent dark:dark-glass border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 dark:hover:border-premium-gold/20 transition-all duration-300 !border-b-0"
                >
                  <AccordionTrigger className="w-full px-6 py-5 text-left text-base font-bold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-premium-gold hover:no-underline transition-colors duration-200 [&[data-state=open]]:text-primary dark:[&[data-state=open]]:text-premium-gold **:data-[slot=accordion-trigger-icon]:text-slate-400 **:[data-state=open]:data-[slot=accordion-trigger-icon]:text-primary dark:**:[data-state=open]:data-[slot=accordion-trigger-icon]:text-premium-gold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                    <div className="pt-1 border-t border-slate-100 dark:border-white/5 mb-4" />
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HelpFAQ;
