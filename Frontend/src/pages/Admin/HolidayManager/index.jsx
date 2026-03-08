import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { holidayApi } from '../../../api';
import './HolidayManager.css';

const HolidayManager = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await holidayApi.getAllHolidays();
      if (response.data.success) {
        setHolidays(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch holidays');
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHoliday = async (holidayData) => {
    try {
      const response = await holidayApi.createHoliday(holidayData);
      if (response.data.success) {
        toast.success('Holiday created successfully');
        setShowHolidayModal(false);
        fetchHolidays();
      } else {
        toast.error(response.data.message || 'Failed to create holiday');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create holiday');
      console.error('Error creating holiday:', error);
    }
  };

  const handleUpdateHoliday = async (holidayId, holidayData) => {
    try {
      const response = await holidayApi.updateHoliday(holidayId, holidayData);
      if (response.data.success) {
        toast.success('Holiday updated successfully');
        setShowHolidayModal(false);
        setSelectedHoliday(null);
        fetchHolidays();
      } else {
        toast.error(response.data.message || 'Failed to update holiday');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update holiday');
      console.error('Error updating holiday:', error);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      const response = await holidayApi.deleteHoliday(holidayId);
      if (response.data.success) {
        toast.success('Holiday deleted successfully');
        fetchHolidays();
      } else {
        toast.error(response.data.message || 'Failed to delete holiday');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete holiday');
      console.error('Error deleting holiday:', error);
    }
  };

  const openHolidayModal = (holiday = null) => {
    setSelectedHoliday(holiday);
    setShowHolidayModal(true);
  };

  const getHolidayTypeColor = (type) => {
    const colors = {
      public: '#ef4444',
      restricted: '#f59e0b',
      optional: '#10b981'
    };
    return colors[type] || colors.optional;
  };

  const getHolidaysForMonth = (year, month) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getFullYear() === year && holidayDate.getMonth() + 1 === month;
    });
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const monthHolidays = getHolidaysForMonth(currentYear, currentMonth);
    const today = new Date();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth - 1, day);
      const dateString = currentDate.toDateString();
      const holiday = monthHolidays.find(h => new Date(h.date).toDateString() === dateString);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      days.push(
        <div
          key={day}
          className={`calendar-day ${holiday ? 'holiday' : ''} ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
          onClick={() => holiday && openHolidayModal(holiday)}
        >
          <div className="day-number">{day}</div>
          {holiday && (
            <div className="holiday-indicator" style={{ backgroundColor: getHolidayTypeColor(holiday.holiday_type) }}>
              {holiday.title}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="holiday-manager">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading holidays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="holiday-manager">
      <div className="manager-header">
        <h1>Holiday Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => openHolidayModal()}
        >
          Add Holiday
        </button>
      </div>

      <div className="view-tabs">
        <button
          className={`tab ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView('list')}
        >
          List View
        </button>
        <button
          className={`tab ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveView('calendar')}
        >
          Calendar View
        </button>
      </div>

      {activeView === 'list' && (
        <div className="holidays-list">
          <div className="list-header">
            <h3>All Holidays ({holidays.length})</h3>
            <div className="year-filter">
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              >
                <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
              </select>
            </div>
          </div>

          <div className="holidays-grid">
            {holidays.length > 0 ? (
              holidays
                .filter(holiday => new Date(holiday.date).getFullYear() === currentYear)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(holiday => (
                  <HolidayCard
                    key={holiday._id}
                    holiday={holiday}
                    onEdit={() => openHolidayModal(holiday)}
                    onDelete={() => handleDeleteHoliday(holiday._id)}
                    typeColor={getHolidayTypeColor(holiday.holiday_type)}
                  />
                ))
            ) : (
              <div className="empty-state">
                <h3>No holidays found</h3>
                <p>Add holidays to see them here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'calendar' && (
        <div className="calendar-view">
          <div className="calendar-header">
            <button
              className="nav-btn"
              onClick={() => {
                if (currentMonth === 1) {
                  setCurrentMonth(12);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
            >
              ←
            </button>
            <h3>
              {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h3>
            <button
              className="nav-btn"
              onClick={() => {
                if (currentMonth === 12) {
                  setCurrentMonth(1);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
            >
              →
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-day-header">Sun</div>
            <div className="calendar-day-header">Mon</div>
            <div className="calendar-day-header">Tue</div>
            <div className="calendar-day-header">Wed</div>
            <div className="calendar-day-header">Thu</div>
            <div className="calendar-day-header">Fri</div>
            <div className="calendar-day-header">Sat</div>
            
            {renderCalendar()}
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Public Holiday</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Restricted Holiday</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
              <span>Optional Holiday</span>
            </div>
          </div>
        </div>
      )}

      {showHolidayModal && (
        <HolidayModal
          holiday={selectedHoliday}
          onClose={() => {
            setShowHolidayModal(false);
            setSelectedHoliday(null);
          }}
          onSave={selectedHoliday ? handleUpdateHoliday : handleCreateHoliday}
        />
      )}
    </div>
  );
};

const HolidayCard = ({ holiday, onEdit, onDelete, typeColor }) => {
  const isUpcoming = new Date(holiday.date) > new Date();
  const isPast = new Date(holiday.date) <= new Date();

  return (
    <div className="holiday-card">
      <div className="holiday-header" style={{ borderLeftColor: typeColor }}>
        <div className="holiday-type" style={{ backgroundColor: typeColor }}>
          {holiday.holiday_type}
        </div>
        <div className="holiday-status">
          {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Today'}
        </div>
      </div>

      <div className="holiday-content">
        <h3>{holiday.title}</h3>
        {holiday.description && <p>{holiday.description}</p>}
        
        <div className="holiday-details">
          <div className="detail-item">
            <span className="icon">📅</span>
            <span>{new Date(holiday.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          {holiday.affects_roles && holiday.affects_roles.length > 0 && (
            <div className="detail-item">
              <span className="icon">👥</span>
              <span>Affects: {holiday.affects_roles.join(', ')}</span>
            </div>
          )}
          {holiday.is_recurring && (
            <div className="detail-item">
              <span className="icon">🔄</span>
              <span>Recurring: {holiday.recurring_pattern}</span>
            </div>
          )}
        </div>
      </div>

      <div className="holiday-actions">
        <button className="btn btn-secondary" onClick={onEdit}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

const HolidayModal = ({ holiday, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: holiday?.title || '',
    date: holiday?.date ? new Date(holiday.date).toISOString().slice(0, 10) : '',
    holiday_type: holiday?.holiday_type || 'public',
    affects_roles: holiday?.affects_roles || ['all'],
    is_recurring: holiday?.is_recurring || false,
    recurring_pattern: holiday?.recurring_pattern || 'yearly',
    recurring_end_date: holiday?.recurring_end_date ? new Date(holiday.recurring_end_date).toISOString().slice(0, 10) : '',
    description: holiday?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const holidayData = {
      ...formData,
      date: new Date(formData.date),
      recurring_end_date: formData.recurring_end_date ? new Date(formData.recurring_end_date) : null
    };
    
    if (holiday) {
      onSave(holiday._id, holidayData);
    } else {
      onSave(holidayData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content holiday-modal">
        <div className="modal-header">
          <h3>{holiday ? 'Edit Holiday' : 'Add Holiday'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Holiday Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Holiday Type *</label>
              <select
                value={formData.holiday_type}
                onChange={(e) => setFormData({...formData, holiday_type: e.target.value})}
                required
              >
                <option value="public">Public Holiday</option>
                <option value="restricted">Restricted Holiday</option>
                <option value="optional">Optional Holiday</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              placeholder="Holiday description (optional)"
            />
          </div>

          <div className="form-group">
            <label>Affects Roles</label>
            <div className="checkbox-group">
              {['all', 'student', 'teacher', 'admin'].map(role => (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={formData.affects_roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          affects_roles: formData.affects_roles.includes('all') ? [role] : [...formData.affects_roles, role]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          affects_roles: formData.affects_roles.filter(r => r !== role)
                        });
                      }
                    }}
                  />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
              />
              Recurring Holiday
            </label>
          </div>

          {formData.is_recurring && (
            <>
              <div className="form-group">
                <label>Recurring Pattern</label>
                <select
                  value={formData.recurring_pattern}
                  onChange={(e) => setFormData({...formData, recurring_pattern: e.target.value})}
                >
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Recurring End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.recurring_end_date}
                  onChange={(e) => setFormData({...formData, recurring_end_date: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {holiday ? 'Update Holiday' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayManager;
