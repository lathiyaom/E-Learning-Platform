import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, ArrowRight } from "lucide-react";
import { Button } from "../../../components/Button";

const posterUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDdEG7uDmJv9xNGmGBf4zbjM3QHkuIpiNzKr-i8Fa82VnNeWxpuTIuuUWXu0RGgzkwv7r7njj0M_cJ1rbID5VXkwK7AAz2KFGl0X79TqVquIkVd7Wn4U17ksD18V7aHiIdCDcvoZRGWeP4GvGv9wden6ZO-30nXadUaf6K8RzfDHgpJM7r6h9qd5Rz3J02NhHwYS_J_XqQ7vepvnRK0nJOHS2yyCaxeEy-DHghYiQyYpUx8RFqmuDYWY8WJ3ldb4tZinRUDEBLGhw";

const HelpContactBanner = () => {
  return (
    <section className="bg-white dark:bg-deep-charcoal py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl min-h-[420px] flex items-center"
          style={{ background: "linear-gradient(135deg, #1e2030 0%, #0f1117 100%)" }}
        >
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <img
              src={posterUrl}
              alt="Support Portal"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/40" />
          </div>

          {/* Decorative gold glow */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-premium-gold/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 w-full px-8 sm:px-14 py-14 lg:py-20">
            <div className="max-w-2xl space-y-8">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-premium-gold/15 text-premium-gold text-xs font-bold tracking-wider uppercase border border-premium-gold/30">
                <span className="material-symbols-outlined text-sm">support_agent</span>
                24/7 Support
              </span>

              {/* Headline with animated SVG underline */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] font-lexend">
                Still need{" "}
                <span className="text-premium-gold relative inline-block">
                  assistance?
                  <motion.svg
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
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
                      className="text-premium-gold"
                    />
                  </motion.svg>
                </span>
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                Our dedicated support team is available{" "}
                <span className="text-white font-semibold">24/7</span> for Enterprise partners and
                during business hours for standard members.
              </p>

              {/* CTA Buttons using shared Button component */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="inline-flex items-center gap-2.5 bg-premium-gold text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-premium-gold/20 hover:brightness-110 hover:bg-premium-gold/90 hover:shadow-xl hover:shadow-premium-gold/10 hover:scale-105 transition-all duration-500 group h-auto  "
                  onClick={() => window.open("https://wa.me/yourwhatsappnumber", "_blank")}
                >
                  <MessageCircle size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  Instant WhatsApp Support
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="inline-flex items-center gap-2.5 border-2 border-white/20 bg-transparent text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white/40 hover:text-white transition-all duration-300 group h-auto"
                  onClick={() => window.location.href = "mailto:support@eduverse.com"}
                >
                  <Mail size={20} className="group-hover:scale-110 transition-transform duration-300" />
                  Email Support
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative rotating ring */}
          <div className="absolute bottom-0 right-0 overflow-hidden opacity-10 pointer-events-none hidden lg:block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="w-[500px] h-[500px] translate-x-1/4 translate-y-1/4 border-[50px] border-white/20 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HelpContactBanner;
