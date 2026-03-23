import { useMemo, useState } from "react";
import {
  PerformanceLineChart,
  AnalyticsBarChart,
  AnalyticsRadarChart,
} from "./ChartComponents";
import {
  MessageCircle,
  RefreshCcw,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Calendar,
  BookOpen,
  Zap,
} from "lucide-react";
import { useGetMyEnrollmentsQuery } from "../../../../redux/Apis/enrollmentApi";
import { useGetUpcomingHolidaysQuery } from "../../../../redux/Apis/holidayApi";
import { useDispatch, useSelector } from "react-redux";
import { getUpcomingEvents } from "../../../../redux/Apis/eventApi";
import { useEffect } from "react";
import moment from "moment";

const ChartSection = () => {
  const [filterRange, setFilterRange] = useState("6months"); // last-day, last-week, last-month, 6months, all-time
  const dispatch = useDispatch();
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery();
  const { data: holidaysData } = useGetUpcomingHolidaysQuery();
  const { upcomingEvents } = useSelector((state) => state.event);
  const enrollments = enrollmentsData?.data || [];

  useEffect(() => {
    dispatch(getUpcomingEvents({ days: 30, page: 1, limit: 6 }));
  }, [dispatch]);

  // Helper function to calculate date range based on filter
  const calculateDateRange = (range) => {
    const now = moment();
    let startDate;

    switch (range) {
      case "last-day":
        startDate = now.clone().subtract(1, "day");
        break;
      case "last-week":
        startDate = now.clone().subtract(7, "days");
        break;
      case "last-month":
        startDate = now.clone().subtract(30, "days");
        break;
      case "6months":
        startDate = now.clone().subtract(6, "months");
        break;
      case "all-time":
        startDate = moment("2000-01-01");
        break;
      default:
        startDate = now.clone().subtract(6, "months");
    }

    return { startDate, endDate: now };
  };

  // Filter enrollments by date range
  const filteredEnrollments = useMemo(() => {
    if (!enrollments.length) return [];
    const { startDate, endDate } = calculateDateRange(filterRange);
    return enrollments.filter((e) => {
      const enrollDate = moment(e.createdAt || e.enrolled_at);
      return (
        enrollDate.isSameOrAfter(startDate) && enrollDate.isSameOrBefore(endDate)
      );
    });
  }, [enrollments, filterRange]);

  // Calculate KPI metrics based on filtered enrollments
  const kpiMetrics = useMemo(() => {
    const total = filteredEnrollments.length;
    const completed = filteredEnrollments.filter(
      (e) => Number(e.progressPercent || e.progress || 0) >= 100
    ).length;
    const inProgress = total - completed;
    const avgProgress =
      total > 0
        ? Math.round(
            filteredEnrollments.reduce(
              (sum, e) => sum + Number(e.progressPercent || e.progress || 0),
              0
            ) / total
          )
        : 0;

    return {
      totalEnrolled: total,
      avgProgress: Math.min(100, avgProgress),
      completed,
      inProgress,
    };
  }, [filteredEnrollments]);

  // Generate performance chart data
  const performanceChartData = useMemo(() => {
    const { startDate, endDate } = calculateDateRange(filterRange);
    let datePoints = [];

    if (filterRange === "last-day") {
      datePoints = Array.from({ length: 24 }).map((_, idx) => {
        const hour = startDate.clone().add(idx, "hours");
        return {
          period: hour.format("HH:00"),
          date: hour,
        };
      });
    } else if (filterRange === "last-week") {
      datePoints = Array.from({ length: 7 }).map((_, idx) => {
        const day = startDate.clone().add(idx, "days");
        return {
          period: day.format("ddd"),
          date: day,
        };
      });
    } else if (filterRange === "last-month") {
      datePoints = Array.from({ length: 4 }).map((_, idx) => {
        const week = startDate.clone().add(idx * 7, "days");
        return {
          period: `Week ${idx + 1}`,
          date: week,
        };
      });
    } else if (filterRange === "6months") {
      datePoints = Array.from({ length: 6 }).map((_, idx) => {
        const month = startDate.clone().add(idx, "months");
        return {
          period: month.format("MMM"),
          date: month,
        };
      });
    } else {
      // all-time: yearly breakdown
      const years = endDate.diff(startDate, "years", true);
      const count = Math.min(Math.ceil(years), 12);
      datePoints = Array.from({ length: count }).map((_, idx) => {
        const month = startDate.clone().add(idx, "months");
        return {
          period: month.format("MMM YY"),
          date: month,
        };
      });
    }

    return datePoints.map((point) => {
      const pointEnrollments = filteredEnrollments.filter((e) => {
        const enrollDate = moment(e.createdAt || e.enrolled_at);
        return enrollDate.isSameOrBefore(point.date);
      });

      const total = pointEnrollments.length || 0;
      const completed = pointEnrollments.filter(
        (e) => Number(e.progressPercent || e.progress || 0) >= 100
      ).length;
      const avgProg =
        total > 0
          ? Math.round(
              pointEnrollments.reduce(
                (sum, e) => sum + Number(e.progressPercent || e.progress || 0),
                0
              ) / total
            )
          : 0;

      return {
        month: point.period,
        accuracy: Math.min(100, avgProg),
        completionRate:
          total > 0 ? Math.round((completed / total) * 100) : 0,
        engagement: total * 12,
      };
    });
  }, [filteredEnrollments, filterRange]);

  // Generate weekly activity chart data
  const weeklyActivityData = useMemo(() => {
    const { startDate } = calculateDateRange(filterRange);
    const now = moment();

    const weeks = [];
    let currentWeek = startDate.clone().startOf("week");

    while (currentWeek.isBefore(now)) {
      weeks.push({
        week: currentWeek.format("MMM DD"),
        date: currentWeek.clone(),
      });
      currentWeek.add(1, "week");
    }

    return weeks.map((w) => {
      const weekEnrollments = filteredEnrollments.filter((e) => {
        const enrollDate = moment(e.createdAt || e.enrolled_at);
        return (
          enrollDate.isSameOrAfter(w.date) &&
          enrollDate.isBefore(w.date.clone().add(1, "week"))
        );
      });

      return {
        week: w.week,
        coursesEnrolled: weekEnrollments.length,
        coursesCompleted: weekEnrollments.filter(
          (e) => Number(e.progressPercent || e.progress || 0) >= 100
        ).length,
        averageProgress: weekEnrollments.length
          ? Math.round(
              weekEnrollments.reduce(
                (sum, e) => sum + Number(e.progressPercent || e.progress || 0),
                0
              ) / weekEnrollments.length
            )
          : 0,
      };
    });
  }, [filteredEnrollments, filterRange]);

  // Generate skills radar data from real course categories
  const skillsData = useMemo(() => {
    const skillMap = {};
    
    // Track skills from enrolled courses
    filteredEnrollments.forEach((enrollment) => {
      const course = enrollment.courseId || enrollment.course_id;
      if (course) {
        // Extract skill from course category
        const category = course.category || "General";
        
        // Map level to proficiency score
        const levelScore = {
          "Easy": 30,
          "Medium": 65,
          "Hard": 85,
          "Beginner": 25,
          "Intermediate": 60,
          "Advanced": 90,
        };
        
        const baseScore = levelScore[course.level] || 50;
        const progressBoost = Number(enrollment.progressPercent || enrollment.progress || 0);
        
        if (!skillMap[category]) {
          skillMap[category] = { name: category, scores: [] };
        }
        skillMap[category].scores.push(baseScore + (progressBoost * 0.3)); // 30% of progress adds to skill
      }
    });

    // Convert to array and calculate averages
    const skillsArray = Object.values(skillMap).map((skill) => ({
      name: skill.name.substring(0, 12), // Truncate for display
      value: Math.min(100, Math.round(skill.scores.reduce((a, b) => a + b, 0) / skill.scores.length)),
    }));

    // If no skills from courses, show default skill categories
    if (skillsArray.length === 0) {
      return [
        { name: "Web Dev", value: kpiMetrics.avgProgress },
        { name: "Design", value: Math.max(0, kpiMetrics.avgProgress - 10) },
        { name: "Mobile", value: Math.max(0, kpiMetrics.avgProgress - 5) },
        { name: "Cloud", value: Math.min(100, kpiMetrics.avgProgress + 5) },
        { name: "Data Sci", value: Math.max(0, kpiMetrics.avgProgress - 15) },
        { name: "DevOps", value: Math.min(100, kpiMetrics.avgProgress + 10) },
      ];
    }

    // Return top 6 or pad with defaults
    while (skillsArray.length < 6) {
      skillsArray.push({
        name: `Skill ${skillsArray.length + 1}`,
        value: Math.round(kpiMetrics.avgProgress * 0.7),
      });
    }

    return skillsArray.slice(0, 6);
  }, [filteredEnrollments, kpiMetrics.avgProgress]);

  // Generate community feed from real events, holidays, and enrollments
  const communityFeed = useMemo(() => {
    const eventItems = (upcomingEvents || []).slice(0, 3).map((event, index) => ({
      id: `event-${event._id || index}`,
      title: event.title || "Upcoming event",
      subtitle: (event.event_type || event.eventType || "Event").toUpperCase(),
      time:
        event.start_date || event.startDate || event.date
          ? moment(event.start_date || event.startDate || event.date).fromNow()
          : "Scheduled",
      icon: Trophy,
      type: "event",
    }));

    const holidayItems = (holidaysData?.data || []).slice(0, 2).map((holiday, index) => ({
      id: `holiday-${holiday._id || index}`,
      title: holiday.title || holiday.name || "Holiday",
      subtitle: (holiday.holiday_type || holiday.holidayType || "public").toUpperCase(),
      time: holiday.date ? moment(holiday.date).fromNow() : "Upcoming",
      icon: CheckCircle2,
      type: "holiday",
    }));

    const enrollmentItems = filteredEnrollments.slice(0, 1).map((item, index) => ({
      id: `enroll-${item._id || index}`,
      title:
        item.courseId?.title || item.course_id?.title || item.courseTitle || "Course enrolled",
      subtitle: "Learning activity",
      time: item.createdAt ? moment(item.createdAt).fromNow() : "Recent",
      icon: MessageCircle,
      type: "enrollment",
    }));

    return [...eventItems, ...holidayItems, ...enrollmentItems].slice(0, 6);
  }, [upcomingEvents, holidaysData?.data, filteredEnrollments]);

  // Helper to get badge color by event/activity type
  const getBadgeStyle = (type) => {
    switch (type) {
      case "event":
        return "bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold";
      case "holiday":
        return "bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold";
      case "enrollment":
        return "bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold";
      default:
        return "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400";
    }
  };

  return (
    <div className="py-8 space-y-8">
      {/* Header with Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Performance Analytics
          </h2>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-white/5 rounded-xl p-1.5 border border-slate-200 dark:border-white/10 overflow-x-auto hide-scrollbar">
          {[
            { value: "last-day", label: "Last Day" },
            { value: "last-week", label: "Last Week" },
            { value: "last-month", label: "Last Month" },
            { value: "6months", label: "Last 6M" },
            { value: "all-time", label: "All Time" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterRange(filter.value)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-wider whitespace-nowrap ${
                filterRange === filter.value
                  ? "bg-studprimary dark:bg-premium-gold text-white dark:text-deep-charcoal shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-studprimary dark:hover:text-premium-gold hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-studprimary dark:text-premium-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                Total Enrolled
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiMetrics.totalEnrolled}
              </p>
            </div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-studprimary dark:text-premium-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                Avg Progress
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiMetrics.avgProgress}%
              </p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-studprimary dark:text-premium-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                Completed
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiMetrics.completed}
              </p>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-studprimary dark:text-premium-gold" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                In Progress
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiMetrics.inProgress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Line Chart - Full width on mobile/tablet, 2 cols on desktop */}
        <div className="lg:col-span-2">
          <PerformanceLineChart
            data={performanceChartData}
            title="Performance Trends"
            className="bg-white dark:bg-transparent dark:dark-glass dark:border dark:border-white/10"
          />
        </div>

        {/* Weekly Activity Bar Chart */}
        <div>
          <AnalyticsBarChart
            data={weeklyActivityData.slice(-4)}
            title="Weekly Activity"
            xKey="week"
            yKey="coursesEnrolled"
            barColor="#b48c4c"
            className="bg-white dark:bg-transparent dark:dark-glass dark:border dark:border-white/10"
          />
        </div>
      </div>

      {/* Second Row - Skills Radar and Additional Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Radar */}
        <div className="lg:col-span-1">
          <AnalyticsRadarChart
            data={skillsData}
            title="Skill Development"
            angleKey="name"
            valueKey="value"
            color="#B48B4D"
            className="bg-white dark:bg-transparent dark:dark-glass dark:border dark:border-white/10"
          />
        </div>

        {/* Events + Holidays Section */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass flex flex-col overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-studprimary dark:bg-premium-gold rounded-full"></div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Events
                </h4>
              </div>
              <Trophy className="w-4 h-4 text-studprimary dark:text-premium-gold" />
            </div>
            <div className="p-6 space-y-4 flex-1">
              {(upcomingEvents || []).length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  No upcoming events scheduled
                </p>
              ) : (
                (upcomingEvents || []).slice(0, 3).map((event, idx) => (
                  <div
                    key={event._id || idx}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-studprimary/30 dark:hover:border-premium-gold/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 mt-2 rounded-full bg-studprimary dark:bg-premium-gold flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                          {event.title || "Event"}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-block px-2 py-1 bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-[10px] font-bold rounded uppercase tracking-wider">
                            {(event.event_type || event.eventType || "Event").substring(0, 10)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {event.start_date || event.startDate || event.date
                              ? moment(event.start_date || event.startDate || event.date).fromNow()
                              : "Scheduled"}
                          </span>
                        </div>
                        {(event.location || event.description) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                            📍 {event.location || event.description?.substring(0, 30)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass flex flex-col overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-studprimary dark:bg-premium-gold rounded-full"></div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Holidays
                </h4>
              </div>
              <CheckCircle2 className="w-4 h-4 text-studprimary dark:text-premium-gold" />
            </div>
            <div className="p-6 space-y-4 flex-1">
              {(holidaysData?.data || []).length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  No upcoming holidays
                </p>
              ) : (
                (holidaysData?.data || []).slice(0, 3).map((holiday, idx) => (
                  <div
                    key={holiday._id || idx}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-studprimary/30 dark:hover:border-premium-gold/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 mt-2 rounded-full bg-studprimary dark:bg-premium-gold flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                          {holiday.title || holiday.name || "Holiday"}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-block px-2 py-1 bg-lavender-light dark:bg-premium-gold/10 text-studprimary dark:text-premium-gold text-[10px] font-bold rounded uppercase tracking-wider">
                            {(holiday.holiday_type || holiday.holidayType || "public").substring(0, 10)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {holiday.date
                              ? moment(holiday.date).fromNow()
                              : "Upcoming"}
                          </span>
                        </div>
                        {holiday.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                            📌 {holiday.description.substring(0, 30)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community Activity Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-studprimary dark:bg-premium-gold rounded-full shadow-[0_0_10px_#B08D57]"></div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Community Activity
            </h3>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent dark:dark-glass flex flex-col shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Latest Activity
            </h4>
            <button className="text-studprimary dark:text-premium-gold p-1.5 hover:bg-lavender-light dark:hover:bg-premium-gold/10 rounded-lg transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto hide-scrollbar">
            {communityFeed.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                No recent activity
              </div>
            ) : (
              communityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-start p-4 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-lavender-light dark:hover:bg-premium-gold/10 transition-colors group border border-slate-200 dark:border-white/10"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-lavender-light dark:bg-premium-gold/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-studprimary dark:text-premium-gold" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1E1F26] ${getBadgeStyle(item.type)}`}>
                      <span className="text-[10px] font-bold">
                        {item.type[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-studprimary dark:group-hover:text-premium-gold transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] font-bold rounded px-2 py-1 ${getBadgeStyle(item.type)}`}>
                        {item.subtitle}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-white/10 mt-auto">
            <button className="w-full py-3 text-xs font-extrabold text-studprimary dark:text-premium-gold hover:bg-lavender-light dark:hover:bg-premium-gold/10 rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2">
              View All Activity <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChartSection;
