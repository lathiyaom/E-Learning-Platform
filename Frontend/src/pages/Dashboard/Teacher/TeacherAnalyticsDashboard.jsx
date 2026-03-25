import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useGetCourseEnrollmentsQuery } from "../../../redux/Apis/enrollmentApi";
import { useGetTeacherAssignmentsQuery } from "../../../redux/Apis/assignmentApi";
import { useGetCourseMaterialsQuery } from "../../../redux/Apis/materialApi";
import AdminLayout from "../../../utils/Adminlayoute";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../../components/Breadcrumb";
import { Card } from "../../../components/Card";
import {
  AnalyticsBarChart,
  AnalyticsLineChart,
  AnalyticsRadarChart,
} from "../../../pages/Dashboard/student/Student_Dashboard/ChartComponents";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  BarChart2,
  ChevronDown,
  Sparkles,
  FileText,
  Layers,
  Star,
  Clock,
  CheckCircle2,
  Filter,
  RefreshCw,
} from "lucide-react";

/* ─── Design tokens ─── */
const CARD =
  "bg-white dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm";
const INPUT =
  "px-4 py-2.5 text-sm bg-slate-50 dark:bg-deep-charcoal border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-studprimary/30 dark:focus:ring-premium-gold/30 focus:border-studprimary dark:focus:border-premium-gold/50 transition-all appearance-none";

/* ─── Tooltip style shared across all charts ─── */
const TOOLTIP_STYLE = {
  backgroundColor: "#12131A",
  border: "1px solid rgba(176,141,87,0.25)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "12px",
};

