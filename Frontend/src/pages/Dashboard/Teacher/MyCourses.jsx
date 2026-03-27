import React, { useEffect, useMemo, useState } from "react";
import { useDeleteCourseMutation, useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminLayout from "../../../utils/Adminlayoute";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Card";
import { Button } from "../../../components/Button";
import { Badge } from "../../../components/Badge";
import { Tabs, TabsList, TabsTrigger } from "../../../components/Tabs";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, CirclePlus, Eye, PencilLine, Search, Trash2, Users } from "lucide-react";

const ITEMS_PER_PAGE = 4;

const PAGE_SHELL_CLASS = "min-h-screen bg-background-light dark:bg-transparent";
const PANEL_CLASS =
  "rounded-2xl border border-studprimary/15 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm";
const SELECT_CLASS =
  "h-10 rounded-lg border border-studprimary/15 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-studprimary/40 focus:ring-2 focus:ring-studprimary/15 dark:border-white/10 dark:bg-navy-charcoal dark:text-slate-400 dark:focus:border-premium-gold/45 dark:focus:ring-premium-gold/20";
const TAB_TRIGGER_CLASS =
  "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200 data-[state=active]:bg-superadminprimary data-[state=active]:text-white dark:data-[state=active]:bg-premium-gold dark:data-[state=active]:text-deep-charcoal   ";

const getCourseId = (course) => String(course?._id || course?.id || "");

const getCurrencySymbol = (currency) => {
  if (currency === "INR") return "INR ";
  if (currency === "EUR") return "EUR ";
  return "$";
};

const getCoursePriceLabel = (course) => {
  const value = Number(course?.price ?? course?.priceUSD ?? course?.pricing ?? 0);
  if (value <= 0) return "Free";
  return `${getCurrencySymbol(course?.currency)}${value}`;
};

const getCourseStatus = (course) => {
  const rawStatus = String(course?.status || course?.courseStatus || "").toLowerCase();

  if (
    rawStatus.includes("draft") ||
    rawStatus.includes("inactive") ||
    rawStatus.includes("archive") ||
    rawStatus.includes("pending") ||
    course?.draft === true ||
    course?.isDraft === true ||
    course?.isPublished === false
  ) {
    return "draft";
  }

  return "active";
};

const getCourseDate = (course) => course?.updatedAt || course?.createdAt || null;

const getCourseModuleCount = (course) =>
  Number(
    course?.moduleCount ||
      course?.totalModules ||
      course?.modulesCount ||
      (Array.isArray(course?.modules) ? course.modules.length : 0) ||
      0
  );

const isTeacherCourseOwner = (course, teacherId) => {
  const createdById = String(course?.createdBy?._id || course?.createdBy || "");
  return createdById === teacherId;
};

const normalizeLevel = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("high") || normalized.includes("advanced")) return "high";
  if (normalized.includes("medium") || normalized.includes("intermediate") || normalized.includes("mid")) return "medium";
  if (normalized.includes("easy") || normalized.includes("beginner") || normalized.includes("basic") || normalized.includes("low")) return "easy";
  return "unknown";
};

const getLevelLabel = (levelKey) => {
  if (levelKey === "high") return "High";
  if (levelKey === "medium") return "Medium";
  if (levelKey === "easy") return "Easy";
  return "N/A";
};

const formatDateLabel = (value) => {
  if (!value) return "Date not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not available";
  return date.toLocaleDateString();
};

