import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { courseApi, courseMaterialApi, enrollmentApi } from '../../api';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const coursesRes = await courseApi.getAllCourses();
      
      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
        if (coursesRes.data.data.length > 0) {
          setSelectedCourse(coursesRes.data.data[0]);
          await fetchCourseMaterials(coursesRes.data.data[0]._id);
          await fetchCourseStudents(coursesRes.data.data[0]._id);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseMaterials = async (courseId) => {
    try {
      const response = await courseMaterialApi.getCourseMaterials(courseId);
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    try {
      const response = await enrollmentApi.getCourseEnrollments(courseId);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchCourseMaterials(course._id);
    fetchCourseStudents(course._id);
  };

  const handleMaterialUpload = async (formData) => {
    try {
      const response = await courseMaterialApi.uploadMaterial(formData);
      if (response.data.success) {
        toast.success('Material uploaded successfully');
        setShowUploadModal(false);
        fetchCourseMaterials(selectedCourse._id);
      } else {
        toast.error(response.data.message || 'Failed to upload material');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload material');
      console.error('Error uploading material:', error);
    }
  };

  const handleMaterialDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const response = await courseMaterialApi.deleteMaterial(materialId);
      if (response.data.success) {
        toast.success('Material deleted successfully');
        fetchCourseMaterials(selectedCourse._id);
      } else {
        toast.error(response.data.message || 'Failed to delete material');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
      console.error('Error deleting material:', error);
    }
  };

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p>Manage your courses and materials</p>
      </div>

      <div className="courses-selector">
        <h3>Your Courses</h3>
        <div className="courses-list">
          {courses.map(course => (
            <div
              key={course._id}
              className={`course-item ${selectedCourse?._id === course._id ? 'active' : ''}`}
              onClick={() => handleCourseSelect(course)}
            >
              <h4>{course.title}</h4>
              <p>{course.description}</p>
              <div className="course-stats">
                <span>{students.length} students</span>
                <span>{materials.length} materials</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCourse && (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              Course Overview
            </button>
            <button
              className={`tab ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              Materials ({materials.length})
            </button>
            <button
              className={`tab ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              Students ({students.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'courses' && (
              <div className="course-overview">
                <div className="course-header">
                  <h2>{selectedCourse.title}</h2>
                  <p>{selectedCourse.description}</p>
                  <div className="course-meta">
                    <span className="category">{selectedCourse.category}</span>
                    <span className="rating">⭐ {selectedCourse.rating || 0}</span>
                    <span className="price">${selectedCourse.price || 0}</span>
                  </div>
                </div>
                
                <div className="course-stats-grid">
                  <div className="stat-card">
                    <h3>{students.length}</h3>
                    <p>Total Students</p>
                  </div>
                  <div className="stat-card">
                    <h3>{materials.length}</h3>
                    <p>Course Materials</p>
                  </div>
                  <div className="stat-card">
                    <h3>{selectedCourse.reviewCount || 0}</h3>
                    <p>Reviews</p>
                  </div>
                  <div className="stat-card">
                    <h3>{selectedCourse.rating || 0}</h3>
                    <p>Average Rating</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="materials-section">
                <div className="section-header">
                  <h3>Course Materials</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload Material
                  </button>
                </div>
                
                <div className="materials-grid">
                  {materials.length > 0 ? (
                    materials.map(material => (
                      <div key={material._id} className="material-card">
                        <div className="material-icon">
                          {material.type === 'video' ? '🎥' : material.type === 'pdf' ? '📄' : '📄'}
                        </div>
                        <div className="material-info">
                          <h4>{material.title}</h4>
                          <p>{material.description}</p>
                          <div className="material-meta">
                            <span>{material.type}</span>
                            <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="material-actions">
                          <button className="btn btn-sm btn-secondary">View</button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleMaterialDelete(material._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <h3>No materials yet</h3>
                      <p>Upload your first course material to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="students-section">
                <div className="section-header">
                  <h3>Enrolled Students</h3>
                </div>
                
                <div className="students-grid">
                  {students.length > 0 ? (
                    students.map(enrollment => (
                      <div key={enrollment._id} className="student-card">
                        <div className="student-avatar">
                          {enrollment.student_id?.firstName?.charAt(0)}{enrollment.student_id?.lastName?.charAt(0)}
                        </div>
                        <div className="student-info">
                          <h4>{enrollment.student_id?.firstName} {enrollment.student_id?.lastName}</h4>
                          <p>{enrollment.student_id?.email}</p>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${enrollment.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{enrollment.progress || 0}% Complete</span>
                        </div>
                        <div className="student-actions">
                          <button className="btn btn-sm btn-primary">View Progress</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <h3>No students enrolled yet</h3>
                      <p>Students will appear here once they enroll in your course.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showUploadModal && (
        <MaterialUploadModal
          courseId={selectedCourse._id}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleMaterialUpload}
        />
      )}
    </div>
  );
};

const MaterialUploadModal = ({ courseId, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', formData.file);
    uploadFormData.append('course_id', courseId);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('type', formData.type);

    await onUpload(uploadFormData);
    setUploading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Upload Course Material</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div className="form-group">
            <label>File</label>
            <input
              type="file"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDashboard;
