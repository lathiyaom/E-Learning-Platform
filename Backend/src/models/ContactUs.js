const { DataTypes } = require("sequelize");
const { sequelize } = require("../Db/sequelize");

const ContactUs = sequelize.define(
  "ContactUs",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "read", "replied", "spam"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "contact_us",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["email"] },
      { fields: ["status"] },
      { fields: ["userId"] },
      { fields: ["createdAt"] },
    ],
  },
);

module.exports = ContactUs;
