import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { feedbackApi } from '../../api';
import './RatingReview.css';

const RatingReview = ({ enrollment, user, onReviewSubmitted }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    review: ''
  });

  useEffect(() => {
    if (enrollment && enrollment.rating) {
      setExistingReview({
        rating: enrollment.rating,
        review: enrollment.review,
        reviewed_at: enrollment.reviewed_at
      });
      setFormData({
        rating: enrollment.rating,
        review: enrollment.review || ''
      });
    }
  }, [enrollment]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      const courseId = enrollment?.course_id?._id || enrollment?.courseId?._id || enrollment?.course_id || enrollment?.courseId;
      if (!courseId) {
        toast.error('Course not found for this enrollment');
        return;
      }

      const response = await feedbackApi.createFeedback({
        courseId,
        rating: formData.rating,
        comment: formData.review,
      });

      if (response.data.success) {
        toast.success('Review submitted successfully');
        setShowReviewModal(false);
        setExistingReview({
          rating: formData.rating,
          review: formData.review,
          reviewed_at: new Date()
        });
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.data);
        }
      } else {
        toast.error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className={`stars ${interactive ? 'interactive' : ''}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''}`}
            onClick={() => interactive && handleRatingClick(star)}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="rating-review">
      <div className="rating-header">
        <h3>Rate & Review</h3>
        {existingReview ? (
          <div className="existing-review">
            <div className="review-info">
              <span>You rated this course</span>
              <span>{new Date(existingReview.reviewed_at).toLocaleDateString()}</span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowReviewModal(true)}
            >
              Edit Review
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setShowReviewModal(true)}
          >
            Write Review
          </button>
        )}
      </div>

      {existingReview && (
        <div className="review-summary">
          <div className="rating-display">
            {renderStars(existingReview.rating)}
            <span className="rating-number">{existingReview.rating}.0</span>
          </div>
          {existingReview.review && (
            <div className="review-text">
              <p>{existingReview.review}</p>
            </div>
          )}
        </div>
      )}

      {showReviewModal && (
        <ReviewModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmitReview}
          onClose={() => setShowReviewModal(false)}
          loading={loading}
          renderStars={renderStars}
        />
      )}
    </div>
  );
};

const ReviewModal = ({ formData, setFormData, onSubmit, onClose, loading, renderStars }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content review-modal">
        <div className="modal-header">
          <h3>Rate & Review</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>How would you rate this course?</label>
            <div className="rating-input">
              {renderStars(formData.rating, true)}
              <span className="rating-text">
                {formData.rating === 0 ? 'Select a rating' : `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Your Review (Optional)</label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="Share your experience with this course..."
              rows="4"
              maxLength="1000"
            />
            <div className="character-count">
              {formData.review.length}/1000
            </div>
          </div>

          <div className="review-tips">
            <h4>Tips for writing a great review:</h4>
            <ul>
              <li>Be specific about what you liked or didn't like</li>
              <li>Mention the quality of course materials</li>
              <li>Comment on the instructor's teaching style</li>
              <li>Help others make informed decisions</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || formData.rating === 0}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CourseReviews = ({ courseId, userRole }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getCourseFeedback(courseId);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filter === 'all') return true;
      if (filter === '5') return review.rating === 5;
      if (filter === '4') return review.rating === 4;
      if (filter === '3') return review.rating <= 3;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.reviewed_at) - new Date(a.reviewed_at);
      }
      if (sortBy === 'rating-high') {
        return b.rating - a.rating;
      }
      if (sortBy === 'rating-low') {
        return a.rating - b.rating;
      }
      return 0;
    });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0
  }));

  if (loading) {
    return (
      <div className="course-reviews">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-reviews">
      <div className="reviews-header">
        <h3>Course Reviews</h3>
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="total-reviews">{reviews.length} reviews</span>
          </div>
        </div>
      </div>

      <div className="reviews-filters">
        <div className="filter-group">
          <label>Filter by rating:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars & Below</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>
      </div>

      <div className="reviews-content">
        <div className="rating-distribution">
          <h4>Rating Distribution</h4>
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="distribution-bar">
              <div className="bar-label">
                <span>{rating} stars</span>
                <span>{count}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="reviews-list">
          {filteredAndSortedReviews.length > 0 ? (
            filteredAndSortedReviews.map(review => (
              <ReviewCard key={review._id} review={review} />
            ))
          ) : (
            <div className="empty-reviews">
              <h3>No reviews yet</h3>
              <p>Be the first to review this course!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.rated_by?.firstName?.charAt(0)}{review.rated_by?.lastName?.charAt(0)}
          </div>
          <div className="reviewer-details">
            <h4>{review.rated_by?.firstName} {review.rated_by?.lastName}</h4>
            <span className="review-date">
              {new Date(review.reviewed_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="review-rating">
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>
              ★
            </span>
          ))}
        </div>
      </div>
      
      {review.review && (
        <div className="review-content">
          <p>{review.review}</p>
        </div>
      )}
      
      <div className="review-actions">
        <button className="btn-helpful">
          👍 Helpful ({review.helpful_count || 0})
        </button>
        <button className="btn-report">
          🚩 Report
        </button>
      </div>
    </div>
  );
};

export default RatingReview;
