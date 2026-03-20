const { Holiday } = require("../models");

const CURRENT_HOLIDAY_TYPES = ["public", "restricted", "optional"];
const LEGACY_HOLIDAY_TYPES = [
  "platform",
  "organization",
  "national",
  "regional",
  "religious",
];

const mapLegacyHolidayTypeToCurrent = (value) => {
  if (!value) return "restricted";
  const normalized = String(value).toLowerCase();
  if (CURRENT_HOLIDAY_TYPES.includes(normalized)) return normalized;

  const mapping = {
    platform: "public",
    national: "public",
    regional: "public",
    religious: "public",
    organization: "restricted",
  };

  return mapping[normalized] || "restricted";
};

const normalizeHoliday = (holidayDoc) => {
  const holiday = holidayDoc.toObject ? holidayDoc.toObject() : holidayDoc;
  return {
    ...holiday,
    endDate: holiday.endDate || holiday.date,
    type: holiday.type || holiday.holiday_type,
    isRecurring: holiday.isRecurring ?? holiday.is_recurring ?? false,
    tenantId: holiday.tenantId || holiday.organization_id,
    createdBy: holiday.createdBy || holiday.created_by,
  };
};

const buildHolidayPayload = (body, req) => {
  const holidayType = mapLegacyHolidayTypeToCurrent(
    body.holiday_type || body.type,
  );
  const legacyType = LEGACY_HOLIDAY_TYPES.includes(
    String(body.type || "").toLowerCase(),
  )
    ? String(body.type).toLowerCase()
    : "organization";

  return {
    organization_id: req.tenantId,
    tenantId: req.tenantId,
    title: body.title,
    date: body.date,
    endDate: body.endDate || body.date,
    holiday_type: holidayType,
    type: legacyType,
    description: body.description || "",
    is_recurring: body.is_recurring ?? body.isRecurring ?? false,
    isRecurring: body.isRecurring ?? body.is_recurring ?? false,
    recurring_pattern: body.recurring_pattern || null,
    recurring_end_date: body.recurring_end_date || null,
    affects_roles: Array.isArray(body.affects_roles)
      ? body.affects_roles
      : body.affects_roles
        ? [body.affects_roles]
        : ["all"],
    is_full_day: body.is_full_day ?? true,
    start_time: body.start_time || null,
    end_time: body.end_time || null,
    created_by: req.user.id,
    createdBy: req.user.id,
    status: body.status || "active",
    color: body.color || "#EF4444",
    tags: Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string" && body.tags.trim()
        ? body.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    send_reminder: body.send_reminder ?? true,
    reminder_sent: body.reminder_sent ?? false,
  };
};

const buildHolidayScopeQuery = (tenantId) => ({
  $or: [
    { organization_id: tenantId },
    { tenantId: tenantId },
    { tenantId: null },
    { organization_id: null },
  ],
});

const holidayController = {
  createHoliday: async (req, res) => {
    try {
      const role = String(req.user.userType || "").toLowerCase();
      if (!["admin", "superadmin"].includes(role)) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized to create holiday" });
      }

      const payload = buildHolidayPayload(req.body, req);
      if (!payload.title || !payload.date || !payload.holiday_type) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: title, date, holiday_type",
        });
      }

      const holiday = await Holiday.create(payload);

      return res.status(201).json({
        success: true,
        message: "Holiday created successfully",
        data: normalizeHoliday(holiday),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAllHolidays: async (req, res) => {
    try {
      const { page = 1, limit = 10, type, year } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const query = buildHolidayScopeQuery(req.tenantId);

      if (type) {
        query.$and = [
          {
            $or: [
              { holiday_type: mapLegacyHolidayTypeToCurrent(type) },
              { type },
            ],
          },
        ];
      }

      if (year) {
        const startOfYear = new Date(Number(year), 0, 1);
        const endOfYear = new Date(Number(year), 11, 31, 23, 59, 59, 999);
        query.date = { $gte: startOfYear, $lte: endOfYear };
      }

      const total = await Holiday.countDocuments(query);
      const holidays = await Holiday.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        message: "Holidays retrieved successfully",
        data: holidays.map(normalizeHoliday),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getUpcomingHolidays: async (req, res) => {
    try {
      const { days = 90, page = 1, limit = 10 } = req.query;
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Number(days));
      const skip = (Number(page) - 1) * Number(limit);

      const query = {
        ...buildHolidayScopeQuery(req.tenantId),
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      };

      const total = await Holiday.countDocuments(query);
      const holidays = await Holiday.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        message: "Upcoming holidays retrieved successfully",
        data: holidays.map(normalizeHoliday),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getHolidayById: async (req, res) => {
    try {
      const holiday = await Holiday.findOne({
        _id: req.params.id,
        ...buildHolidayScopeQuery(req.tenantId),
      });

      if (!holiday) {
        return res
          .status(404)
          .json({ success: false, message: "Holiday not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Holiday retrieved successfully",
        data: normalizeHoliday(holiday),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  updateHoliday: async (req, res) => {
    try {
      const role = String(req.user.userType || "").toLowerCase();
      if (!["admin", "superadmin"].includes(role)) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      const holiday = await Holiday.findOne({
        _id: req.params.id,
        ...buildHolidayScopeQuery(req.tenantId),
      });

      if (!holiday) {
        return res
          .status(404)
          .json({ success: false, message: "Holiday not found" });
      }

      const payload = buildHolidayPayload(
        { ...holiday.toObject(), ...req.body },
        req,
      );
      payload.created_by = holiday.created_by || payload.created_by;
      payload.createdBy = holiday.createdBy || payload.createdBy;

      Object.assign(holiday, payload);
      await holiday.save();

      return res.status(200).json({
        success: true,
        message: "Holiday updated successfully",
        data: normalizeHoliday(holiday),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteHoliday: async (req, res) => {
    try {
      const role = String(req.user.userType || "").toLowerCase();
      if (!["admin", "superadmin"].includes(role)) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

      const holiday = await Holiday.findOneAndDelete({
        _id: req.params.id,
        ...buildHolidayScopeQuery(req.tenantId),
      });

      if (!holiday) {
        return res
          .status(404)
          .json({ success: false, message: "Holiday not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Holiday deleted successfully",
        data: normalizeHoliday(holiday),
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getCalendarHolidays: async (req, res) => {
    try {
      const yearNum = Number(req.params.year);
      const monthNum = Number(req.params.month);
      if (
        Number.isNaN(yearNum) ||
        Number.isNaN(monthNum) ||
        monthNum < 1 ||
        monthNum > 12
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid year or month" });
      }

      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      const query = {
        ...buildHolidayScopeQuery(req.tenantId),
        date: { $gte: startDate, $lte: endDate },
      };

      const holidays = await Holiday.find(query).sort({ date: 1 });

      return res.status(200).json({
        success: true,
        message: "Calendar holidays retrieved successfully",
        data: holidays.map(normalizeHoliday),
        meta: {
          year: yearNum,
          month: monthNum,
          count: holidays.length,
        },
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = holidayController;
