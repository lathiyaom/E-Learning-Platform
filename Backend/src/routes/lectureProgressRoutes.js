const express = require("express");
const router = express.Router();
const { LectureProgress, CourseMaterial, Course } = require("../models");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Mark lecture as complete
router.post("/complete", authenticate, authorize("student"), async (req, res) => {
  try {
    const { lecture_id, course_id } = req.body;
    const studentId = req.user.id;
    const organizationId = req.tenantId;

    // Verify lecture exists
    const lecture = await CourseMaterial.findById(lecture_id);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    // Find or create progress record
    let progress = await LectureProgress.findOne({
      student_id: studentId,
      lecture_id: lecture_id
    });

    if (!progress) {
      progress = new LectureProgress({
        student_id: studentId,
        lecture_id: lecture_id,
        course_id: course_id,
        organization_id: organizationId
      });
    }

    // Mark as complete
    progress.completed = true;
    progress.completed_at = new Date();
    progress.completion_percentage = 100;
    progress.status = "completed";
    progress.watch_time = progress.total_duration || lecture.duration || 0;

    await progress.save();

    // Update course enrollment progress
    const Enrollment = require("../models/Enrollment");
    const totalLectures = await CourseMaterial.countDocuments({
      course_id: course_id,
      type: "video"
    });

    const completedLectures = await LectureProgress.countDocuments({
      student_id: studentId,
      course_id: course_id,
      completed: true
    });

    const progressPercentage = Math.round((completedLectures / totalLectures) * 100);

    await Enrollment.findOneAndUpdate(
      {
        student_id: studentId,
        course_id: course_id
      },
      {
        progress: progressPercentage,
        last_accessed_at: new Date(),
        completed_at: progressPercentage >= 100 ? new Date() : undefined
      }
    );

    res.status(200).json({
      success: true,
      message: "Lecture marked as complete",
      data: {
        progress,
        course_progress: progressPercentage,
        total_lectures: totalLectures,
        completed_lectures: completedLectures
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark lecture complete",
      error: error.message
    });
  }
});

// Update lecture progress (for video watching)
router.patch("/:lectureId", authenticate, authorize("student"), async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const progress = await LectureProgress.find({
      student_id: studentId,
      course_id: courseId
    })
    .populate('lecture_id', 'title type duration order')
    .sort({ 'lecture_id.order': 1 });

    // Calculate overall progress
    const totalLectures = await CourseMaterial.countDocuments({
      course_id: courseId,
      type: "video"
    });

    const completedLectures = await LectureProgress.countDocuments({
      student_id: studentId,
      course_id: courseId,
      completed: true
    });

    const progressPercentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        progress,
        course_progress: progressPercentage,
        total_lectures: totalLectures,
        completed_lectures: completedLectures
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message
    });
  }
});

// Get specific lecture progress
router.get("/:lectureId", authenticate, authorize("student"), async (req, res) => {
  try {
    const { lectureId } = req.params;
    const studentId = req.user.id;

    const progress = await LectureProgress.findOne({
      student_id: studentId,
      lecture_id: lectureId
    });

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch lecture progress",
      error: error.message
    });
  }
});

// Update lecture progress (for video watching)
router.patch("/:lectureId", authenticate, authorize("student"), async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { watch_time, last_position, completion_percentage, notes, bookmarked, bookmark_time } = req.body;
    const studentId = req.user.id;

    let progress = await LectureProgress.findOne({
      student_id: studentId,
      lecture_id: lectureId
    });

    if (!progress) {
      // Get course_id from lecture
      const lecture = await CourseMaterial.findById(lectureId);
      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found"
        });
      }

      progress = new LectureProgress({
        student_id: studentId,
        lecture_id: lectureId,
        course_id: lecture.course_id,
        organization_id: req.tenantId
      });
    }

    // Update fields
    if (watch_time !== undefined) progress.watch_time = watch_time;
    if (last_position !== undefined) progress.last_position = last_position;
    if (completion_percentage !== undefined) progress.completion_percentage = Math.min(100, Math.max(0, completion_percentage));
    if (notes !== undefined) progress.notes = notes;
    if (bookmarked !== undefined) progress.bookmarked = bookmarked;
    if (bookmark_time !== undefined) progress.bookmark_time = bookmark_time;

    // Update status based on completion percentage
    if (progress.completion_percentage >= 100 && !progress.completed) {
      progress.completed = true;
      progress.completed_at = new Date();
      progress.status = "completed";
    } else if (progress.completion_percentage > 0 && !progress.completed) {
      progress.status = "in_progress";
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message
    });
  }
});

// Get specific lecture progress
router.get("/:lectureId", authenticate, authorize("student"), async (req, res) => {
  try {
    const { lectureId } = req.params;
    const studentId = req.user.id;

    const progress = await LectureProgress.findOne({
      student_id: studentId,
      lecture_id: lectureId
    })
    .populate('lecture_id', 'title type duration order file_url');

    if (!progress) {
      // Return empty progress if not found
      return res.status(200).json({
        success: true,
        data: {
          student_id: studentId,
          lecture_id: lectureId,
          completed: false,
          completion_percentage: 0,
          status: "not_started"
        }
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message
    });
  }
});

module.exports = router;
