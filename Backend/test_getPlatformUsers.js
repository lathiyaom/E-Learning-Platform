const mongoose = require("mongoose");
const dotenv = require("dotenv");
const superAdminService = require("./src/services/superAdminService");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/e-learning", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected");
    return superAdminService.getPlatformUsers({ roleFilter: "admin" });
  })
  .then((data) => {
    console.log("Admins:");
    console.log(data);
    process.exit(0);
  })
  .catch(console.error);
