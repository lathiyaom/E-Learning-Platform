import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { progressApi, courseMaterialApi } from '../../api';
import './ProgressTracker.css';

const ProgressTracker = ({ enrollment, user }) => {
  const [courseProgress, setCourseProgress] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    if (enrollment) {
      fetchProgressData();
    }
  }, [enrollment]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const courseId = enrollment?.course_id?._id || enrollment?.courseId?._id || enrollment?.course_id || enrollment?.courseId;
      if (!courseId) {
        setCourseProgress(null);
        setMaterials([]);
        return;
      }

      const [progressRes, materialsRes] = await Promise.all([
        progressApi.getCourseProgress(courseId),
        courseMaterialApi.getCourseMaterials(courseId)
      ]);

      if (progressRes.data.success) {
        setCourseProgress({
          ...progressRes.data.data,
          progress: progressRes.data.data.course_progress ?? 0,
        });
      }
      if (materialsRes.data.success) {
        setMaterials(materialsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch progress data');
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialComplete = async (materialId) => {
    try {
      const courseId = enrollment?.course_id?._id || enrollment?.courseId?._id || enrollment?.course_id || enrollment?.courseId;
      const response = await progressApi.markComplete(materialId, courseId);
      if (response.data.success) {
        toast.success('Material marked as complete!');
        fetchProgressData(); // Refresh data
        if (selectedMaterial?._id === materialId) {
          setSelectedMaterial(null);
        }
      } else {
        toast.error(response.data.message || 'Failed to mark complete');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark complete');
      console.error('Error marking complete:', error);
    }
  };

  const handleProgressUpdate = async (materialId, progressData) => {
    try {
      const response = await progressApi.updateLectureProgress(materialId, progressData);
      if (response.data.success) {
        // Update local state
        setMaterials(materials.map(mat => 
          mat._id === materialId 
            ? { ...mat, progress: response.data.data }
            : mat
        ));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="progress-tracker">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading progress...</p>
        </div>
      </div>
    );
  }

  if (!courseProgress) {
    return (
      <div className="progress-tracker">
        <div className="empty-state">
          <h3>No progress data available</h3>
          <p>Start learning to see your progress here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h2>Course Progress</h2>
        <div className="overall-progress">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${courseProgress.progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {courseProgress.progress}%
              </text>
            </svg>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="value">{courseProgress.completed_lectures || 0}</span>
              <span className="label">Completed</span>
            </div>
            <div className="stat">
              <span className="value">{courseProgress.total_lectures || 0}</span>
              <span className="label">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="materials-list">
        <h3>Course Materials</h3>
        <div className="materials-grid">
          {materials.length > 0 ? (
            materials.map(material => (
              <MaterialCard
                key={material._id}
                material={material}
                progress={courseProgress.progress}
                onComplete={() => handleMaterialComplete(material._id)}
                onUpdate={(data) => handleProgressUpdate(material._id, data)}
                onSelect={() => setSelectedMaterial(material)}
                isSelected={selectedMaterial?._id === material._id}
              />
            ))
          ) : (
            <div className="empty-materials">
              <h3>No materials available</h3>
              <p>This course doesn't have any materials yet.</p>
            </div>
          )}
        </div>
      </div>

      {selectedMaterial && (
        <MaterialViewer
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          onComplete={() => handleMaterialComplete(selectedMaterial._id)}
          onUpdate={(data) => handleProgressUpdate(selectedMaterial._id, data)}
        />
      )}
    </div>
  );
};

const MaterialCard = ({ material, progress, onComplete, onUpdate, onSelect, isSelected }) => {
  const [localProgress, setLocalProgress] = useState(material.progress || 0);
  const isCompleted = localProgress >= 100;

  const handleProgressChange = (newProgress) => {
    setLocalProgress(newProgress);
    onUpdate({ completion_percentage: newProgress });
  };

  return (
    <div className={`material-card ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="material-header" onClick={onSelect}>
        <div className="material-icon">
          {material.type === 'video' ? '🎥' : material.type === 'pdf' ? '📄' : '📄'}
        </div>
        <div className="material-info">
          <h4>{material.title}</h4>
          <p>{material.description}</p>
          <div className="material-meta">
            <span>{material.type}</span>
            <span>{material.duration ? `${Math.round(material.duration / 60)} min` : 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div className="material-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${localProgress}%` }}
          ></div>
        </div>
        <span className="progress-text">{Math.round(localProgress)}%</span>
      </div>

      <div className="material-actions">
        <button className="btn btn-secondary" onClick={onSelect}>
          {isCompleted ? 'Review' : 'Start'}
        </button>
        {!isCompleted && localProgress >= 80 && (
          <button className="btn btn-success" onClick={onComplete}>
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
};

const MaterialViewer = ({ material, onClose, onComplete, onUpdate }) => {
  const [watchTime, setWatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (material.type === 'video' && isPlaying) {
      const interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          const progress = (newTime / material.duration) * 100;
          onUpdate({ 
            watch_time: newTime,
            completion_percentage: Math.min(progress, 100)
          });
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, material.duration, onUpdate]);

  const renderMaterialContent = () => {
    switch (material.type) {
      case 'video':
        return (
          <div className="video-player">
            <video
              src={material.file_url}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="video-element"
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="pdf-viewer">
            <iframe
              src={material.file_url}
              className="pdf-iframe"
              title={material.title}
            />
          </div>
        );
      default:
        return (
          <div className="document-viewer">
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="document-link"
            >
              Open Document
            </a>
          </div>
        );
    }
  };

  return (
    <div className="material-viewer-overlay">
      <div className="material-viewer">
        <div className="viewer-header">
          <h3>{material.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="viewer-content">
          <div className="material-description">
            <p>{material.description}</p>
          </div>
          
          {renderMaterialContent()}
          
          <div className="viewer-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {material.type === 'video' && (
              <button className="btn btn-success" onClick={onComplete}>
                Mark as Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
