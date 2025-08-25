const { body, param } = require("express-validator");

const reservationValidator = {
  create: [
    body("guestName").notEmpty().withMessage("El nombre del huésped es obligatorio"),
    body("status").optional().isIn(["pending", "confirmed", "cancelled"]).withMessage("El estado debe ser pending, confirmed o cancelled"),
    body("roomId").notEmpty().withMessage("El ID de la habitación es obligatorio").isInt().withMessage("El ID de la habitación debe ser un número entero"),
    body("checkIn").isISO8601().withMessage("La fecha de check-in debe ser válida"),
    body("checkOut")
      .isISO8601().withMessage("La fecha de check-out debe ser válida")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.checkIn)) {
          throw new Error("La fecha de check-out debe ser posterior al check-in");
        }
        return true;
      }),
  ],

  update: [
    body("guestName").optional().notEmpty().withMessage("El nombre del huésped no puede estar vacío"),
    body("status").optional().isIn(["pending", "confirmed", "cancelled"]).withMessage("El estado debe ser pending, confirmed o cancelled"),
    body("checkIn").optional().isISO8601().withMessage("La fecha de check-in debe ser válida"),
    body("checkOut")
      .optional()
      .isISO8601().withMessage("La fecha de check-out debe ser válida")
      .custom((value, { req }) => {
        if (req.body.checkIn && new Date(value) <= new Date(req.body.checkIn)) {
          throw new Error("La fecha de check-out debe ser posterior al check-in");
        }
        return true;
      }),
  ],

  idValidation: [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  ],
};

module.exports = reservationValidator;
