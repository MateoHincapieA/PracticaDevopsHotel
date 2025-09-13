const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { createRoomValidation, updateRoomValidation, idValidation } = require("../validators/roomValidator");

// CRUD básico
router.get("/", roomController.getAll);
router.post("/", createRoomValidation, roomController.create);
router.get("/:id", idValidation, roomController.getById);
router.put("/:id", [...idValidation, ...updateRoomValidation], roomController.update);
router.delete("/:id", idValidation, roomController.delete);
router.patch("/:id", [...idValidation, ...updateRoomValidation], roomController.partialUpdate);

module.exports = router;
