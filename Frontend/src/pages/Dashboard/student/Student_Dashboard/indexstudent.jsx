import React, { useEffect, useState } from "react";
import GretingPoster from "./GretingPoster";
import MyProgress from "./myProgress";
import RecommendedSection from "./recommended";
import ChartSection from "./chartsection";
import Instructures from "./instructures";
import QuickAccess from "./QuickAccess"; 
// import AdminLayout from './../../../../utils/Adminlayoute';
import AdminLayout from "../../../../utils/AdminlayouteNew";
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
      <GretingPoster />
      <QuickAccess />
      <MyProgress />
      <RecommendedSection/>
      <ChartSection/>
      <Instructures/>
    </AdminLayout>
  );
}

export default IndexStud;
