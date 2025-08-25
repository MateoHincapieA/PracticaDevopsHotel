const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Reservation = require("./reservation");

const Review = sequelize.define("Review", {
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" }
}, {
  tableName: "reviews",
  timestamps: false
});

Reservation.hasMany(Review, { foreignKey: { name: "reservationId", field: "reservation_id" } });
Review.belongsTo(Reservation, { foreignKey: { name: "reservationId", field: "reservation_id" } });

module.exports = Review;
