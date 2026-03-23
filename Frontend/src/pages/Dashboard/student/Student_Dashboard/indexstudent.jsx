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
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming events.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event._id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateRange(event.start_date || event.eventDate || event.startDate, event.end_date || event.endDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Upcoming Holidays</h3>
          {holidays.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming holidays.</p>
          ) : (
            <div className="space-y-2">
              {holidays.map((holiday) => (
                <div key={holiday._id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{holiday.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateRange(holiday.date || holiday.startDate || holiday.start_date, holiday.endDate || holiday.end_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> */}
      <Instructures/>
    </AdminLayout>
  );
}

export default IndexStud;
