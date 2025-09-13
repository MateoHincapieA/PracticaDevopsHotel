const { Review, Reservation } = require('../models');
const { validationResult } = require("express-validator");

const reviewController = {
  async getAll(req, res) {
    try {
      const reviews = await Review.findAll({ include: Reservation });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reseñas' });
    }
  },

  async getById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const review = await Review.findByPk(req.params.id, { include: Reservation });
      if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la reseña' });
    }
  },

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const review = await Review.create(req.body);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la reseña' });
    }
  },

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const review = await Review.findByPk(req.params.id);
      if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
      await review.update(req.body);
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la reseña' });
    }
  },

  async delete(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const review = await Review.findByPk(req.params.id);
      if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
      await review.destroy();
      res.json({ message: 'Reseña eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar la reseña' });
    }
  },

  async partialUpdate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const review = await Review.findByPk(req.params.id);
      if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });

      await review.update(req.body, { fields: Object.keys(req.body) });
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar parcialmente la Reseña' });
    }
  }
};

module.exports = reviewController;
