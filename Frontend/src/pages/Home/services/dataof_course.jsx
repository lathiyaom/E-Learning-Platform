import { useGetAllCoursesQuery } from "../../../redux/Apis/courseApi";

const CoursesSection = () => {
  // Fetch courses from API
  const { data, isLoading, isError } = useGetAllCoursesQuery('popular');
  
  const courses = data?.data?.slice(0, 6) || []; // Get first 6 courses

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-600">Loading courses...</p>
      </div>
    );
  }

  if (isError || courses.length === 0) {
    return null; // Don't show section if no courses
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <span className="text-xs font-semibold text-primary uppercase">{course.category}</span>
            <h3 className="text-lg font-bold mt-2 mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{course.rating}</span>
                <span className="text-gray-500 text-sm">({course.reviewCount})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {course.tags?.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-bold">
                {course.isPaid ? `$${course.priceUSD}` : 'FREE'}
              </span>
              <button 
                onClick={() => window.location.href = `/courses/${course._id}`}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
              >
                Know More
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursesSection;

