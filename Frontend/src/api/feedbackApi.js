import API from "../utils/axiosintence";

export const feedbackApi = {
  createFeedback: (data) => API.post("/Feedback/create", data),
  getCourseFeedback: (courseId) => API.get(`/Feedback/course/${courseId}`),
};
