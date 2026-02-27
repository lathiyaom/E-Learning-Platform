const { DataTypes } = require("sequelize");
const { sequelize } = require("../Db/sequelize");

const Newsletter = sequelize.define(
  "Newsletter",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      field: "email",
    },
    status: {
      type: DataTypes.ENUM("subscribed", "unsubscribed", "bounced"),
      defaultValue: "subscribed",
    },
  },
  {
    tableName: "newsletters",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["email"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = Newsletter;
