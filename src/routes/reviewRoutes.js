const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// CRUD básico
router.post("/", reviewController.create);
router.get("/", reviewController.getAll);
router.get("/:id", reviewController.getById);
router.put("/:id", reviewController.update);
router.delete("/:id", reviewController.delete);

module.exports = router;
