import React, { useEffect } from "react";
import AdminLayout from "../../utils/Adminlayoute";
import { useDispatch, useSelector } from "react-redux";
import { getUpcomingEvents } from "../../redux/Apis/eventApi";
import { useGetUpcomingHolidaysQuery } from "../../redux/Apis/holidayApi";

function Schedule() {
  const dispatch = useDispatch();
  const { upcomingEvents, loading } = useSelector((state) => state.event);
  const { data: holidaysData, isLoading: holidayLoading } = useGetUpcomingHolidaysQuery();

  useEffect(() => {
    dispatch(getUpcomingEvents({ days: 30, page: 1, limit: 20 }));
  }, [dispatch]);

  const holidays = holidaysData?.data || [];

  return (
    <AdminLayout showSearch={false} className="p-0">
      <div className="p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Upcoming Schedule
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Events
            </h2>
            {loading && <p className="text-sm text-slate-500">Loading events...</p>}
            {!loading && upcomingEvents?.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming events.</p>
            )}
            <div className="space-y-3">
              {(upcomingEvents || []).map((event) => (
                <div
                  key={event._id}
                  className="rounded-xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {event.startDate
                      ? new Date(event.startDate).toLocaleString()
                      : event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "Date not set"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Holidays
            </h2>
            {holidayLoading && <p className="text-sm text-slate-500">Loading holidays...</p>}
            {!holidayLoading && holidays.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming holidays.</p>
            )}
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div
                  key={holiday._id}
                  className="rounded-xl p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {holiday.title || holiday.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {holiday.date ? new Date(holiday.date).toLocaleDateString() : "Date not set"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Schedule;
