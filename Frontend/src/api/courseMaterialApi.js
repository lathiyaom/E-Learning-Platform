import API from "../utils/axiosintence";

export const courseMaterialApi = {
  // Upload course material
  uploadMaterial: (formData) => API.post('/Material/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Get materials for a course
  getCourseMaterials: (courseId) => API.get(`/Material/course/${courseId}`),
  
  // Update material
  updateMaterial: (materialId, data) => API.patch(`/Material/${materialId}`, data),
  
  // Delete material
  deleteMaterial: (materialId) => API.delete(`/Material/${materialId}`),
};
