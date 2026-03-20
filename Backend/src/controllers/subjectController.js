const subjectService = require("../services/subjectService");

const createSubject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const actorId = req.user?.id;
    const subject = await subjectService.createSubject({
      tenantId,
      actorId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create subject",
    });
  }
};

const getSubjects = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status } = req.query;

    const subjects = await subjectService.getSubjects({ tenantId, status });

    return res.status(200).json({
      success: true,
      message: "Subjects retrieved successfully",
      data: subjects,
      count: subjects.length,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch subjects",
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await subjectService.updateSubject({
      tenantId: req.tenantId,
      actorId: req.user?.id,
      subjectId: req.params.id,
      payload: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update subject",
    });
  }
};

const archiveSubject = async (req, res) => {
  try {
    const subject = await subjectService.archiveSubject({
      tenantId: req.tenantId,
      actorId: req.user?.id,
      subjectId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Subject archived successfully",
      data: subject,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to archive subject",
    });
  }
};

const restoreSubject = async (req, res) => {
  try {
    const subject = await subjectService.restoreSubject({
      tenantId: req.tenantId,
      actorId: req.user?.id,
      subjectId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Subject restored successfully",
      data: subject,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to restore subject",
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    await subjectService.deleteSubject({
      tenantId: req.tenantId,
      subjectId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete subject",
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  archiveSubject,
  restoreSubject,
  deleteSubject,
};
