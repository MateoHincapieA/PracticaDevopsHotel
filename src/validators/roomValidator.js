const { body, param } = require("express-validator");
const { Room } = require("../models");

const createRoomValidation = [
  body("number").notEmpty().withMessage("Número es obligatorio")
    .custom(async (value) => {
      const existingRoom = await Room.findOne({ where: { number: value } });
      if (existingRoom) {
        throw new Error("Número de habitación ya creado");
      }
      return true;
    }), ,
  body("type").notEmpty().withMessage("Tipo es obligatorio"),
  body("price").isFloat({ min: 0 }).withMessage("Precio debe ser mayor o igual a 0"),
];

const updateRoomValidation = [
  body("number").optional().notEmpty().withMessage("Número no puede estar vacío"),
  body("type").optional().notEmpty().withMessage("Tipo no puede estar vacío"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Precio debe ser mayor o igual a 0"),
];

const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID inválido"),
];

module.exports = { createRoomValidation, updateRoomValidation, idValidation };
