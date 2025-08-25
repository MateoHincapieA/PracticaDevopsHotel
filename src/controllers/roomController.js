const { Room } = require('../models');

// CRUD para Habitaciones
const roomController = {
  async getAll(req, res) {
    try {
      const rooms = await Room.findAll();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las habitaciones' });
    }
  },

  async getById(req, res) {
    try {
      const room = await Room.findByPk(req.params.id);
      if (!room) return res.status(404).json({ error: 'Habitación no encontrada' });
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la habitación' });
    }
  },

  async create(req, res) {
    try {
      const room = await Room.create(req.body);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la habitación' });
    }
  },

  async update(req, res) {
    try {
      const room = await Room.findByPk(req.params.id);
      if (!room) return res.status(404).json({ error: 'Habitación no encontrada' });
      await room.update(req.body);
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la habitación' });
    }
  },

  async delete(req, res) {
    try {
      const room = await Room.findByPk(req.params.id);
      if (!room) return res.status(404).json({ error: 'Habitación no encontrada' });
      await room.destroy();
      res.json({ message: 'Habitación eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la habitación' });
    }
  }
};

module.exports = roomController;
