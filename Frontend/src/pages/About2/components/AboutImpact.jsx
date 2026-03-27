import React from "react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: "groups",
    value: "5M+",
    label: "Learners Reached",
    colSpan: false,
    offset: false,
  },
  {
    icon: "public",
    value: "120+",
    label: "Countries Active",
    colSpan: false,
    offset: true,
  },
  {
    icon: "school",
    value: "500+",
    label: "Expert Educators",
    colSpan: true,
    offset: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const AboutImpact = () => {
  return (
    <section
      id="impact"
      className="relative py-24 bg-slate-50 dark:bg-deep-charcoal/50 transition-colors duration-300 overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-[400px] h-[400px] dark:bg-premium-gold/5 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -left-24 w-[350px] h-[350px] dark:bg-primary/4 rounded-full blur-[100px]" 
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Left: Copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-primary/10 dark:bg-premium-gold/10 text-primary dark:text-premium-gold text-xs font-bold tracking-wider uppercase mb-5 border border-primary/20 dark:border-premium-gold/20">
              <span className="material-symbols-outlined text-sm">
                bar_chart
              </span>
              By The Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-lexend text-slate-900 dark:text-white mb-6 leading-tight">
              Our{" "}
              <span className="text-primary dark:text-premium-gold">
                Global
              </span>{" "}
              Impact
            </h2>
            <motion.div 
               initial={{ width: 0 }}
               whileInView={{ width: 64 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.5 }}
               className="h-1.5 bg-primary dark:bg-premium-gold rounded-full mb-6" 
            />
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
              We&rsquo;ve spent years breaking down barriers. Our growth is a
              testament to the hunger for quality education that exists in every
              corner of the planet.
            </p>
          </motion.div>

          {/* ── Right: Stat Cards ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className={`group relative bg-white dark:bg-transparent dark:dark-glass rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm p-10 flex flex-col items-center justify-center text-center hover:shadow-xl dark:hover:border-premium-gold/20 transition-all duration-300 overflow-hidden ${
                    stat.colSpan
                      ? "sm:col-span-2 sm:mx-auto w-full"
                      : ""
                  } ${stat.offset ? "sm:translate-y-6" : ""}`}
                >
                  {/* Corner accent */}
                  <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 dark:bg-premium-gold/5 rounded-bl-[4rem] transition-transform group-hover:scale-150 duration-500" />
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary dark:bg-premium-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-b-3xl" />

                  <div className="w-20 h-20 rounded-2xl bg-primary/10 dark:bg-premium-gold/10 text-primary dark:text-premium-gold flex items-center justify-center mb-6 group-hover:bg-primary dark:group-hover:bg-premium-gold group-hover:text-slate-900 transition-all duration-300 shadow-sm">
                    <span className="material-symbols-outlined text-5xl">
                      {stat.icon}
                    </span>
                  </div>

                  <div className="text-5xl font-black mb-3 tracking-tighter text-slate-900 dark:text-white font-lexend group-hover:text-primary dark:group-hover:text-premium-gold transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.18em] text-xs">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutImpact;

