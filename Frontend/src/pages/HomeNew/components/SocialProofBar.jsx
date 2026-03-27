import React from "react";
import { motion } from "framer-motion";

const partnersRow1 = ["GOOGLE", "META", "IBM", "STANFORD", "MICROSOFT", "AMAZON"];
const partnersRow2 = ["HARVARD", "NETFLIX", "ADOBE", "INTEL", "TESLA", "ORACLE"];

const MarqueeRow = ({ items, direction = "left", speed = 30 }) => {
  // Duplicating items for seamless looping
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div className="flex overflow-hidden py-4 select-none">
      <motion.div
        animate={{
          x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        className="flex flex-nowrap gap-12 md:gap-24 whitespace-nowrap"
      >
        {duplicatedItems.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="text-xl md:text-2xl font-black italic text-slate-400 dark:text-slate-500 hover:text-studprimary dark:hover:text-premium-gold transition-colors duration-300 cursor-default opacity-50 hover:opacity-100"
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const SocialProofBar = () => {
  return (
    <section className="relative border-y border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-deep-charcoal dark:backdrop-blur-xl py-12 lg:py-16 transition-colors duration-300 overflow-hidden">
      {/* Subtle fade-mask edges for premium feel */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-slate-50 via-transparent to-slate-50 dark:from-deep-charcoal dark:via-transparent dark:to-deep-charcoal opacity-100" />
      
      {/* Subtle dot-grid overlay in dark mode */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ecb613 1px, transparent 1px)`,
          backgroundSize: "1.5rem 1.5rem",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-10"
        >
          Trusted by 10,000+ companies and universities worldwide
        </motion.p>
        
        <div className="space-y-4">
          <MarqueeRow items={partnersRow1} direction="left" speed={35} />
          <MarqueeRow items={partnersRow2} direction="right" speed={40} />
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;