const CourseCard = ({ course, onView, onEdit, onDelete, canDelete, isDeleting }) => {
  const courseStatus = getCourseStatus(course);
  const levelKey = normalizeLevel(course?.level);
  const modulesCount = getCourseModuleCount(course);
  const studentsCount = Number(course?.totalStudents || course?.studentCount || course?.enrollmentCount || 0);

  return (
    <Card className={`${PANEL_CLASS} w-full max-w-[500px] overflow-hidden rounded-3xl !py-0 border-studprimary/12 hover:-translate-y-0.5 hover:border-studprimary/28 hover:shadow-lg hover:shadow-studprimary/10 dark:hover:shadow-black/30 transition-all duration-300`}>
      {(course?.imageUrl || course?.image) ? (
        <div className="relative h-44 w-full overflow-hidden bg-lavender-light dark:bg-premium-gold/10">
          <img
            src={course.imageUrl || course.image}
            alt={course?.title || "Course"}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
        </div>
      ) : (
        <div className="h-44 w-full bg-[radial-gradient(circle_at_top_left,_rgba(180,140,76,0.16),_transparent_55%),linear-gradient(145deg,#f8f5ff,#f4f6fb)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(176,141,87,0.2),_transparent_55%),linear-gradient(145deg,#1a1b23,#121318)]" />
      )}

      <CardContent className="flex flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge
            className={
              courseStatus === "active"
                ? "shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 uppercase tracking-wide"
                : "shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 uppercase tracking-wide"
            }
          >
            {courseStatus}
          </Badge>
          <Badge className="shrink-0 bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200 uppercase tracking-wide">
            {getLevelLabel(levelKey)}
          </Badge>
        </div>

        <div className="mb-2">
          <h3 className="line-clamp-2 text-[1.55rem] leading-[1.15] font-extrabold text-slate-900 dark:text-white">{course?.title || "Untitled Course"}</h3>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Last updated: {formatDateLabel(getCourseDate(course))}
          </p>
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-600 dark:text-slate-300">
          {course?.description || "No description available yet."}
        </p>

        <div className="mt-4 flex items-center gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            {studentsCount} Students
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            {modulesCount} Modules
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
          <div className="rounded-xl border border-studprimary/10 bg-background-light dark:bg-white/5 px-3 py-2.5">
            <p className="text-slate-500 dark:text-slate-400">Category</p>
            <p className="mt-0.5 truncate font-semibold text-slate-800 dark:text-slate-100">{course?.category || "General"}</p>
          </div>
          <div className="rounded-xl border border-studprimary/10 bg-background-light dark:bg-white/5 px-3 py-2.5">
            <p className="text-slate-500 dark:text-slate-400">Price</p>
            <p className="mt-0.5 truncate font-semibold text-slate-800 dark:text-slate-100">{getCoursePriceLabel(course)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2.5">
          <Button
            type="button"
            onClick={onView}
            className="h-10 rounded-xl bg-studprimary text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>
          <Button
            type="button"
            onClick={onEdit}
            variant="outline"
            className="h-10 rounded-xl border-studprimary/25 text-studprimary hover:bg-lavender-light dark:border-premium-gold/35 dark:text-premium-gold dark:hover:bg-premium-gold/10"
          >
            <PencilLine className="mr-1.5 h-4 w-4" />
            Edit
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onDelete}
            disabled={!canDelete || isDeleting}
            className="h-10 rounded-xl border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
            title={canDelete ? "Delete this course" : "You can only delete your own courses"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PaginationBar = ({ currentPage, totalPages, onPageChange, visibleCount = 0 }) => {
  if (totalPages <= 1) return null;

  const widthClass =
    visibleCount === 1
      ? "mx-auto max-w-[500px]"
      : visibleCount === 2
      ? "mx-auto max-w-[1020px]"
      : "";

  return (
    <div className={`${widthClass} mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-studprimary/10 bg-white/70 px-3.5 py-3 dark:border-white/10 dark:bg-white/5`}>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 border-studprimary/20 text-slate-700 dark:border-white/15 dark:text-slate-200"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`h-8 w-8 rounded-md text-sm font-semibold transition-colors ${
                page === currentPage
                  ? "bg-studprimary text-white dark:bg-premium-gold dark:text-deep-charcoal"
                  : "border border-studprimary/15 bg-white text-slate-700 hover:bg-lavender-light dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 border-studprimary/20 text-slate-700 dark:border-white/15 dark:text-slate-200"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const MyCourses = () => {
  const navigate = useNavigate();
  const { data: coursesData, isLoading, error } = useGetAllCoursesQuery();
  const [deleteCourse, { isLoading: isDeleteLoading }] = useDeleteCourseMutation();
  const { user } = useSelector((state) => state.auth || {});
  const teacherId = String(user?._id || user?.id || "");

  const [statusTab, setStatusTab] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingCourseId, setDeletingCourseId] = useState("");

  const myCourses = useMemo(
    () =>
      coursesData?.data?.filter(
        (course) =>
          String(course?.createdBy?._id || course?.createdBy || "") === teacherId ||
          String(course?.teacher_id?._id || course?.teacher_id || "") === teacherId
      ) || [],
    [coursesData?.data, teacherId]
  );

  const subjects = useMemo(
    () => ["all", ...new Set(myCourses.map((course) => String(course?.category || "General")))],
    [myCourses]
  );

  const levels = ["all", "easy", "medium", "high"];

  const filteredCourses = useMemo(() => {
    const loweredQuery = searchTerm.trim().toLowerCase();

    return myCourses.filter((course) => {
      const courseStatus = getCourseStatus(course);
      const subjectValue = String(course?.category || "General");
      const courseLevel = normalizeLevel(course?.level);
      const searchableText = `${course?.title || ""} ${course?.description || ""} ${course?.category || ""}`.toLowerCase();

      const statusMatch = statusTab === "all" ? true : courseStatus === statusTab;
      const subjectMatch = subjectFilter === "all" ? true : subjectValue === subjectFilter;
      const levelMatch = levelFilter === "all" ? true : courseLevel === levelFilter;
      const searchMatch = loweredQuery ? searchableText.includes(loweredQuery) : true;

      return statusMatch && subjectMatch && levelMatch && searchMatch;
    });
  }, [myCourses, statusTab, subjectFilter, levelFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, subjectFilter, levelFilter, searchTerm]);

  const totalPages = Math.max(Math.ceil(filteredCourses.length / ITEMS_PER_PAGE), 1);

  const visibleCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const metrics = useMemo(() => {
    const totalStudents = myCourses.reduce(
      (sum, course) => sum + Number(course?.totalStudents || course?.studentCount || course?.enrollmentCount || 0),
      0
    );

    const active = myCourses.filter((course) => getCourseStatus(course) === "active").length;
    const drafts = myCourses.filter((course) => getCourseStatus(course) === "draft").length;
    const itemsNeedingReview = myCourses.filter(
      (course) => !course?.description || !course?.category || !course?.level
    ).length;
    const avgCompletion = myCourses.length
      ? Math.round(
          myCourses.reduce((sum, course) => sum + Number(course?.completionRate || course?.progress || 0), 0) /
            myCourses.length
        )
      : 0;

    return {
      totalCourses: myCourses.length,
      totalStudents,
      active,
      drafts,
      itemsNeedingReview,
      avgCompletion,
    };
  }, [myCourses]);

  const recentActivity = useMemo(
    () =>
      [...myCourses]
        .sort((a, b) => new Date(getCourseDate(b) || 0) - new Date(getCourseDate(a) || 0))
        .slice(0, 5)
        .map((course) => ({
          id: getCourseId(course),
          title: course?.title || "Untitled Course",
          status: getCourseStatus(course),
          date: formatDateLabel(getCourseDate(course)),
        })),
    [myCourses]
  );

  const handleDeleteCourse = async (course) => {
    const courseId = getCourseId(course);
    if (!courseId) return;

    const canDelete = isTeacherCourseOwner(course, teacherId);
    if (!canDelete) {
      window.alert("You can only delete your own courses.");
      return;
    }

    const confirmed = window.confirm(`Delete \"${course?.title || "this course"}\"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingCourseId(courseId);
      await deleteCourse(courseId).unwrap();
    } catch (deleteError) {
      window.alert(deleteError?.data?.message || "Failed to delete course. Please try again.");
    } finally {
      setDeletingCourseId("");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout showSearch={false} className="p-6">
        <div className={`${PAGE_SHELL_CLASS} flex h-64 items-center justify-center rounded-2xl border border-studprimary/10`}>
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-studprimary dark:border-premium-gold" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout showSearch={false} className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          Error loading courses: {error.message || "Something went wrong"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showSearch={false} className="p-6">
      <div className={PAGE_SHELL_CLASS}>
        <section className="mb-5 rounded-2xl border border-studprimary/12 bg-white/80 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Course Management</h1>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                Quick access to your active curriculum and course workflow.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => navigate("/teacher/course-form")}
              className="h-10 bg-studprimary px-4 text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal dark:hover:bg-premium-gold/90"
            >
              <CirclePlus className="mr-1.5 h-4 w-4" />
              Create New Course
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_240px_280px] lg:items-center">
            <Tabs value={statusTab} onValueChange={setStatusTab}>
              <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-lavender-light p-1 dark:bg-premium-gold/10 dark:text-white">
                <TabsTrigger value="all" className={TAB_TRIGGER_CLASS}>
                  All Courses ({metrics.totalCourses})
                </TabsTrigger>
                <TabsTrigger value="active" className={TAB_TRIGGER_CLASS}>
                  Active ({metrics.active})
                </TabsTrigger>
                <TabsTrigger value="draft" className={TAB_TRIGGER_CLASS}>
                  Drafts ({metrics.drafts})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 rounded-lg border border-studprimary/15 bg-white px-2.5 py-2 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search courses"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className={SELECT_CLASS}
                style={{ colorScheme: "light dark" }}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === "all" ? "All Subjects" : subject}
                  </option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
                className={SELECT_CLASS}
                style={{ colorScheme: "light dark" }}
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level === "all" ? "All Levels" : getLevelLabel(level)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          <div className="self-start lg:col-span-9">
            {myCourses.length === 0 ? (
              <Card className={PANEL_CLASS}>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-studprimary dark:text-premium-gold" />
                  <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">You have not created any courses yet.</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start your first program and manage it from here.</p>
                  <Button
                    type="button"
                    onClick={() => navigate("/teacher/course-form")}
                    className="mt-5 bg-studprimary text-white hover:bg-studprimary/90 dark:bg-premium-gold dark:text-deep-charcoal"
                  >
                    <CirclePlus className="mr-1.5 h-4 w-4" />
                    Create Your First Course
                  </Button>
                </CardContent>
              </Card>
            ) : filteredCourses.length === 0 ? (
              <Card className={PANEL_CLASS}>
                <CardContent className="py-12 text-center">
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No courses match your filters.</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing status, subject, level, or search.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5">
                  {visibleCourses.map((course) => {
                    const courseId = getCourseId(course);
                    const canDelete = isTeacherCourseOwner(course, teacherId);
                    return (
                      <div
                        key={courseId}
                        className={visibleCourses.length === 1 ? "md:col-span-2 flex justify-center" : "flex justify-start"}
                      >
                        <CourseCard
                          course={course}
                          onView={() => navigate(`/card/${courseId}`)}
                          onEdit={() => navigate(`/teacher/course-form?edit=${courseId}`)}
                          onDelete={() => handleDeleteCourse(course)}
                          canDelete={canDelete}
                          isDeleting={isDeleteLoading && deletingCourseId === courseId}
                        />
                      </div>
                    );
                  })}
                </div>

                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  visibleCount={visibleCourses.length}
                />
              </>
            )}
          </div>

          <div className="space-y-4 lg:col-span-3">
            <Card className={PANEL_CLASS}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-[0.14em] text-slate-700 dark:text-slate-200">
                  Manager Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2 dark:bg-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Enrollment</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{metrics.totalStudents}</p>
                </div>
                <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2 dark:bg-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active Courses</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{metrics.active}</p>
                </div>
                <div className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2 dark:bg-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Items Requiring Review</p>
                  <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-300">{metrics.itemsNeedingReview}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={PANEL_CLASS}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-[0.14em] text-slate-700 dark:text-slate-200">
                  Recent System Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity found.</p>
                ) : (
                  <div className="space-y-2.5">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="rounded-lg border border-studprimary/10 bg-background-light px-3 py-2 dark:bg-white/5">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-500 dark:text-slate-400">{item.date}</span>
                          <Badge
                            className={
                              item.status === "active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 uppercase tracking-wide"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 uppercase tracking-wide"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className={PANEL_CLASS}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-studprimary dark:text-premium-gold">Active Courses</p>
                <BookOpen className="h-4 w-4 text-studprimary dark:text-premium-gold" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.active}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">↗ Managed from your live catalog</p>
            </CardContent>
          </Card>

          <Card className={PANEL_CLASS}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-studprimary dark:text-premium-gold">Total Students</p>
                <Users className="h-4 w-4 text-studprimary dark:text-premium-gold" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.totalStudents}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">↗ Updated from enrollments</p>
            </CardContent>
          </Card>

          <Card className={PANEL_CLASS}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-studprimary dark:text-premium-gold">Avg. Completion</p>
                <CheckCircle2 className="h-4 w-4 text-studprimary dark:text-premium-gold" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.avgCompletion}%</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Global benchmark: 68%</p>
            </CardContent>
          </Card>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-studprimary/10 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-studprimary dark:text-premium-gold" />
            Showing {visibleCourses.length} of {filteredCourses.length} filtered courses
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Search className="h-3.5 w-3.5" />
            Dynamic filters and pagination enabled
          </span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MyCourses;
