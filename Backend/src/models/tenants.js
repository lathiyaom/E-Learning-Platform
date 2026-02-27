const { DataTypes } = require("sequelize");
const { sequelize } = require("../Db/sequelize");
const bcrypt = require("bcryptjs");

const Tenant = sequelize.define(
  "Tenant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "phone_no",
    },
    userType: {
      type: DataTypes.ENUM("admin", "superadmin"),
      allowNull: false,
      field: "user_type",
    },
    OrgOwnerName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "org_owner_name",
    },
    OrgOwnerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      field: "org_owner_email",
    },
    OrgOwnerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "org_owner_phone",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
    },

    agreeTerms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "agree_terms",
    },
    about: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "token",
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "refresh_token",
    },
  },
  {
    tableName: "tenants",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (tenant) => {
        if (tenant.password) {
          const salt = await bcrypt.genSalt(10);
          tenant.password = await bcrypt.hash(tenant.password, salt);
        }
      },

      beforeUpdate: async (tenant) => {
        if (tenant.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          tenant.password = await bcrypt.hash(tenant.password, salt);
        }
      },
    },
  },
);

Tenant.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Tenant;
