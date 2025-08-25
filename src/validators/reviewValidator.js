const { body, param } = require("express-validator");

const reviewValidator = {
  create: [
    body("rating").notEmpty().withMessage("La calificación es obligatoria").isInt({ min: 1, max: 5 }).withMessage("La calificación debe ser un número entre 1 y 5"),
    body("comment").optional().isString().withMessage("El comentario debe ser texto"),
    body("reservationId")
      .notEmpty().withMessage("El ID de la reservación es obligatorio")
      .isInt().withMessage("El ID de la reservación debe ser un número entero"),
  ],

  update: [
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("La calificación debe ser un número entre 1 y 5"),
    body("comment").optional().isString().withMessage("El comentario debe ser texto"),
  ],
  idValidation: [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
  ],
};

module.exports = reviewValidator;
