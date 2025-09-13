const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const reviewValidator = require("../validators/reviewValidator");

// CRUD básico
router.post("/", reviewValidator.create, reviewController.create);
router.get("/", reviewController.getAll);
router.get("/:id", reviewValidator.idValidation, reviewController.getById);
router.put("/:id", [reviewValidator.idValidation, reviewValidator.update], reviewController.update);
router.delete("/:id", reviewValidator.idValidation, reviewController.delete);
router.patch("/:id", [reviewValidator.idValidation, reviewValidator.update], reviewController.partialUpdate);

module.exports = router;
