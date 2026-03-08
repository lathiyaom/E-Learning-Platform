import API from "../utils/axiosintence";

export const progressApi = {
  // Mark lecture as complete
  markComplete: (lectureId, courseId) => API.post('/Progress/complete', { 
    lecture_id: lectureId, 
    course_id: courseId 
  }),
  
  // Get progress for a course
  getCourseProgress: (courseId) => API.get(`/Progress/course/${courseId}`),
  
  // Update lecture progress
  updateLectureProgress: (lectureId, data) => API.patch(`/Progress/${lectureId}`, data),
  
  // Get specific lecture progress
  getLectureProgress: (lectureId) => API.get(`/Progress/${lectureId}`),
};
