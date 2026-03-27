import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import AboutHero from "./components/AboutHero";
import AboutImpact from "./components/AboutImpact";
import AboutValues from "./components/AboutValues";
import AboutTeam from "./components/AboutTeam";
import AboutCTA from "./components/AboutCTA";

function About() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AboutHero />
        <AboutImpact />
        <AboutValues />
        <AboutTeam />
        <AboutCTA />
      </motion.div>
    </Layout>
  );
}

export default About;

