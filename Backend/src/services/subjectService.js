const { Subject, Course } = require("../models");

const normalizeName = (value = "") => String(value).trim().replace(/\s+/g, " ");

const createSubject = async ({ tenantId, actorId, name, code, stream }) => {
  const normalizedName = normalizeName(name);
  if (!tenantId) throw new Error("Tenant ID is required");
  if (!normalizedName) throw new Error("Subject name is required");

  const existing = await Subject.findOne({
    tenantId,
    name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });

  if (existing) {
    throw new Error("Subject already exists in this organization");
  }

  return Subject.create({
    tenantId,
    name: normalizedName,
    code: code ? String(code).trim().toUpperCase() : null,
    stream: stream ? String(stream).trim() : null,
    createdBy: actorId || null,
    updatedBy: actorId || null,
  });
};

const getSubjects = async ({ tenantId, status }) => {
  if (!tenantId) throw new Error("Tenant ID is required");

  const query = { tenantId };
  if (status && ["active", "archived"].includes(status)) {
    query.status = status;
  }

  return Subject.find(query).sort({ name: 1 });
};

const updateSubject = async ({ tenantId, actorId, subjectId, payload }) => {
  if (!tenantId) throw new Error("Tenant ID is required");
  if (!subjectId) throw new Error("Subject ID is required");

  const subject = await Subject.findOne({ _id: subjectId, tenantId });
  if (!subject) throw new Error("Subject not found");

  if (payload.name !== undefined) {
    const normalizedName = normalizeName(payload.name);
    if (!normalizedName) throw new Error("Subject name cannot be empty");

    const duplicate = await Subject.findOne({
      _id: { $ne: subjectId },
      tenantId,
      name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (duplicate) {
      throw new Error("Another subject with this name already exists");
    }

    subject.name = normalizedName;
  }

  if (payload.code !== undefined) {
    subject.code = payload.code ? String(payload.code).trim().toUpperCase() : null;
  }

  if (payload.stream !== undefined) {
    subject.stream = payload.stream ? String(payload.stream).trim() : null;
  }

  subject.updatedBy = actorId || null;
  await subject.save();
  return subject;
};

const archiveSubject = async ({ tenantId, actorId, subjectId }) => {
  if (!tenantId) throw new Error("Tenant ID is required");
  if (!subjectId) throw new Error("Subject ID is required");

  const subject = await Subject.findOne({ _id: subjectId, tenantId });
  if (!subject) throw new Error("Subject not found");

  subject.status = "archived";
  subject.archivedAt = new Date();
  subject.updatedBy = actorId || null;
  await subject.save();

  return subject;
};

const restoreSubject = async ({ tenantId, actorId, subjectId }) => {
  if (!tenantId) throw new Error("Tenant ID is required");
  if (!subjectId) throw new Error("Subject ID is required");

  const subject = await Subject.findOne({ _id: subjectId, tenantId });
  if (!subject) throw new Error("Subject not found");

  subject.status = "active";
  subject.archivedAt = null;
  subject.updatedBy = actorId || null;
  await subject.save();

  return subject;
};

const deleteSubject = async ({ tenantId, subjectId }) => {
  if (!tenantId) throw new Error("Tenant ID is required");
  if (!subjectId) throw new Error("Subject ID is required");

  const subject = await Subject.findOne({ _id: subjectId, tenantId });
  if (!subject) throw new Error("Subject not found");

  const inUse = await Course.exists({
    subjectId,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });

  if (inUse) {
    throw new Error("Subject is used by one or more courses and cannot be deleted");
  }

  await Subject.deleteOne({ _id: subjectId, tenantId });
  return { deleted: true };
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  archiveSubject,
  restoreSubject,
  deleteSubject,
};
