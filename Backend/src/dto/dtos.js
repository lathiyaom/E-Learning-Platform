/**
 * DTO (Data Transfer Object) Layer
 * Validates and transforms request/response data
 * Implements SOLID principle: Single Responsibility
 */

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * User Registration DTO
 */
class CreateUserDTO {
  constructor(data) {
    this.userType = data.userType;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.age = data.age;
    this.gender = data.gender;
    this.phoneNo = data.phoneNo;
    this.email = data.email;
    this.password = data.password;
    this.confirmPassword = data.confirmPassword;
  }

  validate() {
    const errors = [];

    if (!this.userType || !["student", "teacher", "admin"].includes(this.userType)) {
      errors.push("Invalid user type");
    }

    if (!this.firstName || this.firstName.length < 2) {
      errors.push("First name must be at least 2 characters");
    }

    if (!this.lastName || this.lastName.length < 2) {
      errors.push("Last name must be at least 2 characters");
    }

    if (!this.age || this.age < 13 || this.age > 120) {
      errors.push("Age must be between 13 and 120");
    }

    if (!this.gender || !["male", "female", "other"].includes(this.gender)) {
      errors.push("Invalid gender");
    }

    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push("Invalid email format");
    }

    if (!this.phoneNo || !/^\d{10}$/.test(this.phoneNo.replace(/\D/g, ""))) {
      errors.push("Phone number must be 10 digits");
    }

    if (!this.password || this.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (this.password !== this.confirmPassword) {
      errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }

    return true;
  }
}

/**
 * User Update DTO
 */
class UpdateUserDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.gender = data.gender;
    this.age = data.age;
    this.phoneNo = data.phoneNo;
  }

  validate() {
    const errors = [];

    if (this.firstName && this.firstName.length < 2) {
      errors.push("First name must be at least 2 characters");
    }

    if (this.lastName && this.lastName.length < 2) {
      errors.push("Last name must be at least 2 characters");
    }

    if (this.age && (this.age < 13 || this.age > 120)) {
      errors.push("Age must be between 13 and 120");
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }

    return true;
  }

  sanitize() {
    return {
      ...(this.firstName && { firstName: this.firstName.trim() }),
      ...(this.lastName && { lastName: this.lastName.trim() }),
      ...(this.gender && { gender: this.gender }),
      ...(this.age && { age: this.age }),
      ...(this.phoneNo && { phoneNo: this.phoneNo }),
    };
  }
}

/**
 * Course DTO
 */
class CreateCourseDTO {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.image = data.image;
    this.category = data.category;
    this.videoUrl = data.videoUrl;
    this.priceUSD = data.priceUSD;
    this.isPaid = data.isPaid;
    this.currency = data.currency || "USD";
    this.tags = data.tags || [];
  }

  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length < 5) {
      errors.push("Title must be at least 5 characters");
    }

    if (!this.description || this.description.trim().length < 20) {
      errors.push("Description must be at least 20 characters");
    }

    if (!this.category) {
      errors.push("Category is required");
    }

    if (!this.videoUrl) {
      errors.push("Video URL is required");
    }

    if (this.isPaid && this.priceUSD <= 0) {
      errors.push("Price must be greater than 0 for paid courses");
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }

    return true;
  }
}

/**
 * Contact Form DTO
 */
class CreateContactDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phoneNo = data.phoneNo;
    this.message = data.message;
    this.userId = data.userId || null;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push("Invalid email format");
    }

    if (!this.message || this.message.trim().length < 10) {
      errors.push("Message must be at least 10 characters");
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(", "), 400);
    }

    return true;
  }
}

/**
 * Response DTO - Standardized response format
 */
class ResponseDTO {
  constructor(success, message, data = null, code = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      ...(this.data && { data: this.data }),
      ...(this.code && { code: this.code }),
      timestamp: this.timestamp,
    };
  }
}

/**
 * Paginated Response DTO
 */
class PaginatedResponseDTO {
  constructor(data, total, page, totalPages, pageSize) {
    this.data = data;
    this.pagination = {
      total,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  toJSON() {
    return {
      data: this.data,
      pagination: this.pagination,
    };
  }
}

module.exports = {
  AppError,
  CreateUserDTO,
  UpdateUserDTO,
  CreateCourseDTO,
  CreateContactDTO,
  ResponseDTO,
  PaginatedResponseDTO,
};
