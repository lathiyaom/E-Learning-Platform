import API from "../utils/axiosintence";

export const courseApi = {
  getAllCourses: (params = {}) => API.get("/Course/All", { params }),
  getMarketplaceCourses: (params = {}) => API.get("/Course/Marketplace", { params }),
  getCourseById: (courseId) => API.get(`/Course/${courseId}`),
  createCourse: (data) => API.post("/Course/Create", data),
  updateCourse: (courseId, data) => API.patch(`/Course/Update/${courseId}`, data),
  deleteCourse: (courseId) => API.delete(`/Course/Delete/${courseId}`),
};
