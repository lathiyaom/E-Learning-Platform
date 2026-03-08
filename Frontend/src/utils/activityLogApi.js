import API from "./axiosintence";

// Activity Log API endpoints
export const activityLogApi = {
  // Get activity logs
  getLogs: (params = {}) => {
    return API.get("/ActivityLog/Logs", { params });
  },

  // Get activity statistics
  getStats: (params = {}) => {
    return API.get("/ActivityLog/Stats", { params });
  },

  // Export logs to CSV
  exportLogs: (params = {}) => {
    return API.get("/ActivityLog/Export", { 
      params,
      responseType: 'blob' // Important for file download
    });
  },
};

export default activityLogApi;
