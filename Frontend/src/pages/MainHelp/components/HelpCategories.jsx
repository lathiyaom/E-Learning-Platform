import React from "react";
import { motion } from "framer-motion";
import { User, CreditCard, School, Settings } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const ICON_MAP = {
  user: User,
  creditCard: CreditCard,
  school: School,
  settings: Settings,
};

const COLOR_CLASSES = {
  blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20",
  emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
  amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20",
  purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20",
};

const HelpCategories = ({ categories }) => {
  if (categories.length === 0) return null;

  return (
    <section className="relative bg-white dark:bg-deep-charcoal py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-primary/10 dark:bg-premium-gold/10 text-primary dark:text-premium-gold text-xs font-bold tracking-wider uppercase mb-4 border border-primary/20 dark:border-premium-gold/20">
            <span className="material-symbols-outlined text-sm">category</span>
            Browse by Topic
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-lexend">
            What can we help you with?
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat, index) => {
            const Icon = ICON_MAP[cat.iconKey] || Settings;
            const colorClass = COLOR_CLASSES[cat.color] || COLOR_CLASSES.blue;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group bg-white dark:bg-transparent dark:dark-glass border border-slate-100 dark:border-white/10 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl dark:hover:shadow-black/40 hover:border-primary/20 dark:hover:border-premium-gold/30 transition-all duration-300 cursor-default"
              >
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 transition-all duration-300 ${colorClass}`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-premium-gold transition-colors font-lexend">
                  {cat.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HelpCategories;
