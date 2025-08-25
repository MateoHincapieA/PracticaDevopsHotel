const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Room = sequelize.define("Room", {
  number: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "available" }
}, {
  tableName: "rooms",
  timestamps: false
});

module.exports = Room;
