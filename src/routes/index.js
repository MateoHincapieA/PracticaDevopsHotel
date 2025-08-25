const express = require("express");
const router = express.Router();

// Importa cada router
const roomRoutes = require("./roomRoutes");
const reservationRoutes = require("./reservationRoutes");
const reviewRoutes = require("./reviewRoutes");

// Monta las rutas
router.use("/rooms", roomRoutes);
router.use("/reservations", reservationRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;
