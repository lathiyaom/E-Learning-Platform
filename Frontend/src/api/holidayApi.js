import API from "../utils/axiosintence";

export const holidayApi = {
  // Create holiday
  createHoliday: (holidayData) => API.post('/Holiday/create', holidayData),
  
  // Get all holidays
  getAllHolidays: (params = {}) => API.get('/Holiday/all', { params }),
  
  // Get single holiday
  getHoliday: (holidayId) => API.get(`/Holiday/${holidayId}`),
  
  // Update holiday
  updateHoliday: (holidayId, holidayData) => API.patch(`/Holiday/${holidayId}`, holidayData),
  
  // Delete holiday
  deleteHoliday: (holidayId) => API.delete(`/Holiday/${holidayId}`),
  
  // Get upcoming holidays
  getUpcomingHolidays: (params = {}) => API.get('/Holiday/upcoming', { params }),
  
  // Get calendar holidays by year/month
  getCalendarHolidays: (year, month) => API.get(`/Holiday/calendar/${year}/${month}`),
};
