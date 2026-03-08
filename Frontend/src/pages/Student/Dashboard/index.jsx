import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { courseApi, enrollmentApi, progressApi } from '../../api';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        courseApi.getAllCourses(),
        enrollmentApi.getMyCourses()
      ]);

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
      }
      if (enrollmentsRes.data?.success) {
        setMyEnrollments(enrollmentsRes.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      const response = await enrollmentApi.enrollCourse(courseId);
      if (response.data.success) {
        toast.success('Enrolled successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        toast.error(response.data.message || 'Failed to enroll');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
      console.error('Error enrolling:', error);
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleViewProgress = async (enrollment) => {
    try {
      const course = enrollment.course_id || enrollment.courseId || {};
      const courseId = course._id || enrollment.course_id || enrollment.courseId;
      const response = await progressApi.getCourseProgress(courseId);
      if (response.data.success) {
        setSelectedCourse({
          ...course,
          progress: response.data.data.course_progress ?? 0,
          total_lectures: response.data.data.total_lectures,
          completed_lectures: response.data.data.completed_lectures,
          materials: response.data.data.progress || []
        });
        setShowCourseModal(true);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(courses.map(course => course.category))];

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Browse courses and track your learning progress</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>{myEnrollments.length}</h3>
          <p>Enrolled Courses</p>
        </div>
        <div className="stat-card">
          <h3>{myEnrollments.filter(e => e.status === 'completed').length}</h3>
          <p>Completed Courses</p>
        </div>
        <div className="stat-card">
          <h3>{courses.length}</h3>
          <p>Available Courses</p>
        </div>
        <div className="stat-card">
          <h3>{Math.round(myEnrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / Math.max(myEnrollments.length, 1))}%</h3>
          <p>Average Progress</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Courses
        </button>
        <button
          className={`tab ${activeTab === 'my-courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-courses')}
        >
          My Courses ({myEnrollments.length})
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="browse-section">
          <div className="filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filter">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={myEnrollments.some(e => (e.course_id?._id || e.courseId?._id || e.course_id || e.courseId) === course._id)}
                  onEnroll={() => handleEnrollCourse(course._id)}
                  onView={() => handleViewCourse(course)}
                />
              ))
            ) : (
              <div className="empty-state">
                <h3>No courses found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-courses' && (
        <div className="my-courses-section">
          <div className="courses-grid">
            {myEnrollments.length > 0 ? (
              myEnrollments.map(enrollment => (
                <EnrollmentCard
                  key={enrollment._id}
                  enrollment={enrollment}
                  onViewProgress={() => handleViewProgress(enrollment)}
                />
              ))
            ) : (
              <div className="empty-state">
                <h3>No enrolled courses</h3>
                <p>Browse courses and enroll to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showCourseModal && selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setShowCourseModal(false)}
          onEnroll={() => handleEnrollCourse(selectedCourse._id)}
          isEnrolled={myEnrollments.some(e => (e.course_id?._id || e.courseId?._id || e.course_id || e.courseId) === selectedCourse._id)}
        />
      )}
    </div>
  );
};

const CourseCard = ({ course, isEnrolled, onEnroll, onView }) => {
  return (
    <div className="course-card">
      <div className="course-image">
        <img src={course.image || '/placeholder-course.jpg'} alt={course.title} />
        <div className="course-overlay">
          <button className="btn btn-primary" onClick={onView}>
            View Details
          </button>
        </div>
      </div>
      <div className="course-content">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-meta">
          <span className="category">{course.category}</span>
          <span className="rating">⭐ {course.rating || 0}</span>
          <span className="price">${course.price || 0}</span>
        </div>
        <div className="course-info">
          <span>By: {course.teacher_id?.firstName} {course.teacher_id?.lastName}</span>
          <span>{course.reviewCount || 0} reviews</span>
        </div>
        <div className="course-actions">
          {isEnrolled ? (
            <button className="btn btn-secondary" onClick={onView}>
              View Course
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onEnroll}>
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EnrollmentCard = ({ enrollment, onViewProgress }) => {
  const progress = enrollment.progress || 0;
  
  return (
    <div className="enrollment-card">
      <div className="course-image">
        <img src={enrollment.course_id?.image || '/placeholder-course.jpg'} alt={enrollment.course_id?.title} />
        <div className="progress-badge">
          {progress}% Complete
        </div>
      </div>
      <div className="course-content">
        <h3>{enrollment.course_id?.title}</h3>
        <p>{enrollment.course_id?.description}</p>
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}% Complete</span>
        </div>
        <div className="enrollment-info">
          <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
          <span>Status: {enrollment.status}</span>
        </div>
        <div className="course-actions">
          <button className="btn btn-primary" onClick={onViewProgress}>
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseModal = ({ course, onClose, onEnroll, isEnrolled }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content course-modal">
        <div className="modal-header">
          <h2>{course.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="course-details">
          <div className="course-image-large">
            <img src={course.image || '/placeholder-course.jpg'} alt={course.title} />
          </div>
          
          <div className="course-info">
            <p className="description">{course.description}</p>
            
            <div className="course-stats">
              <div className="stat-item">
                <span className="label">Category:</span>
                <span className="value">{course.category}</span>
              </div>
              <div className="stat-item">
                <span className="label">Instructor:</span>
                <span className="value">{course.teacher_id?.firstName} {course.teacher_id?.lastName}</span>
              </div>
              <div className="stat-item">
                <span className="label">Rating:</span>
                <span className="value">⭐ {course.rating || 0} ({course.reviewCount || 0} reviews)</span>
              </div>
              <div className="stat-item">
                <span className="label">Price:</span>
                <span className="value">${course.price || 0}</span>
              </div>
            </div>
            
            {course.progress !== undefined && (
              <div className="progress-section">
                <h4>Your Progress</h4>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {course.completed_lectures || 0} / {course.total_lectures || 0} lectures completed
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          {isEnrolled ? (
            <button className="btn btn-primary" onClick={onClose}>
              Continue Learning
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onEnroll}>
              Enroll Now - ${course.price || 0}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
