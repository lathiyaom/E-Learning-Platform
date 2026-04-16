const { Course, Subject } = require("../models");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeLessons = (lessonsInput = []) => {
  if (!Array.isArray(lessonsInput)) return [];

  return lessonsInput
    .map((lesson) => {
      const videoUrl = String(lesson?.videoUrl || lesson?.video_url || "").trim();
      if (!videoUrl) return null;

      const description = String(lesson?.description || "").trim();
      return {
        videoUrl,
        video_url: videoUrl,
        description,
      };
    })
    .filter(Boolean);
};

const buildLessonsPayload = (courseData) => {
  const parsedLessons = normalizeLessons(courseData?.lessons);
  const fallbackVideoUrl = String(courseData?.video_url || courseData?.videoUrl || "").trim();

  if (parsedLessons.length > 0) {
    return parsedLessons;
  }

  if (fallbackVideoUrl) {
    return [
      {
        videoUrl: fallbackVideoUrl,
        video_url: fallbackVideoUrl,
        description: "",
      },
    ];
  }

  return [];
};

const resolveSubjectForTenant = async (subjectId, tenantId) => {
  if (!subjectId) return null;
  if (!tenantId) throw new Error("Tenant ID is required to map subject");

  const subject = await Subject.findOne({
    _id: subjectId,
    tenantId,
    status: "active",
  });

  if (!subject) {
    throw new Error("Selected subject is invalid or not active for this organization");
  }

  return subject;
};

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
    video_url,
    videoUrl,
    tags,
    price,
    pricing,
    priceUSD,
    currency,
    isPaid,
    subjectId,
    tenantId,
    createdBy,
  } = courseData;

  const subject = await resolveSubjectForTenant(subjectId, tenantId);
  const normalizedCategory = String(category || subject?.name || "").trim();

  if (!title || !image || !description || !normalizedCategory) {
    throw new Error("Please enter necessary details");
  }

  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  if (!createdBy) {
    throw new Error("Creator ID is required");
  }

  // Handle multiple price field formats
  const coursePrice = price ?? pricing ?? priceUSD ?? 0;
  const lessonsPayload = buildLessonsPayload(courseData);
  const courseVideoUrl = lessonsPayload[0]?.videoUrl || video_url || videoUrl;

  if (!courseVideoUrl || lessonsPayload.length === 0) {
    throw new Error("Video URL is required");
  }

  // Validate price for paid courses
  if (isPaid && (coursePrice <= 0 || Number.isNaN(Number(coursePrice)))) {
    throw new Error("Price must be greater than 0 for paid courses");
  }

  // Check for duplicate course title within same tenant (but exclude own updates)
  const existingCourse = await Course.findOne({
    title: {
      $regex: `^${escapeRegex(String(title).trim())}$`,
      $options: "i",
    },
    _id: { $ne: courseData.courseId }, // Exclude if updating
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
    category: normalizedCategory,
    subjectId: subject?._id || null,
    rating: rating || 0,
    reviewCount: reviewCount || 0,
    video_url: courseVideoUrl,
    videoUrl: courseVideoUrl,
    lessons: lessonsPayload,
    tags: tags || ["Popular"],
    level: courseData.level || "Easy",
    price: coursePrice,
    pricing: coursePrice,
    priceUSD: coursePrice,
    currency: currency || "USD",
    isPaid: isPaid !== undefined ? isPaid : coursePrice > 0,
    tenantId,
    createdBy,
  });

  return newCourse;
};

