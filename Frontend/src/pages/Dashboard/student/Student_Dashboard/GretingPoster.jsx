import React from "react";
import { motion } from "framer-motion";
import HellowUserImg from "../../../../assets/imgs/HellowUser.png";
import { getAuth } from "../../../../utils/users";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

function GretingPoster() {
  const navigate = useNavigate();
  const user = getAuth().user;
  const userName = user?.firstName || "Guest";
  const completionPercentage = 85;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-gradient-to-br from-[#F3E8FF] via-[#EDE9FE] to-[#F3E8FF] dark:from-navy-charcoal dark:to-deep-charcoal rounded-2xl md:rounded-[2.5rem] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl dark:shadow-2xl border border-white/50 dark:border-white/5 transition-all duration-300"
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-10 w-64 h-64 bg-studprimary/10 dark:bg-premium-gold/10 rounded-full blur-3xl"></motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 dark:bg-premium-gold/5 rounded-full blur-3xl"></motion.div>

      <div className="relative z-10 text-center md:text-left md:flex-1">
        <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          Hello, {userName}! 👋
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400 max-w-md text-lg leading-relaxed mb-8">
          You've completed{" "}
          <span className="font-bold text-studprimary dark:text-premium-gold">
            {completionPercentage}%
          </span>{" "}
          of your weekly goal. Keep pushing to reach your target!
        </motion.p>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05, brightness: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/Mylearning")}
          className="bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-studprimary/20 dark:shadow-premium-gold/20 transition-all"
        >
          Resume Learning
        </motion.button>
      </div>

      <div className="mt-8 md:mt-0 relative w-full max-w-xs md:flex-1 flex justify-center">
        <motion.img
          initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 3 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          alt="Students learning"
          className="rounded-2xl shadow-2xl hover:shadow-3xl max-w-sm w-full h-auto object-cover transition-all border-4 border-white dark:border-white/10"
          src={HellowUserImg}
        />

        <motion.div
           variants={floatVariants}
           animate="animate"
          className="absolute -bottom-6 -left-6 bg-white dark:dark-glass p-4 rounded-2xl shadow-xl dark:shadow-premium-gold/10 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-white/10"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-premium-gold/20 rounded-xl flex items-center justify-center text-green-600 dark:text-premium-gold font-bold text-xl">
            📈
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">
              Daily Streak
            </p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">
              12 Days
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default GretingPoster;
