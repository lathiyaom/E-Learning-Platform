import API from "../utils/axiosintence";

export const enrollmentApi = {
  // Enroll in a course
  enrollCourse: (courseId) => API.post('/Enrollment/enroll', { course_id: courseId }),
  
  // Get student's enrollments
  getMyCourses: (params = {}) => API.get('/Enrollment/my-courses', { params }),

  // Get course enrollments
  getCourseEnrollments: (courseId, params = {}) => API.get(`/Enrollment/course/${courseId}`, { params }),
  
  // Get enrollment details
  getEnrollmentDetails: (enrollmentId) => API.get(`/Enrollment/${enrollmentId}`),
  
  // Update enrollment progress
  updateProgress: (enrollmentId, data) => API.patch(`/Enrollment/progress/${enrollmentId}`, data),
  
  // Rate and review course (via feedback service)
  submitReview: (_enrollmentId, data) =>
    API.post("/Feedback/create", {
      courseId: data.courseId,
      rating: data.rating,
      comment: data.review ?? data.comment ?? "",
    }),
  
  // Drop enrollment
  dropEnrollment: (enrollmentId) => API.patch(`/Enrollment/drop/${enrollmentId}`),
};
