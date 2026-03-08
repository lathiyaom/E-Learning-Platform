import API from "../utils/axiosintence";

export const teacherAssignmentApi = {
  // Assign teacher to organization
  assignTeacher: (teacherId) => API.post('/Admin/assign-teacher', { teacher_id: teacherId }),
  
  // Get available teachers for assignment
  getAvailableTeachers: () => API.get('/Admin/available-teachers'),
  
  // Get assigned teachers for organization
  getAssignedTeachers: () => API.get('/Admin/assigned-teachers'),
  
  // Remove teacher assignment
  removeTeacher: (teacherId) => API.delete(`/Admin/remove-teacher/${teacherId}`),
  
  // SuperAdmin: Get all teachers on platform
  getAllTeachers: () => API.get('/SuperAdmin/Teachers'),
};
