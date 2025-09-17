const { Reservation, Room } = require('../models');
const { validationResult } = require("express-validator");
const reservationService = require("../services/reservationService");
const { logMessage, logError } = require('../../logging');
const { Storage } = require('@google-cloud/storage');

const reservationController = {
  async getAll(req, res) {
    try {
      const reservations = await Reservation.findAll({ include: Room });
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reservaciones' });
    }
  },

  async getById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const reservation = await Reservation.findByPk(req.params.id, { include: Room });
      if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la reservación' });
    }
  },

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logError(`Error en POST /reservations: ${errors.array()}`);
      return res.status(400).json({ errors: errors.array() });
    }
    const storage = new Storage();
    const bucketName = process.env.CLOUD_STORAGE_BUCKET;
    if (!bucketName) {
      console.error("CLOUD_STORAGE_BUCKET no está definido. La subida de archivos no funcionará.");
    }
    try {
      logMessage('Petición POST recibida en /reservations');
      let reservationData;

      // Lógica para determinar el tipo de reserva
      if (req.body.guestName && req.body.roomId) {
        reservationData = await Reservation.create(req.body);
      } else if (req.body.reservation && req.body.room && req.body.review) {
        reservationData = await reservationService.createReservation(req.body);
      } else {
        return res.status(400).json({ error: "Formato de JSON inválido" });
      }

      // Lógica para guardar en Cloud Storage
      if (bucketName) {
        const fileName = `reservation-${reservationData.id || Date.now()}.json`;
        const file = storage.bucket(bucketName).file(fileName);
        const fileContent = JSON.stringify(reservationData, null, 2);

        await file.save(fileContent, {
          contentType: 'application/json'
        });
        logMessage(`Respuesta de reserva guardada en Cloud Storage: ${fileName}`);
      }

      // Devolver la respuesta al cliente
      return res.status(201).json(reservationData);

    } catch (error) {
      logError(`Error en POST /reservations: ${error}`);
      console.error("Error al crear la reserva:", error);
      res.status(500).json({ error: 'Error al crear la reservación' });
    }
  },

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const reservation = await Reservation.findByPk(req.params.id);
      if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
      await reservation.update(req.body);
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la reservación' });
    }
  },

  async delete(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const reservation = await Reservation.findByPk(req.params.id);
      if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
      await reservation.destroy();
      res.json({ message: 'Reservación eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la reservación' });
    }
  },

  async partialUpdate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const reservation = await Reservation.findByPk(req.params.id);
      if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });

      await reservation.update(req.body, { fields: Object.keys(req.body) });
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar parcialmente la Reservación' });
    }
  }
};

module.exports = reservationController;
