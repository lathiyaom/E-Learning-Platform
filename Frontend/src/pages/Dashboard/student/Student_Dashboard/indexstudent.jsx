import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GretingPoster from "./GretingPoster";
import MyProgress from "./myProgress";
import RecommendedSection from "./recommended";
import ChartSection from "./chartsection";
import Instructures from "./instructures";
import QuickAccess from "./QuickAccess"; 
// import AdminLayout from './../../../../utils/Adminlayoute';
// import AdminLayout from "../../../../utils/AdminlayouteNew";
import AdminLayout from "../../../../utils/Adminlayoute";
import { getBreadcrumbs } from "../../../../utils/breadcrumbs";
import { eventApi } from "../../../../api/eventApi";
import { holidayApi } from "../../../../api/holidayApi";

const formatDateRange = (startVal, endVal) => {
  if (!startVal) return "Date TBD";
  const startStr = new Date(startVal).toLocaleDateString();
  if (!endVal) return startStr;
  const endStr = new Date(endVal).toLocaleDateString();
  return (startStr === endStr || endStr === "Invalid Date") ? startStr : `${startStr} - ${endStr}`;
};

function IndexStud() {
  const breadcrumbItems = getBreadcrumbs("DASHBOARD");
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [eventRes, holidayRes] = await Promise.all([
          eventApi.getUpcomingEvents({ limit: 4 }),
          holidayApi.getUpcomingHolidays({ limit: 4 }),
        ]);
        setEvents(eventRes?.data?.data || []);
        setHolidays(holidayRes?.data?.data || []);
      } catch (error) {
        setEvents([]);
        setHolidays([]);
      }
    };

    loadMeta();
  }, []);

  return (
    <AdminLayout
      showSearch={false}
      className="p-0"
      breadcrumbItems={breadcrumbItems}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-12 md:gap-12 px-1 sm:px-2 lg:px-4 py-2 lg:py-2"
      >
        <GretingPoster />
        <QuickAccess />
        <MyProgress />
        <RecommendedSection />
        <ChartSection />
        <Instructures />
      </motion.div>
    </AdminLayout>
  );
}

export default IndexStud;
