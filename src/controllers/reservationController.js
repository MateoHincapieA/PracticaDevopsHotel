const { Reservation, Room } = require('../models');
const { validationResult } = require("express-validator");
const reservationService = require("../services/reservationService");
const { logMessage, logError } = require('../../logging');

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
    try {
      logMessage('Petición POST recibida en /reservations');
      let reservationData;

      // Caso 1: JSON normal
      if (req.body.guestName && req.body.roomId) {
        reservationData = await Reservation.create(req.body);
        logMessage(`Datos procesados /reservations: ${JSON.stringify(reservationData)}`);
        return res.status(201).json(reservationData);
      }

      // Caso 2: JSON con reservation + room
      if (req.body.reservation && req.body.room && req.body.review) {
        reservationData = await reservationService.createReservation(req.body);
        logMessage(`Datos procesados /reservations: ${JSON.stringify(reservationData)}`);
        return res.status(201).json(reservationData);
      }

      // Si no cumple ninguna estructura
      return res.status(400).json({ error: "Formato de JSON inválido" });
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
