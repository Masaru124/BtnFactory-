require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce-app",
};
