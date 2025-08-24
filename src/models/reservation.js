const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Room = require("./room");

const Reservation = sequelize.define("Reservation", {
  guestName: { type: DataTypes.STRING, allowNull: false },
  checkIn: { type: DataTypes.DATE, allowNull: false },
  checkOut: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "pending" }
});

Room.hasMany(Reservation, { foreignKey: "roomId" });
Reservation.belongsTo(Room, { foreignKey: "roomId" });

module.exports = Reservation;
