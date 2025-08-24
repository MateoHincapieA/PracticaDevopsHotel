const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Reservation = require("./reservation");

const Review = sequelize.define("Review", {
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

Reservation.hasMany(Review, { foreignKey: "reservationId" });
Review.belongsTo(Reservation, { foreignKey: "reservationId" });

module.exports = Review;
