const { DataTypes } = require("sequelize");
const { sequelize } = require("../Db/sequelize");

const Bookmark = sequelize.define(
  "Bookmark",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_id",
      references: {
        model: "courses",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "bookmarks",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["courseId"],
      },
      {
        fields: ["userId", "courseId"],
        unique: true,
      },
    ],
  }
);

module.exports = Bookmark;
