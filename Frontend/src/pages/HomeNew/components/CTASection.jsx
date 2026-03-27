import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="relative py-20 bg-slate-50 dark:bg-navy-charcoal transition-colors duration-300 overflow-hidden">
      {/* Outer section subtle blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-0 dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ecb613 1px, transparent 1px)`,
            backgroundSize: "2rem 2rem",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Card — always dark bg (like help's WhatsApp card) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative bg-gradient-to-br from-slate-900 to-[#1a1d2b] dark:from-navy-charcoal dark:to-deep-charcoal rounded-3xl overflow-hidden border border-white/5 dark:border-premium-gold/10 shadow-2xl dark:shadow-premium-gold/5"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-96 h-96 bg-primary/15 dark:bg-premium-gold/10 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-gold/10 dark:bg-premium-gold/5 rounded-full blur-[100px]" 
            />
            {/* Skewed accent bar */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-premium-gold/5 dark:bg-premium-gold/8 skew-x-12 translate-x-16" />
          </div>

          {/* Dot grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ecb613 1px, transparent 1px)",
              backgroundSize: "2rem 2rem",
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-10 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
            {/* Left Text */}
            <div className="lg:w-2/3">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-primary/15 dark:bg-premium-gold/15 text-primary dark:text-premium-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20 dark:border-premium-gold/20 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-sm">
                  rocket_launch
                </span>
                Start Today
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 font-lexend leading-tight"
              >
                Ready to transform{" "}
                <span className="text-primary dark:text-premium-gold">
                  your future?
                </span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-300 text-lg leading-relaxed max-w-xl"
              >
                Join{" "}
                <span className="font-bold text-primary dark:text-premium-gold">
                  85,000+ students
                </span>{" "}
                and start building the skills that define the industry. Your
                journey begins with a single click.
              </motion.p>

              {/* Bullet checks */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, staggerChildren: 0.1 }}
                className="mt-6 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3"
              >
                {[
                  "Free 7-day trial",
                  "Cancel anytime",
                  "Certificate included",
                ].map((b, idx) => (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    key={idx}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <span
                      className="material-symbols-outlined text-primary dark:text-premium-gold text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {b}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Right Buttons */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 w-full sm:w-auto lg:w-auto"
            >
              <Link
                to="/Sign-Up"
                className="inline-flex items-center justify-center gap-2 bg-primary dark:bg-premium-gold text-slate-900 font-extrabold px-10 py-4 rounded-xl hover:brightness-110 hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-premium-gold/30 hover:scale-105 transition-all duration-300 text-base whitespace-nowrap group"
              >
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">school</span>
                Apply to EduVerse
              </Link>

              <button className="inline-flex items-center justify-center gap-2 bg-white/8 dark:bg-white/5 text-white font-bold px-10 py-4 rounded-xl border border-white/15 dark:border-white/10 hover:bg-white/15 dark:hover:bg-premium-gold/10 dark:hover:border-premium-gold/30 dark:hover:text-premium-gold transition-all duration-300 text-base whitespace-nowrap hover:scale-105 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">support_agent</span>
                Speak with an Advisor
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

