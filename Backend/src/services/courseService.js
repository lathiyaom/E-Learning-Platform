const { Course } = require("../models");

const buildCourseSortClause = (sortBy = "popular") => {
  let sortClause = { rating: -1, reviewCount: -1 };

  switch (sortBy?.toLowerCase()) {
    case "price_low_to_high":
      sortClause = { price: 1 };
      break;
    case "price_high_to_low":
      sortClause = { price: -1 };
      break;
    case "rating":
    case "highest_rated":
      sortClause = { rating: -1, reviewCount: -1 };
      break;
    case "newest":
      sortClause = { createdAt: -1 };
      break;
    case "oldest":
      sortClause = { createdAt: 1 };
      break;
    case "most_reviewed":
      sortClause = { reviewCount: -1 };
      break;
    case "popular":
    default:
      sortClause = { rating: -1, reviewCount: -1 };
  }

  return sortClause;
};

const createCourse = async (courseData) => {
  const {
    title,
    image,
    description,
    category,
    rating,
    reviewCount,
    videoUrl,
    tags,
    priceUSD,
    isPaid,
    tenantId,
    createdBy,
  } = courseData;

  if (!title || !image || !description || !category || !videoUrl) {
    throw new Error("Please enter necessary details");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  if (!createdBy) {
    throw new Error("Creator ID is required");
  }

  // Validate price for paid courses
  if (isPaid && (!priceUSD || priceUSD < 0)) {
    throw new Error("Price must be greater than 0 for paid courses");
  }

  // Check for duplicate course title within the same tenant
  const existingCourse = await Course.findOne({
    title,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
  if (existingCourse) {
    throw new Error("This Course Is Already Available");
  }

  const newCourse = await Course.create({
    organization_id: tenantId,
    teacher_id: createdBy,
    title,
    image,
    description,
    category,
    rating: rating || 0,
    reviewCount: reviewCount || 0,
    video_url: videoUrl,
    videoUrl,
    tags: tags || ["Popular"],
    price: isPaid ? priceUSD : 0,
    pricing: isPaid ? priceUSD : 0,
    priceUSD: isPaid ? priceUSD : 0,
    isPaid: isPaid !== undefined ? isPaid : false,
    tenantId,
    createdBy,
  });

  return newCourse;
};

const getAllCourses = async (tenantId, sortBy = "popular") => {
  if (!tenantId) throw new Error("Tenant ID required for course query");
  const sortClause = buildCourseSortClause(sortBy);

  const courses = await Course.find({
    $or: [{ tenantId }, { organization_id: tenantId }],
  }).sort(sortClause);

  return courses;
};

const getPlatformCourses = async (sortBy = "popular") => {
  const sortClause = buildCourseSortClause(sortBy);

  // Courses can be linked with either legacy `tenantId` or newer `organization_id`.
  const courses = await Course.find({
    $or: [{ tenantId: { $exists: true, $ne: null } }, { organization_id: { $exists: true, $ne: null } }],
  })
    .sort(sortClause)
    .populate("tenantId", "name code")
    .populate("organization_id", "name code")
    .populate("teacher_id", "firstName lastName email");

  return courses;
};

const getCourseById = async (id, tenantId) => {
  if (!id) throw new Error("Course ID is required");
  if (!tenantId) throw new Error("Tenant ID required");

  const course = await Course.findOne({
    _id: id,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
  if (!course) throw new Error("Course Not Found");

  return course;
};

const updateCourse = async (id, tenantId, updateData) => {
  if (!id) throw new Error("Course ID is required");
  if (!tenantId) throw new Error("Tenant ID required");

  const course = await Course.findOne({
    _id: id,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
  if (!course) throw new Error("Course Not Found");

  const { title, image, description, category, videoUrl, tags, priceUSD, isPaid, rating, reviewCount } = updateData;

  if (title !== undefined && title.length === 0)
    throw new Error("Title is required");
  if (image !== undefined && image.length === 0)
    throw new Error("Image is required");
  if (description !== undefined && description.length === 0)
    throw new Error("Description is required");
  if (category !== undefined && category.length === 0)
    throw new Error("Category is required");
  if (videoUrl !== undefined && videoUrl.length === 0)
    throw new Error("Video URL is required");

  // Update fields
  if (title) course.title = title;
  if (image) course.image = image;
  if (description) course.description = description;
  if (category) course.category = category;
  if (videoUrl) course.videoUrl = videoUrl;
  if (tags) course.tags = tags;
  if (priceUSD !== undefined) course.priceUSD = priceUSD;
  if (isPaid !== undefined) course.isPaid = isPaid;
  if (rating !== undefined) course.rating = rating;
  if (reviewCount !== undefined) course.reviewCount = reviewCount;

  await course.save();

  return course;
};

const deleteCourse = async (id, tenantId) => {
  if (!id) throw new Error("Course ID is required");
  if (!tenantId) throw new Error("Tenant ID required");

  const course = await Course.findOne({
    _id: id,
    $or: [{ tenantId }, { organization_id: tenantId }],
  });
  if (!course) throw new Error("Course Not Found");

  await course.deleteOne();
  return course;
};

module.exports = {
  createCourse,
  getAllCourses,
  getPlatformCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
