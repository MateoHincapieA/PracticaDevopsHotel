const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Room = require("./room");

const Reservation = sequelize.define("Reservation", {
  guestName: { type: DataTypes.STRING, allowNull: false, field: "guest_name" },
  checkIn: { type: DataTypes.DATE, allowNull: false, field: "check_in" },
  checkOut: { type: DataTypes.DATE, allowNull: false, field: "check_out" },
  status: { type: DataTypes.STRING, defaultValue: "pending" }
}, {
  tableName: "reservations",
  timestamps: false
});

Room.hasMany(Reservation, { foreignKey: { name: "roomId", field: "room_id" } });
Reservation.belongsTo(Room, { foreignKey: { name: "roomId", field: "room_id" } });

module.exports = Reservation;
