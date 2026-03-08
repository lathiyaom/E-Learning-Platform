import API from "./axiosintence.jsx";

// Admin API endpoints
export const adminApi = {
  // Get all users within tenant
  getMyUsers: (params = {}) => {
    return API.get("/Admin/MyUsers", { params });
  },

  // Get specific user by ID
  getUserById: (id) => {
    return API.get(`/Admin/MyUsers/${id}`);
  },

  // Create new user
  createUser: (userData) => {
    return API.post("/Admin/CreateUser", userData);
  },

  // Update user
  updateUser: (id, userData) => {
    return API.patch(`/Admin/UpdateUser/${id}`, userData);
  },

  // Suspend user
  suspendUser: (id) => {
    return API.patch(`/Admin/SuspendUser/${id}`);
  },

  // Activate user
  activateUser: (id) => {
    return API.patch(`/Admin/ActivateUser/${id}`);
  },

  // Delete user
  deleteUser: (id) => {
    return API.delete(`/Admin/DeleteUser/${id}`);
  },
};

export default adminApi;
