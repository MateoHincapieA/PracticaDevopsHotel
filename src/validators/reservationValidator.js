const { body, param, oneOf } = require("express-validator");

const reservationValidator = {
  create: [
    oneOf([
      // Caso 1: JSON normal
      [
        body("guestName").notEmpty().withMessage("El nombre del huésped es obligatorio"),
        body("status")
          .optional()
          .isIn(["pending", "confirmed", "cancelled"])
          .withMessage("El estado debe ser pending, confirmed o cancelled"),
        body("roomId")
          .notEmpty()
          .withMessage("El ID de la habitación es obligatorio")
          .isInt()
          .withMessage("El ID de la habitación debe ser un número entero"),
        body("checkIn")
          .isISO8601()
          .withMessage("La fecha de check-in debe ser válida"),
        body("checkOut")
          .isISO8601()
          .withMessage("La fecha de check-out debe ser válida")
          .custom((value, { req }) => {
            const checkInDate = new Date(req.body.checkIn);
            if (new Date(value) <= checkInDate) {
              throw new Error(
                "La fecha de check-out debe ser posterior al check-in"
              );
            }
            return true;
          }),
      ],

      // Caso 2: JSON con `reservation`
      [
        body("reservation.guestName")
          .notEmpty()
          .withMessage("El nombre del huésped es obligatorio"),
        body("reservation.status")
          .optional()
          .isIn(["pending", "confirmed", "cancelled"])
          .withMessage("El estado debe ser pending, confirmed o cancelled"),
        body("reservation.roomId")
          .notEmpty()
          .withMessage("El ID de la habitación es obligatorio")
          .isInt()
          .withMessage("El ID de la habitación debe ser un número entero"),
        body("reservation.checkIn")
          .isISO8601()
          .withMessage("La fecha de check-in debe ser válida"),
        body("reservation.checkOut")
          .isISO8601()
          .withMessage("La fecha de check-out debe ser válida")
          .custom((value, { req }) => {
            const checkInDate = new Date(req.body.reservation.checkIn);
            if (new Date(value) <= checkInDate) {
              throw new Error(
                "La fecha de check-out debe ser posterior al check-in"
              );
            }
            return true;
          }),
        body("room.roomId").isInt({ min: 1 }).withMessage("ID inválido"),
        body("review.rating").notEmpty().withMessage("La calificación es obligatoria").isInt({ min: 1, max: 5 }).withMessage("La calificación debe ser un número entre 1 y 5"),
        body("review.comment").optional().isString().withMessage("El comentario debe ser texto"),
        body("review.reservationId").optional()
          .notEmpty().withMessage("El ID de la reservación es obligatorio")
          .isInt().withMessage("El ID de la reservación debe ser un número entero"),
      ],
    ], "El JSON no cumple con el formato esperado"),
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
