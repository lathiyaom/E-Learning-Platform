import { useMemo } from "react";
import { PerformanceLineChart } from "./ChartComponents";
import {
  MessageCircle,
  RefreshCcw,
  Trophy,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";
import { useGetUpcomingHolidaysQuery } from "../../../../redux/Apis/holidayApi";
import { useDispatch, useSelector } from "react-redux";
import { getUpcomingEvents } from "../../../../redux/Apis/eventApi";
import { useEffect } from "react";

const ChartSection = () => {
  const dispatch = useDispatch();
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery();
  const { data: holidaysData } = useGetUpcomingHolidaysQuery();
  const { upcomingEvents } = useSelector((state) => state.event);
  const enrollments = enrollmentsData?.data || [];

  useEffect(() => {
    dispatch(getUpcomingEvents({ days: 30, page: 1, limit: 6 }));
  }, [dispatch]);

  const performanceChartData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return {
        month: date.toLocaleString("default", { month: "short" }),
      };
    });

    const totalEnrollments = enrollments.length || 1;
    const avgProgress =
      enrollments.reduce((sum, e) => sum + Number(e.progressPercent || e.progress || 0), 0) /
      totalEnrollments;
    const completed = enrollments.filter(
      (e) => Number(e.progressPercent || e.progress || 0) >= 100,
    ).length;

    return months.map((m, index) => {
      const growth = Math.min(100, Math.round((avgProgress * (index + 1)) / 6));
      const completionRate = Math.min(
        100,
        Math.round(((completed / totalEnrollments) * 100 * (index + 1)) / 6),
      );
      const engagement = Math.min(100, Math.round((enrollments.length * 12 * (index + 1)) / 6));

      return {
        month: m.month,
        accuracy: growth,
        completionRate,
        engagement,
      };
    });
  }, [enrollments]);

  const communityFeed = useMemo(() => {
    const eventItems = (upcomingEvents || []).slice(0, 3).map((event, index) => ({
      id: `event-${event._id || index}`,
      title: event.title || "Upcoming event",
      subtitle: event.eventType || "Event",
      time:
        event.startDate || event.date
          ? new Date(event.startDate || event.date).toLocaleDateString()
          : "Scheduled",
      icon: Trophy,
    }));

    const holidayItems = (holidaysData?.data || []).slice(0, 2).map((holiday, index) => ({
      id: `holiday-${holiday._id || index}`,
      title: holiday.title || holiday.name || "Holiday",
      subtitle: "Holiday notice",
      time: holiday.date ? new Date(holiday.date).toLocaleDateString() : "Upcoming",
      icon: CheckCircle2,
    }));

    const enrollmentItems = enrollments.slice(0, 1).map((item, index) => ({
      id: `enroll-${item._id || index}`,
      title:
        item.courseId?.title || item.course_id?.title || item.courseTitle || "Course enrolled",
      subtitle: "Learning activity",
      time: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Recent",
      icon: MessageCircle,
    }));

    return [...eventItems, ...holidayItems, ...enrollmentItems].slice(0, 6);
  }, [upcomingEvents, holidaysData?.data, enrollments]);

  return (
    <div className="py-8">
      {/* Performance Metrics Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        <section className="w-full lg:w-2/3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-7 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Performance Analytics
              </h3>
            </div>
            <span className="px-3 py-1.5 bg-tan-100 dark:bg-white/5 text-studprimary dark:text-premium-gold text-[10px] font-bold rounded-full border border-tan-200/50 dark:border-white/10 uppercase tracking-widest">
              LAST 6 MONTHS
            </span>
          </div>
          <PerformanceLineChart
            data={performanceChartData}
            title="Overall Performance Trends"
            className="dark:bg-white/10"
          />
        </section>

        {/* Community Section - Kept from original */}
        <section className="w-full lg:w-1/3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Community
              </h3>
            </div>
          </div>
          <div className="soft-card flex flex-col h-full bg-white dark:dark-glass border-none shadow-sm dark:shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-50 dark:border-white/5 flex justify-between items-center">
              <h4 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                Latest Activity
              </h4>
              <button className="text-studprimary dark:text-premium-gold p-1.5 hover:bg-tan-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-7 flex-1 overflow-y-auto max-h-[500px] hide-scrollbar">
              {communityFeed.length === 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No community activity yet.
                </div>
              )}
              {communityFeed.map((item) => (
                <div key={item.id} className="flex gap-4 items-start group">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-tan-100 dark:bg-premium-gold/10 flex items-center justify-center text-studprimary dark:text-premium-gold font-extrabold text-xs">
                      {item.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-studprimary dark:bg-premium-gold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1E1F26]">
                      <item.icon className="w-2.5 h-2.5 text-white dark:text-deep-charcoal" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-studprimary dark:group-hover:text-premium-gold transition-colors">
                        {item.title}
                      </span>{" "}
                      <span className="text-studprimary dark:text-premium-gold font-semibold uppercase text-[10px] tracking-widest bg-studprimary/5 dark:bg-premium-gold/10 px-1.5 py-0.5 rounded">
                        {item.subtitle}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-bold uppercase tracking-tighter">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-50 dark:border-white/5 mt-auto">
              <button className="w-full py-3.5 text-[11px] font-extrabold text-studprimary dark:text-premium-gold hover:bg-tan-50 dark:hover:bg-white/5 rounded-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                View Full Activity <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChartSection;
