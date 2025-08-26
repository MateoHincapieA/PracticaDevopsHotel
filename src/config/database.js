const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.NODE_ENV === "test" ? "sqlite" : "postgres", // o postgres
    storage: process.env.NODE_ENV === "test" ? ":memory:" : undefined,
    logging: false,
  }
);

module.exports = sequelize;
