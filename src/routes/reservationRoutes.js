const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const reservationValidator = require("../validators/reservationValidator");

// CRUD básico
router.post("/", reservationValidator.create, reservationController.create);
router.get("/", reservationController.getAll);
router.get("/:id", reservationValidator.idValidation, reservationController.getById);
router.put("/:id", [reservationValidator.idValidation, reservationValidator.update], reservationController.update);
router.delete("/:id", reservationValidator.idValidation, reservationController.delete);
router.patch("/:id", [reservationValidator.idValidation, reservationValidator.update], reservationController.partialUpdate);

module.exports = router;
