const { DataTypes } = require("sequelize");
const { sequelize } = require("../Db/sequelize");

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "review_count",
    },
    videoUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "video_url",
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ["Popular", "New"],
    },
    priceUSD: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: "price_usd",
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.ENUM("USD", "INR", "EUR"),
      defaultValue: "USD",
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_paid",
    },
  },
  {
    tableName: "courses",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Course;
