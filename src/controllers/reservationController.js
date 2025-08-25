const { Reservation, Room } = require('../models');

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
    try {
      const reservation = await Reservation.findByPk(req.params.id, { include: Room });
      if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la reservación' });
    }
  },

  async create(req, res) {
    try {
      const reservation = await Reservation.create(req.body);
      res.status(201).json(reservation);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la reservación' });
    }
  },

  async update(req, res) {
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
    try {
      const reservation = await Reservation.findByPk(req.params.id);
      if (!reservation) return res.status(404).json({ error: 'Reservación no encontrada' });
      await reservation.destroy();
      res.json({ message: 'Reservación eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la reservación' });
    }
  }
};

module.exports = reservationController;
