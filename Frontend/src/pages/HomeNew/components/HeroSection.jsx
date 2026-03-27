import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "../../../assets/imgs/hero-students.jpg";
import student1 from "../../../assets/imgs/student1.jpg";
import student2 from "../../../assets/imgs/student2.jpg";
import student3 from "../../../assets/imgs/student3.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const HeroSection = () => {
  return (
    <section className="relative bg-background-light dark:bg-navy-charcoal overflow-hidden transition-colors duration-300">
      {/* === Decorative Background === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Light mode blobs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 dark:bg-premium-gold/8 rounded-full blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent-gold/10 dark:bg-premium-gold/5 rounded-full blur-[100px]" 
        />
        {/* Dark mode dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-0 dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#ecb613 1px, transparent 1px)`,
            backgroundSize: "1.75rem 1.75rem",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-14 items-center"
        >
          {/* ── Left: Content ── */}
          <div className="z-10 order-2 lg:order-1">
            {/* Badge */}
            <motion.span 
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-primary/10 dark:bg-premium-gold/10 text-primary dark:text-premium-gold text-xs font-bold tracking-wider uppercase mb-6 border border-primary/20 dark:border-premium-gold/20 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-sm">
                auto_awesome
              </span>
              Transforming Lives
            </motion.span>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900 dark:text-white mb-6 font-lexend"
            >
              Unlock Your Potential with{" "}
              <span className="text-primary dark:text-premium-gold relative inline-block">
                World-Class
                <motion.svg
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
                  className="absolute -bottom-2 left-0"
                  height="6"
                  viewBox="0 0 200 6"
                  fill="none"
                >
                  <path
                    d="M0 3 Q50 0 100 3 Q150 6 200 3"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    className="text-primary dark:text-premium-gold"
                  />
                </motion.svg>
              </span>{" "}
              Education.
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={itemVariants}
              className="text-lg text-slate-600 dark:text-slate-400 mb-9 max-w-lg leading-relaxed"
            >
              Join over{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                50 million learners
              </span>{" "}
              and start your journey with expert-led courses in technology,
              business, arts, and more.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-4 mb-11"
            >
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-primary dark:bg-premium-gold text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/25 dark:shadow-premium-gold/20 hover:brightness-110 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-premium-gold/30 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-xl">
                  explore
                </span>
                Explore Courses
              </Link>
              <button className="inline-flex items-center gap-2 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-premium-gold/30 dark:hover:text-premium-gold transition-all duration-300">
                <span className="material-symbols-outlined text-xl">
                  business_center
                </span>
                For Business
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-3">
                {[
                  { src: student1, alt: "Student 1" },
                  { src: student2, alt: "Student 2" },
                  { src: student3, alt: "Student 3" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5, scale: 1, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-11 h-11 rounded-full border-2 border-white dark:border-navy-charcoal overflow-hidden ring-2 ring-primary/20 dark:ring-premium-gold/20 shadow-sm cursor-pointer"
                  >
                    <img
                      src={s.src}
                      alt={s.alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
                <div className="w-11 h-11 rounded-full border-2 border-white dark:border-navy-charcoal bg-primary dark:bg-premium-gold flex items-center justify-center text-slate-900 text-xs font-black shadow-sm">
                  50M+
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="material-symbols-outlined text-sm text-yellow-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">
                    4.8/5
                  </span>{" "}
                  from 2,000+ reviews
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: Hero Image ── */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.3 }}
            className="relative order-1 lg:order-2"
          >
            {/* Glow blobs */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/15 dark:bg-premium-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent-gold/15 dark:bg-premium-gold/8 rounded-full blur-3xl" />

            {/* Main image */}
            <motion.div 
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-300/50 dark:shadow-black/60 ring-1 ring-slate-200 dark:ring-white/10 group"
            >
              <img
                src={heroImage}
                alt="Group of diverse students studying together with laptops"
                className="w-full h-[420px] sm:h-[500px] object-cover object-center transition-transform duration-700"
              />
              {/* Overlay for dark mode polish */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent dark:from-navy-charcoal/40 pointer-events-none" />
            </motion.div>

            {/* Floating card: Active Learners */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="absolute top-8 -right-4 sm:-right-6 hidden sm:flex bg-white dark:backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 dark:shadow-black/40 dark:dark-glass cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-xl">
                    trending_up
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Active Learners
                  </p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    50,000,000+
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating card: Completion Rate */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="absolute -bottom-4 -left-4 sm:-left-6 hidden sm:flex bg-white dark:dark-glass p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 dark:shadow-black/40 cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-premium-gold/10 flex items-center justify-center text-primary dark:text-premium-gold">
                  <span className="material-symbols-outlined text-xl">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Completion Rate
                  </p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    94%
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

