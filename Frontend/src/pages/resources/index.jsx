import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "../../utils/Adminlayoute";
import { selectCurrentUser, selectIsAuthenticated } from "../../redux/slice/authSlice";
import { useGetMyEnrollmentsQuery } from "../../redux/Apis/enrollmentApi";
import { useGetAllCoursesQuery } from "../../redux/Apis/courseApi";
import { courseMaterialApi } from "../../api";
import { getApiErrorMessage } from "../../utils/apiError";
import { MessageSquare, Loader2 } from "lucide-react";

import ResourcesPoster from "../Dashboard/student/Resources/ResourcesPoster";
import ResourcesToolbar from "../Dashboard/student/Resources/ResourcesToolbar";
import ResourcesFeaturedCard from "../Dashboard/student/Resources/ResourcesFeaturedCard";
import ResourceCard from "../Dashboard/student/Resources/ResourceCard";
import { Card } from "../../components/Card";

function Resources() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const isStudent = user?.userType === "student";
  const isTeacher = user?.userType === "teacher";
  const isAdmin = user?.userType === "admin";
  const isSuperadmin = user?.userType === "superadmin";

  const { data: enrollmentsData, isLoading: loadingEnrollments } = useGetMyEnrollmentsQuery(undefined, {
    skip: !isAuthenticated || !isStudent,
  });

  const { data: coursesData, isLoading: loadingCourses } = useGetAllCoursesQuery(undefined, {
    skip: !isAuthenticated || (!isTeacher && !isAdmin && !isSuperadmin),
  });

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState("");
  const [segment, setSegment] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const courseOptions = useMemo(() => {
    if (isStudent) {
      const enrollments = enrollmentsData?.data || [];
      return enrollments
        .map((item) => {
          const course = item.courseId || item.course_id;
          const id = course?._id || course;
          const title = course?.title || item.courseTitle || "Untitled course";
          if (!id) return null;
          return { id, title };
        })
        .filter(Boolean);
    }

    if (isTeacher || isAdmin || isSuperadmin) {
      const courses = coursesData?.data || [];
      return courses
        .map((course) => {
          const id = course?._id || course?.id;
          if (!id) return null;
          return { id, title: course.title || "Untitled course" };
        })
        .filter(Boolean);
    }

    return [];
  }, [isStudent, isTeacher, isAdmin, isSuperadmin, enrollmentsData, coursesData]);

  useEffect(() => {
    if (!selectedCourseId) {
      setMaterials([]);
      setMaterialsError("");
      return;
    }

    let mounted = true;

    const fetchMaterials = async () => {
      try {
        setLoadingMaterials(true);
        setMaterialsError("");
        const res = await courseMaterialApi.getCourseMaterials(selectedCourseId);
        if (!mounted) return;
        setMaterials(res?.data?.data || []);
      } catch (error) {
        if (!mounted) return;
        setMaterials([]);
        setMaterialsError(getApiErrorMessage(error, "Failed to load materials"));
      } finally {
        if (mounted) setLoadingMaterials(false);
      }
    };

    fetchMaterials();
    return () => {
      mounted = false;
    };
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId && courseOptions.length > 0) {
      setSelectedCourseId(courseOptions[0].id);
    }
  }, [courseOptions, selectedCourseId]);

  const subjects = useMemo(() => {
    if (!materials?.length) return [];
    const set = new Set();
    materials.forEach((m) => {
      const s =
        m.subject ||
        m.subjectName ||
        m.courseSubject ||
        m.category ||
        m.topic ||
        "";
      if (s) set.add(String(s));
    });
    return Array.from(set);
  }, [materials]);

  useEffect(() => {
    if (segment !== "subject") return;
    if (selectedSubject === "all") return;
    if (!subjects.includes(selectedSubject)) setSelectedSubject("all");
  }, [segment, selectedSubject, subjects]);

  const getDateValue = (m) =>
    m.createdAt ||
    m.created_at ||
    m.updatedAt ||
    m.updated_at ||
    m.timestamp ||
    null;

  const getScoreValue = (m) => {
    const views = Number(m.views ?? m.view_count ?? 0);
    const likes = Number(m.likes ?? m.like_count ?? 0);
    const rating = Number(m.rating ?? m.score ?? 0);
    const popularity = Number(m.popularity ?? 0);
    return views + likes * 2 + rating * 10 + popularity;
  };

  const orderedMaterials = useMemo(() => {
    const base = Array.isArray(materials) ? [...materials] : [];

    // Apply ordering first, then filters to keep featured consistent.
    if (segment === "recent") {
      base.sort((a, b) => {
        const da = getDateValue(a);
        const db = getDateValue(b);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return new Date(db).getTime() - new Date(da).getTime();
      });
    } else if (segment === "popular") {
      base.sort((a, b) => getScoreValue(b) - getScoreValue(a));
    }

    // Segment "By Subject" filters but keeps existing order (so it still feels curated).
    if (segment === "subject" && selectedSubject !== "all") {
      const subjectKey = selectedSubject;
      return base.filter((m) => {
        const s =
          m.subject ||
          m.subjectName ||
          m.courseSubject ||
          m.category ||
          m.topic ||
          "";
        return String(s) === String(subjectKey);
      });
    }

    return base;
  }, [materials, segment, selectedSubject]);

  const filteredMaterials = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
    if (!q) return orderedMaterials;

    return orderedMaterials.filter((item) => {
      const title = String(item.title || item.name || "").toLowerCase();
      const desc = String(item.description || item.summary || "").toLowerCase();
      const type = String(item.type || item.resourceType || "").toLowerCase();
      return title.includes(q) || desc.includes(q) || type.includes(q);
    });
  }, [orderedMaterials, searchQuery]);

  const featured = filteredMaterials?.[0] || null;
  const rest = filteredMaterials?.slice(1) || [];

  if (!isAuthenticated) {
    return (
      <AdminLayout showSearch={false} className="p-0">
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Resources</h1>
            <p className="text-slate-600">Please login to view course materials.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const pageLoading = loadingEnrollments || loadingCourses;

  return (
    <AdminLayout showSearch={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-charcoal dark:via-deep-charcoal dark:to-navy-charcoal px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <ResourcesPoster />

          <ResourcesToolbar
            courseOptions={courseOptions}
            selectedCourseId={selectedCourseId}
            onCourseChange={(id) => setSelectedCourseId(id)}
            activeSegment={segment}
            onSegmentChange={(seg) => {
              setSegment(seg);
              if (seg !== "subject") setSelectedSubject("all");
            }}
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={(s) => setSelectedSubject(s)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            disabled={pageLoading || loadingMaterials || courseOptions.length === 0}
          />

          {/* Content */}
          {loadingMaterials ? (
            <Card className="p-10 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-studprimary dark:text-premium-gold" size={26} />
                <p className="text-slate-700 dark:text-slate-200 font-bold">
                  Loading resources...
                </p>
              </div>
            </Card>
          ) : materialsError ? (
            <Card className="p-6 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-red-200 dark:border-white/10">
              <p className="text-red-600 font-bold">{materialsError}</p>
            </Card>
          ) : rest.length === 0 && !featured ? (
            <Card className="p-10 rounded-2xl bg-white/70 dark:bg-transparent dark:dark-glass border border-slate-200 dark:border-white/10">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3 text-slate-400 dark:text-slate-500" size={54} />
                <p className="text-slate-700 dark:text-slate-200 font-bold">
                  No materials uploaded for this course yet.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Switch the course or change filters/search.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {featured ? <ResourcesFeaturedCard item={featured} /> : null}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {rest.map((item) => (
                  <ResourceCard key={item._id || item.id || `${item.title}-${item.file_url}`} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Resources;
