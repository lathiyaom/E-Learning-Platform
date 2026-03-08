import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "../../utils/Adminlayoute";
import { selectCurrentUser, selectIsAuthenticated } from "../../redux/slice/authSlice";
import { useGetMyEnrollmentsQuery } from "../../redux/Apis/enrollmentApi";
import { useGetAllCoursesQuery } from "../../redux/Apis/courseApi";
import { courseMaterialApi } from "../../api";
import { getApiErrorMessage } from "../../utils/apiError";

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
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Learning Resources</h1>
          <p className="text-slate-600">
            Select a course and access uploaded PDFs, videos, and files.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={pageLoading || courseOptions.length === 0}
            className="w-full md:w-[420px] px-4 py-2 border border-slate-300 rounded-lg"
          >
            {courseOptions.length === 0 ? (
              <option value="">No courses available</option>
            ) : (
              courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {loadingMaterials ? (
            <p className="text-slate-600">Loading materials...</p>
          ) : materialsError ? (
            <p className="text-red-600">{materialsError}</p>
          ) : materials.length === 0 ? (
            <p className="text-slate-600">No materials uploaded for this course yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {materials.map((item) => (
                <div key={item._id} className="border border-slate-200 rounded-lg p-4">
                  <p className="font-semibold text-slate-900 mb-1">{item.title || "Untitled"}</p>
                  <p className="text-sm text-slate-500 mb-2">{item.description || "No description"}</p>
                  <p className="text-xs text-slate-500 mb-3 uppercase">{item.type || "file"}</p>
                  {item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Open Material
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">No file URL available</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Resources;
