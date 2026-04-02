import React from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const popularTags = [
  "SSO Configuration",
  "Bulk Student Import",
  "Gradebook Export",
  "Payment Gateway",
];

const HelpHero = ({ searchQuery, setSearchQuery }) => {
  return (
    <section className="relative bg-background-light dark:bg-navy-charcoal overflow-hidden transition-colors duration-300">
      {/* === Decorative Background (same as ContactHero) === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 dark:bg-premium-gold/8 rounded-full blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/5 dark:bg-premium-gold/5 rounded-full blur-[100px]"
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-primary/10 dark:bg-premium-gold/10 text-primary dark:text-premium-gold text-xs font-bold tracking-wider uppercase mb-6 border border-primary/20 dark:border-premium-gold/20 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-sm">help_center</span>
            Help Center
          </motion.span>

          {/* Headline with SVG underline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900 dark:text-white mb-6 font-lexend"
          >
            How can we help your{" "}
            <span className="text-primary dark:text-premium-gold relative inline-block">
              institution
              <motion.svg
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8 }}
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
            today?
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Search our guides, tutorials, and troubleshooting docs — or explore categories below to find the answer fast.
          </motion.p>

          {/* Search Bar */}
          <motion.div variants={itemVariants} className="relative max-w-2xl mx-auto group mb-8">
            <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-premium-gold transition-colors pointer-events-none">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search for guides, tutorials, or troubleshooting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 sm:h-16 pl-14 pr-6 rounded-2xl bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-base focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-premium-gold/30 focus:border-primary dark:focus:border-premium-gold shadow-sm hover:shadow-md dark:hover:border-premium-gold/30 transition-all duration-300"
            />
          </motion.div>

          {/* Popular tags */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Popular:
            </span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-4 py-1.5 rounded-full bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 text-xs font-semibold text-primary dark:text-premium-gold hover:bg-primary/5 dark:hover:bg-premium-gold/10 hover:border-primary/30 dark:hover:border-premium-gold/40 transition-all duration-200 shadow-sm"
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* Stats row — same style as ContactHero */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            {[
              { icon: "schedule", label: "Avg. Response", value: "~24 hrs" },
              { icon: "headset_mic", label: "Support Hours", value: "9AM – 6PM" },
              { icon: "forum", label: "WhatsApp Reply", value: "< 5 mins" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="flex items-center gap-3 bg-white dark:bg-transparent dark:dark-glass border border-slate-100 dark:border-white/10 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md dark:hover:border-premium-gold/30 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-primary dark:text-premium-gold text-xl">
                  {stat.icon}
                </span>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HelpHero;
