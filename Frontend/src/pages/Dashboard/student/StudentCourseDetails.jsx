import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Star,
  Download,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useGetCourseByIdQuery } from "../../../redux/Apis/courseApi";
import { getLecturesByCourse } from "../../../redux/Apis/lectureApi";

export default function StudentCourseDetails() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: courseData, isLoading: loadingCourse } = useGetCourseByIdQuery(courseId);
  const { lectures, loading: loadingLectures } = useSelector((state) => state.lecture);

  useEffect(() => {
    if (courseId) {
      dispatch(getLecturesByCourse({ courseId, page: 1, limit: 100 }));
    }
  }, [courseId, dispatch]);

  if (loadingCourse || loadingLectures) {
    return (
      <div className="p-8 min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  const course = courseData?.data || {};
  const lectureList = lectures || [];

  return (
    <div className="p-8 min-h-screen bg-slate-100">
      <h1 className="text-3xl font-bold mb-1">{course.title || "Course Details"}</h1>
      <p className="mb-6">
        Instructor: <b>{course.instructor || "N/A"}</b>
      </p>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat title="Progress" value={`${course.progress || 0}%`} icon={<CheckCircle />} />
        <Stat title="Duration" value={`${course.duration || 0} weeks`} icon={<Clock />} />
        <Stat title="Rating" value={course.rating || "N/A"} icon={<Star />} />
        <Stat title="Students" value={course.enrolledCount || 0} icon={<Users />} />
      </div>

      {/* TABS */}
      <div className="bg-white rounded shadow">
        <div className="flex border-b">
          {["overview", "lectures", "materials"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 p-4 capitalize ${
                activeTab === t ? "border-b-2 border-blue-500 font-bold" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <p className="mb-6">{course.description || "No description available"}</p>
              <div className="grid grid-cols-3 gap-4">
                <Mini title="Lectures" value={lectureList.length} icon={<BookOpen />} />
                <Mini title="Duration" value={`${course.duration || 0} weeks`} icon={<Clock />} />
                <Mini title="Students" value={course.enrolledCount || 0} icon={<Users />} />
              </div>
            </div>
          )}

          {/* LECTURES */}
          {activeTab === "lectures" && (
            <>
              {lectureList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No lectures available</p>
              ) : (
                lectureList.map((l) => (
                  <div key={l._id} className="border p-4 mb-3 rounded flex justify-between">
                    <div>
                      <b>{l.title}</b>
                      <p className="text-sm">
                        {new Date(l.date).toLocaleDateString()} • {l.duration || 0} min
                      </p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* MATERIALS */}
          {activeTab === "materials" && (
            <>
              {!course.materials || course.materials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No materials available</p>
              ) : (
                course.materials.map((m, i) => (
                  <div key={i} className="border p-4 mb-3 rounded flex justify-between">
                    <div>
                      <b>{m.name}</b>
                      <p className="text-sm">{m.type}</p>
                    </div>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-4 py-2 rounded flex gap-2 items-center"
                    >
                      <Download size={16} /> Download
                    </a>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const Stat = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded shadow flex justify-between">
    <div>
      <p className="text-sm">{title}</p>
      <b className="text-2xl">{value}</b>
    </div>
    {icon}
  </div>
);

const Mini = ({ title, value, icon }) => (
  <div className="bg-slate-200 p-4 rounded">
    {icon}
    <p className="text-sm">{title}</p>
    <b>{value}</b>
  </div>
);
