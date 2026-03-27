import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import posterImg from "../../../../assets/imgs/course-poster.jpg";

function CoursePoster() {
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-navy-charcoal rounded-[32px] p-8 md:p-12 lg:p-16 mb-10 overflow-hidden min-h-[400px] flex items-center shadow-2xl border border-white/5"
    >
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          alt="Students collaborating"
          className="w-full h-full object-cover blur-[2px]"
          src={posterImg}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-studprimary/90 backdrop-blur-xl text-white text-[10px] font-black tracking-widest uppercase rounded-full mb-6 border border-white/20 shadow-xl shadow-studprimary/20">
            <Sparkles size={12} />
            TRENDING NOW
          </span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]"
        >
          Master AI & Machine Learning with Experts
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-slate-300 text-base md:text-lg lg:text-xl mb-10 leading-relaxed max-w-xl opacity-90"
        >
          Unlock the power of artificial intelligence. Join over 50,000+
          students in our most popular career path this month.
        </motion.p>

        <motion.button 
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="group bg-studprimary hover:bg-[#c79743] text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-xl shadow-studprimary/30 text-lg flex items-center gap-3"
        >
          Explore Path
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.section>
  );
}

export default CoursePoster;