/* ═══ Stat Card ═══ */
const StatCard = ({ icon: Icon, label, value, accent, sub, trend }) => (
  <div
    className={`${CARD} p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden`}
  >
    {/* subtle glow */}
    <div
      className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl pointer-events-none"
      style={{ background: accent }}
    />
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300"
      style={{ background: accent + "1A" }}
    >
      <Icon size={22} style={{ color: accent }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
        {label}
      </p>
      {sub && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {sub}
        </p>
      )}
      {trend !== undefined && (
        <div
          className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            trend >= 0
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/25 dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/25 dark:text-red-400"
          }`}
        >
          <TrendingUp size={9} />
          {trend >= 0 ? "+" : ""}
          {trend}%
        </div>
      )}
    </div>
  </div>
);

/* ═══ Section header ═══ */
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0">
      <Icon size={17} className="text-studprimary dark:text-premium-gold" />
    </div>
    <div>
      <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

/* ═══ Course row card ═══ */
const CourseRowCard = ({ course }) => {
  const rating = Number(course.rating || 0).toFixed(1);
  const reviews = Number(course.reviewCount || 0);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0">
        <BookOpen size={16} className="text-studprimary dark:text-premium-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
          {course.title}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          {course.category || "Uncategorized"} •{" "}
          {course.level || "All levels"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Star
            size={11}
            className="text-amber-400"
            fill="currentColor"
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {rating}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {reviews} reviews
        </span>
      </div>
    </div>
  );
};

/* ═══════════════ MAIN COMPONENT ═══════════════ */
const TeacherAnalyticsDashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const teacherId = String(user?._id || user?.id || "");

  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  /* ── Queries ── */
  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } =
    useGetAllCoursesQuery();

  const myCourses = useMemo(() => {
    const courses = coursesData?.data || [];
    return courses.filter(
      (c) =>
        String(c?.createdBy?._id || c?.createdBy || "") === teacherId ||
        String(c?.teacher_id?._id || c?.teacher_id || "") === teacherId
    );
  }, [coursesData?.data, teacherId]);

  const firstCourseId = myCourses[0]?._id || myCourses[0]?.id;
  const activeCourseId =
    selectedCourseId === "all" ? firstCourseId : selectedCourseId;

  const { data: enrollmentData, isLoading: enrollLoading } =
    useGetCourseEnrollmentsQuery(activeCourseId, {
      skip: !activeCourseId,
    });

  const { data: assignmentsData, isLoading: assignLoading } =
    useGetTeacherAssignmentsQuery(
      { courseId: selectedCourseId !== "all" ? selectedCourseId : undefined, page: 1, limit: 100 },
      { skip: myCourses.length === 0 }
    );

  const { data: materialsData } = useGetCourseMaterialsQuery(activeCourseId, {
    skip: !activeCourseId,
  });

  /* ── Derived stats ── */
  const enrollments = enrollmentData?.data || [];
  const assignments = assignmentsData?.data || [];
  const materials = materialsData?.data || [];

  const totalStudents = enrollments.length;
  const activeStudents = enrollments.filter((e) => e.status === "active").length;
  const completedStudents = enrollments.filter(
    (e) => e.status === "completed"
  ).length;

  const avgRating =
    myCourses.length > 0
      ? (
          myCourses.reduce((s, c) => s + Number(c.rating || 0), 0) /
          myCourses.length
        ).toFixed(1)
      : "0.0";

  const totalReviews = myCourses.reduce(
    (s, c) => s + Number(c.reviewCount || 0),
    0
  );

  const publishedAssignments = assignments.filter((a) => a.isVisible).length;
  const draftAssignments = assignments.filter((a) => !a.isVisible).length;

  /* ── Chart data: Course ratings bar ── */
  const courseRatingData = myCourses.map((c) => ({
    name: (c.title || "").slice(0, 14),
    rating: Number((c.rating || 0).toFixed(1)),
    reviews: Number(c.reviewCount || 0),
  }));

  /* ── Chart data: Enrollment Over Time ── */
  const enrollmentTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = {};
    enrollments.forEach((e) => {
      const d = e.enrollmentDate || e.enrolledAt || e.enrolled_at || e.createdAt;
      if (d) {
        const m = new Date(d).getMonth();
        counts[months[m]] = (counts[months[m]] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => months.indexOf(a[0]) - months.indexOf(b[0]))
      .map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  /* ── Chart data: skill radar (per-course rating spread) ── */
  const skillRadarData = myCourses.slice(0, 6).map((c) => ({
    name: (c.title || "").slice(0, 10),
    value: Number(((c.rating || 0) / 5) * 100),
  }));

  /* ── Loading skeleton ── */
  const isLoading = coursesLoading;

  return (
    <AdminLayout showSearch={false}>
      <div className="p-4 md:p-6 space-y-6 bg-background-light dark:bg-transparent min-h-full">

        {/* ── Breadcrumb ── */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/teacher/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ── Hero header ── */}
        <section
          className={`relative ${CARD} px-5 py-7 md:px-8 md:py-9 overflow-hidden`}
        >
          {/* decorative blobs (Help page poster style) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-studprimary/8 dark:bg-premium-gold/8 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-500/8 dark:bg-premium-gold/5 rounded-full blur-[60px] translate-y-1/2 translate-x-1/2" />
            <div
              className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05] text-studprimary dark:text-premium-gold"
              style={{
                backgroundImage:
                  "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "1.5rem 1.5rem",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-studprimary/10 dark:bg-premium-gold/10 flex items-center justify-center flex-shrink-0">
                <BarChart2 size={26} className="text-studprimary dark:text-premium-gold" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-studprimary/10 dark:bg-premium-gold/10 border border-studprimary/20 dark:border-premium-gold/20 text-studprimary dark:text-premium-gold text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={10} />
                  Teacher Analytics
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  Performance Dashboard
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time insights across your courses, students &amp; content
                </p>
              </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {/* Course filter */}
              <div className="relative">
                <Filter
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className={`${INPUT} pl-8 pr-8 min-w-[160px]`}
                  disabled={isLoading}
                >
                  <option value="all">All Courses</option>
                  {myCourses.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {(c.title || "").slice(0, 22)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* Refetch */}
              <button
                onClick={refetchCourses}
                aria-label="Refresh data"
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-deep-charcoal text-slate-500 dark:text-slate-300 hover:text-studprimary dark:hover:text-premium-gold hover:border-studprimary/30 dark:hover:border-premium-gold/30 transition-all"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className={`${CARD} flex items-center justify-center py-20`}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-studprimary/20 border-t-studprimary dark:border-premium-gold/20 dark:border-t-premium-gold animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading analytics…
              </p>
            </div>
          </div>
        ) : myCourses.length === 0 ? (
          <div className={`${CARD} flex flex-col items-center text-center gap-4 py-20`}>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <BookOpen size={26} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No courses found
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                Create your first course to start seeing analytics here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── KPI stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={BookOpen}
                label="My Courses"
                value={myCourses.length}
                accent="#b48c4c"
                sub="Total created"
              />
              <StatCard
                icon={Users}
                label="Enrolled Students"
                value={totalStudents}
                accent="#3b82f6"
                sub={`${activeStudents} active`}
              />
              <StatCard
                icon={Award}
                label="Avg Rating"
                value={avgRating}
                accent="#f59e0b"
                sub={`${totalReviews} reviews`}
              />
              <StatCard
                icon={FileText}
                label="Assignments"
                value={assignments.length}
                accent="#10b981"
                sub={`${publishedAssignments} published`}
              />
            </div>

            {/* ── Secondary KPI row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={CheckCircle2}
                label="Completed"
                value={completedStudents}
                accent="#10b981"
                sub="Students finished"
              />
              <StatCard
                icon={Layers}
                label="Materials"
                value={materials.length}
                accent="#8b5cf6"
                sub="Uploaded resources"
              />
              <StatCard
                icon={Clock}
                label="Draft Assignments"
                value={draftAssignments}
                accent="#f97316"
                sub="Not published"
              />
              <StatCard
                icon={Star}
                label="Total Reviews"
                value={totalReviews}
                accent="#ec4899"
                sub="Across all courses"
              />
            </div>

            {/* ── Charts — row 1 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Ratings Bar */}
              {courseRatingData.length > 0 ? (
                <AnalyticsBarChart
                  data={courseRatingData}
                  title="Course Ratings Overview"
                  xKey="name"
                  yKey="rating"
                  barColor="rgba(180, 140, 76, 0.5)"
                  className="h-full border-t border-l border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md"
                />
              ) : (
                <div className={`${CARD} p-6 flex items-center justify-center min-h-[300px]`}>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    No rating data yet
                  </p>
                </div>
              )}

              {/* Enrollment Trend Line */}
              {enrollmentTrendData.length > 0 ? (
                <AnalyticsLineChart
                  data={enrollmentTrendData}
                  title="Student Enrollment Trend"
                  xKey="name"
                  yKey="value"
                  lineColor="rgba(59, 130, 246, 0.7)"
                  className="h-full border-t border-l border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md"
                />
              ) : (
                <div className={`${CARD} p-6 flex items-center justify-center min-h-[300px]`}>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    {enrollLoading ? "Loading enrollments…" : "No enrollment data available"}
                  </p>
                </div>
              )}
            </div>

            {/* ── Charts — row 2 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Review Volume */}
              {courseRatingData.length > 0 ? (
                <div className="lg:col-span-2">
                  <AnalyticsBarChart
                    data={courseRatingData}
                    title="Review Volume per Course"
                    xKey="name"
                    yKey="reviews"
                    barColor="rgba(139, 92, 246, 0.5)"
                    className="border-t border-l border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md"
                  />
                </div>
              ) : null}

              {/* Assignment types radar */}
              {skillRadarData.length > 0 ? (
                <AnalyticsRadarChart
                  data={skillRadarData}
                  title="Course Rating Spread"
                  angleKey="name"
                  valueKey="value"
                  color="rgba(180, 140, 76, 0.6)"
                  className="border-t border-l border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md"
                />
              ) : (
                <div className={`${CARD} p-6 flex items-center justify-center min-h-[300px]`}>
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center">
                    Need 2+ courses for radar view
                  </p>
                </div>
              )}
            </div>

            {/* ── All Courses table ── */}
            <div className={`${CARD} p-5 md:p-6`}>
              <SectionHeader
                icon={BookOpen}
                title="All My Courses"
                subtitle={`${myCourses.length} course${myCourses.length !== 1 ? "s" : ""} created`}
              />
              <div className="space-y-1">
                {myCourses.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                    No courses found.
                  </p>
                ) : (
                  myCourses.map((course) => (
                    <CourseRowCard key={course._id || course.id} course={course} />
                  ))
                )}
              </div>
            </div>

            {/* ── Quick stats breakdown ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top rated course */}
              <Card className="bg-studprimary/5 dark:bg-premium-gold/5 border border-studprimary/15 dark:border-premium-gold/15 rounded-2xl p-5 shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={15} className="text-studprimary dark:text-premium-gold" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Top Rated
                  </p>
                </div>
                {myCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] ? (
                  <>
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {myCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0].title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      ⭐ {Number(myCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0].rating || 0).toFixed(1)} rating
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">—</p>
                )}
              </Card>

              {/* Most reviewed */}
              <Card className="bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-5 shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={15} className="text-blue-500" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Most Reviews
                  </p>
                </div>
                {myCourses.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0] ? (
                  <>
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {myCourses.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0].title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {myCourses.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))[0].reviewCount || 0} reviews
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">—</p>
                )}
              </Card>

              {/* Completion rate */}
              <Card className="bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl p-5 shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Completion Rate
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalStudents > 0
                    ? ((completedStudents / totalStudents) * 100).toFixed(0)
                    : 0}
                  %
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {completedStudents}/{totalStudents} students finished
                </p>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherAnalyticsDashboard;
