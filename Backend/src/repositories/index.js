/**
 * Repository Index
 * Centralizes access to all repository instances
 * Implements Singleton pattern for repository instances
 */

const UserRepository = require("./UserRepository");
const CourseRepository = require("./CourseRepository");
const BookmarkRepository = require("./BookmarkRepository");
const BaseRepository = require("./BaseRepository");

// Create singleton instances
const userRepository = new UserRepository();
const courseRepository = new CourseRepository();
const bookmarkRepository = new BookmarkRepository();

module.exports = {
  userRepository,
  courseRepository,
  bookmarkRepository,
  BaseRepository,
};
