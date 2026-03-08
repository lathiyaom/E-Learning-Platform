import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { eventApi } from '../../../api';
import './EventManager.css';

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getAllEvents();
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await eventApi.createEvent(eventData);
      if (response.data.success) {
        toast.success('Event created successfully');
        setShowEventModal(false);
        fetchEvents();
      } else {
        toast.error(response.data.message || 'Failed to create event');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      const response = await eventApi.updateEvent(eventId, eventData);
      if (response.data.success) {
        toast.success('Event updated successfully');
        setShowEventModal(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        toast.error(response.data.message || 'Failed to update event');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await eventApi.deleteEvent(eventId);
      if (response.data.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        toast.error(response.data.message || 'Failed to delete event');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      const response = await eventApi.registerForEvent(eventId);
      if (response.data.success) {
        toast.success('Registered for event successfully');
        fetchEvents();
      } else {
        toast.error(response.data.message || 'Failed to register');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
      console.error('Error registering:', error);
    }
  };

  const openEventModal = (event = null) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesType;
  });

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.start_date) > new Date()
  );

  const pastEvents = filteredEvents.filter(event => 
    new Date(event.start_date) <= new Date()
  );

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const getEventTypeColor = (type) => {
    const colors = {
      holiday: '#ef4444',
      exam: '#f59e0b',
      meeting: '#3b82f6',
      workshop: '#8b5cf6',
      deadline: '#ef4444',
      celebration: '#10b981',
      other: '#6b7280'
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <div className="event-manager">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-manager">
      <div className="manager-header">
        <h1>Event Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => openEventModal()}
        >
          Create Event
        </button>
      </div>

      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="type-filter">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="holiday">Holiday</option>
            <option value="exam">Exam</option>
            <option value="meeting">Meeting</option>
            <option value="workshop">Workshop</option>
            <option value="deadline">Deadline</option>
            <option value="celebration">Celebration</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events ({upcomingEvents.length})
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Events ({pastEvents.length})
        </button>
      </div>

      <div className="events-grid">
        {displayEvents.length > 0 ? (
          displayEvents.map(event => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={() => openEventModal(event)}
              onDelete={() => handleDeleteEvent(event._id)}
              onRegister={() => handleRegisterEvent(event._id)}
              typeColor={getEventTypeColor(event.event_type)}
            />
          ))
        ) : (
          <div className="empty-state">
            <h3>No events found</h3>
            <p>
              {activeTab === 'upcoming' 
                ? 'No upcoming events. Create one to get started!'
                : 'No past events.'
              }
            </p>
          </div>
        )}
      </div>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onSave={selectedEvent ? handleUpdateEvent : handleCreateEvent}
        />
      )}
    </div>
  );
};

const EventCard = ({ event, onEdit, onDelete, onRegister, typeColor }) => {
  const isUpcoming = new Date(event.start_date) > new Date();
  const isPast = new Date(event.start_date) <= new Date();
  const canRegister = event.requires_registration && isUpcoming;
  const isRegistered = false;

  return (
    <div className="event-card">
      <div className="event-header" style={{ borderLeftColor: typeColor }}>
        <div className="event-type" style={{ backgroundColor: typeColor }}>
          {event.event_type}
        </div>
        <div className="event-status">
          {isUpcoming ? 'Upcoming' : isPast ? 'Completed' : 'Ongoing'}
        </div>
      </div>

      <div className="event-content">
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        
        <div className="event-details">
          <div className="detail-item">
            <span className="icon">📅</span>
            <span>{new Date(event.start_date).toLocaleDateString()}</span>
          </div>
          {event.start_date && (
            <div className="detail-item">
              <span className="icon">⏰</span>
              <span>{new Date(event.start_date).toLocaleTimeString()}</span>
            </div>
          )}
          {event.location && (
            <div className="detail-item">
              <span className="icon">📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.target_role && event.target_role !== 'all' && (
            <div className="detail-item">
              <span className="icon">👥</span>
              <span>For: {event.target_role}s</span>
            </div>
          )}
        </div>

        {event.requires_registration && (
          <div className="registration-info">
            <span className="participants">
              {event.current_participants || 0} / {event.max_participants || '∞'} registered
            </span>
            {event.max_participants && (
              <div className="registration-bar">
                <div
                  className="registration-fill"
                  style={{ 
                    width: `${Math.min((event.current_participants / event.max_participants) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="event-actions">
        <button className="btn btn-secondary" onClick={onEdit}>
          Edit
        </button>
        {canRegister && !isRegistered && (
          <button className="btn btn-primary" onClick={onRegister}>
            Register
          </button>
        )}
        {canRegister && isRegistered && (
          <button className="btn btn-success" disabled>
            Registered
          </button>
        )}
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

const EventModal = ({ event, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'meeting',
    start_date: event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
    end_date: event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    target_role: event?.target_role || 'all',
    requires_registration: event?.requires_registration || false,
    max_participants: event?.max_participants || '',
    is_public: event?.is_public !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      start_date: new Date(formData.start_date),
      end_date: new Date(formData.end_date),
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
    };
    
    if (event) {
      onSave(event._id, eventData);
    } else {
      onSave(eventData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content event-modal">
        <div className="modal-header">
          <h3>{event ? 'Edit Event' : 'Create Event'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Event Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Event Type *</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                required
              >
                <option value="holiday">Holiday</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="workshop">Workshop</option>
                <option value="deadline">Deadline</option>
                <option value="celebration">Celebration</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Event location or 'Online'"
              />
            </div>
            <div className="form-group">
              <label>Target Audience</label>
              <select
                value={formData.target_role}
                onChange={(e) => setFormData({...formData, target_role: e.target.value})}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.requires_registration}
                  onChange={(e) => setFormData({...formData, requires_registration: e.target.checked})}
                />
                Requires Registration
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                />
                Public Event
              </label>
            </div>
          </div>

          {formData.requires_registration && (
            <div className="form-group">
              <label>Max Participants (Optional)</label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventManager;
