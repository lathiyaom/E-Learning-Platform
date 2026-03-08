import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { teacherAssignmentApi } from '../../../api';
import './TeacherMarketplace.css';

const TeacherMarketplace = () => {
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const [availableRes, assignedRes] = await Promise.all([
        teacherAssignmentApi.getAvailableTeachers(),
        teacherAssignmentApi.getAssignedTeachers()
      ]);

      if (availableRes.data.success) {
        setAvailableTeachers(availableRes.data.data);
      }
      if (assignedRes.data.success) {
        setAssignedTeachers(assignedRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch teachers');
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async (teacherId) => {
    try {
      setAssigning(true);
      const response = await teacherAssignmentApi.assignTeacher(teacherId);
      
      if (response.data.success) {
        toast.success('Teacher assigned successfully');
        fetchTeachers(); // Refresh both lists
      } else {
        toast.error(response.data.message || 'Failed to assign teacher');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign teacher');
      console.error('Error assigning teacher:', error);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to remove this teacher?')) {
      return;
    }

    try {
      const response = await teacherAssignmentApi.removeTeacher(teacherId);
      
      if (response.data.success) {
        toast.success('Teacher removed successfully');
        fetchTeachers(); // Refresh both lists
      } else {
        toast.error(response.data.message || 'Failed to remove teacher');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove teacher');
      console.error('Error removing teacher:', error);
    }
  };

  const TeacherCard = ({ teacher, isAssigned, onAction, actionLoading }) => (
    <div className="teacher-card">
      <div className="teacher-header">
        <div className="teacher-avatar">
          {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
        </div>
        <div className="teacher-info">
          <h3>{teacher.firstName} {teacher.lastName}</h3>
          <p className="teacher-email">{teacher.email}</p>
          {teacher.phoneNo && <p className="teacher-phone">{teacher.phoneNo}</p>}
        </div>
      </div>
      
      <div className="teacher-details">
        <div className="detail-item">
          <span className="label">Experience:</span>
          <span className="value">{teacher.experience || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Specialization:</span>
          <span className="value">{teacher.specialization || 'Not specified'}</span>
        </div>
        {teacher.bio && (
          <div className="detail-item">
            <span className="label">Bio:</span>
            <span className="value bio">{teacher.bio}</span>
          </div>
        )}
      </div>

      {isAssigned && teacher.assigned_by_admin && (
        <div className="assignment-info">
          <p>Assigned by: {teacher.assigned_by_admin.firstName} {teacher.assigned_by_admin.lastName}</p>
          <p>Assigned on: {new Date(teacher.assigned_at).toLocaleDateString()}</p>
        </div>
      )}

      <div className="teacher-actions">
        {isAssigned ? (
          <button
            className="btn btn-danger"
            onClick={() => onAction(teacher._id)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Removing...' : 'Remove Teacher'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => onAction(teacher._id)}
            disabled={actionLoading}
          >
            {actionLoading ? 'Assigning...' : 'Assign Teacher'}
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="teacher-marketplace">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-marketplace">
      <div className="marketplace-header">
        <h1>Teacher Marketplace</h1>
        <p>Manage teachers for your organization</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Teachers ({availableTeachers.length})
        </button>
        <button
          className={`tab ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned Teachers ({assignedTeachers.length})
        </button>
      </div>

      <div className="teachers-grid">
        {activeTab === 'available' ? (
          availableTeachers.length > 0 ? (
            availableTeachers.map(teacher => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                isAssigned={false}
                onAction={handleAssignTeacher}
                actionLoading={assigning}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No available teachers</h3>
              <p>There are currently no teachers available for assignment.</p>
            </div>
          )
        ) : (
          assignedTeachers.length > 0 ? (
            assignedTeachers.map(assignment => (
              <TeacherCard
                key={assignment._id}
                teacher={assignment.teacher_id}
                isAssigned={true}
                onAction={handleRemoveTeacher}
                actionLoading={assigning}
              />
            ))
          ) : (
            <div className="empty-state">
              <h3>No assigned teachers</h3>
              <p>You haven't assigned any teachers to your organization yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TeacherMarketplace;
