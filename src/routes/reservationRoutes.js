const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

// CRUD básico
router.post("/", reservationController.create);
router.get("/", reservationController.getAll);
router.get("/:id", reservationController.getById);
router.put("/:id", reservationController.update);
router.delete("/:id", reservationController.delete);

module.exports = router;
