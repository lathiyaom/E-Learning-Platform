import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useGetCourseByIdQuery, useGetMarketplaceCoursesQuery } from "../../redux";

const formatVideoUrl = (url) => {
  if (!url) return "";

  try {
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      videoId = new URL(url).searchParams.get("v");
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch (error) {
    return url;
  }
};

export default function CardDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: courseById, isLoading: loadingById } = useGetCourseByIdQuery(id, { skip: !id });
  const { data: coursesData, isLoading: loadingCourses, error } = useGetMarketplaceCoursesQuery("popular");

  let card = location.state?.course || location.state || courseById?.data || null;

  if (!card && coursesData?.data?.length) {
    const normalizedId = String(id).toLowerCase();
    card = coursesData.data.find(
      (course) => String(course._id || course.id).toLowerCase() === normalizedId
    );
  }

  if (loadingById || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D8A25E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error loading course details</h2>
          <p className="text-gray-700 mb-6">{error?.data?.message || error?.message || "Unknown error"}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/courses")}
              className="bg-[#D8A25E] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#343131] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-[#343131] mb-4">Course not found</h2>
          <p className="text-gray-700 mb-6">
            The course you are looking for does not exist or has been removed.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/courses")}
              className="bg-[#D8A25E] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#343131] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const videoUrl = formatVideoUrl(card.videoUrl || card.video_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#D8A25E] hover:text-[#D8A25E]/80 transition-colors duration-200 mb-4"
          >
            Back to Courses
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#343131] mb-2">{card.title}</h1>
          {card.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {card.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#D8A25E]/10 text-[#343131] rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {videoUrl ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="aspect-video">
              <iframe
                src={videoUrl}
                title={card.title}
                allowFullScreen
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture,web-share"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 aspect-video flex items-center justify-center">
            <p className="text-gray-500">No video available for this course</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#343131] mb-4">About This Course</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            {card.description || card.content || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}
