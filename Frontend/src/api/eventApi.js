import API from "../utils/axiosintence";

export const eventApi = {
  // Create event
  createEvent: (eventData) => API.post('/Event/create', eventData),
  
  // Get all events
  getAllEvents: (params = {}) => API.get('/Event/all', { params }),
  
  // Get single event
  getEvent: (eventId) => API.get(`/Event/${eventId}`),
  
  // Update event
  updateEvent: (eventId, eventData) => API.patch(`/Event/${eventId}`, eventData),
  
  // Delete event
  deleteEvent: (eventId) => API.delete(`/Event/${eventId}`),
  
  // Get upcoming events
  getUpcomingEvents: (params = {}) => API.get('/Event/upcoming', { params }),
  
  // Register for event
  registerForEvent: (eventId) => API.post(`/Event/${eventId}/register`),
  
  // Unregister from event
  unregisterFromEvent: (eventId) => API.post(`/Event/${eventId}/unregister`),
};