const getAllCourses = async (tenantId, sortBy = "popular") => {
  const sortClause = buildCourseSortClause(sortBy);

  let query = {};
  if (tenantId) {
    query = {
      $or: [{ tenantId }, { organization_id: tenantId }],
    };
  }
  // If no tenantId (e.g., teacher not assigned), return all courses

  // Use aggregation to include enrollment counts
  const courses = await Course.aggregate([
    { $match: query },
    { $sort: sortClause },
    {
      $lookup: {
        from: "enrollments",
        let: { courseId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$course_id", "$$courseId"] },
                  { $eq: ["$courseId", "$$courseId"] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "enrollmentData",
      },
    },
    {
      $addFields: {
        totalStudents: {
          $cond: [
            { $gt: [{ $size: "$enrollmentData" }, 0] },
            { $arrayElemAt: ["$enrollmentData.count", 0] },
            0,
          ],
        },
      },
    },
    { $project: { enrollmentData: 0 } },
  ]);

  // Populate subjectId for the aggregated results
  const courseIds = courses.map((c) => c._id);
  const subjects = await require("../models").Subject.find({
    _id: { $in: courses.map((c) => c.subjectId).filter(Boolean) },
  }).select("name code stream status");

  const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));

  const enrichedCourses = courses.map((course) => ({
    ...course,
    subjectId: subjectMap.get(course.subjectId?.toString()) || null,
  }));

  return enrichedCourses;
};

const enrichCourseQuery = (query) => query.populate("subjectId", "name code stream status");

const getPlatformCourses = async (sortBy = "popular") => {
  const sortClause = buildCourseSortClause(sortBy);

  // Courses can be linked with either legacy `tenantId` or newer `organization_id`.
  const courses = await enrichCourseQuery(Course.find({
    $or: [{ tenantId: { $exists: true, $ne: null } }, { organization_id: { $exists: true, $ne: null } }],
  }))
    .sort(sortClause)
    .populate("tenantId", "name code")
    .populate("organization_id", "name code")
    .populate("teacher_id", "firstName lastName email");

  return courses;
};

const getCourseById = async (id, tenantId) => {
  if (!id) throw new Error("Course ID is required");

  const query = tenantId
    ? {
        _id: id,
        $or: [{ tenantId }, { organization_id: tenantId }],
      }
    : { _id: id };

  const course = await enrichCourseQuery(Course.findOne(query))
    .populate("teacher_id", "firstName lastName email")
    .populate("createdBy", "firstName lastName email");
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

  const { title, image, description, category, subjectId, video_url, videoUrl, tags, price, pricing, priceUSD, currency, isPaid, rating, reviewCount, level, lessons } = updateData;

  const subject = await resolveSubjectForTenant(subjectId, tenantId);

  if (title !== undefined && title.length === 0)
    throw new Error("Title is required");
  if (image !== undefined && image.length === 0)
    throw new Error("Image is required");
  if (description !== undefined && description.length === 0)
    throw new Error("Description is required");
  if (category !== undefined && category.length === 0)
    throw new Error("Category is required");

  // Update fields
  if (title) course.title = title;
  if (image) course.image = image;
  if (description) course.description = description;
  if (category) course.category = category;
  if (subjectId !== undefined) {
    course.subjectId = subject ? subject._id : null;
    if (!category && subject?.name) {
      course.category = subject.name;
    }
  }
  const normalizedLessons = lessons === undefined ? null : normalizeLessons(lessons);
  if (normalizedLessons && normalizedLessons.length > 0) {
    course.lessons = normalizedLessons;
  }

  const nextVideoUrl = video_url || videoUrl || course.lessons?.[0]?.videoUrl;
  if (nextVideoUrl) {
    course.video_url = nextVideoUrl;
    course.videoUrl = nextVideoUrl;
  }

  if (!course.video_url && (!Array.isArray(course.lessons) || course.lessons.length === 0)) {
    throw new Error("At least one lesson video URL is required");
  }
  if (tags) course.tags = tags;
  if (level) course.level = level;
  
  // Handle multiple price field formats
  const coursePrice = price ?? pricing ?? priceUSD;
  if (coursePrice !== undefined) {
    course.price = coursePrice;
    course.pricing = coursePrice;
    course.priceUSD = coursePrice;
  }
  if (currency !== undefined) course.currency = currency;
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
