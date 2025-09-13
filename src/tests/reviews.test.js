const request = require("supertest");
const app = require("../../app");
const sequelize = require("../config/database");
const { Review, Reservation, Room } = require("../models");

describe("Reviews API", () => {
  let reservation;
  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const room = await Room.create({
      number: "201",
      type: "single",
      price: 120,
    });

    reservation = await Reservation.create({
      guestName: "Juan Pérez",
      roomId: room.id,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/reviews", () => {
    it("debe crear una reseña válida", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .send({ rating: 5, comment: "Excelente servicio", reservationId: reservation.id });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.rating).toBe(5);
    });

    it("no debe crear reseña sin rating", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .send({ comment: "Faltó calificación", reservationId: reservation.id });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La calificación es obligatoria");
    });

    it("no debe crear reseña con rating inválido", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .send({ rating: 10, reservationId: reservation.id });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La calificación debe ser un número entre 1 y 5");
    });

    it("no debe crear reseña sin reservationId", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .send({ rating: 3, comment: "Sin reserva" });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("El ID de la reservación es obligatorio");
    });
  });

  describe("GET /api/reviews", () => {
    it("debe obtener todas las reseñas", async () => {
      const res = await request(app).get("/api/reviews");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/reviews/:id", () => {
    it("debe obtener una reseña por ID", async () => {
      const review = await Review.create({
        rating: 4,
        comment: "Muy buena",
        reservationId: reservation.id,
      });

      const res = await request(app).get(`/api/reviews/${review.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", review.id);
    });

    it("debe devolver error si ID no es válido", async () => {
      const res = await request(app).get("/api/reviews/abc");
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });

    it("debe devolver 404 si la reseña no existe", async () => {
      const res = await request(app).get("/api/reviews/9999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reseña no encontrada");
    });
  });

  describe("PUT /api/reviews/:id", () => {
    it("debe actualizar una reseña existente", async () => {
      const review = await Review.create({
        rating: 2,
        comment: "Regular",
        reservationId: reservation.id,
      });

      const res = await request(app)
        .put(`/api/reviews/${review.id}`)
        .send({ rating: 4, comment: "Mejoró la atención" });

      expect(res.statusCode).toBe(200);
      expect(res.body.rating).toBe(4);
      expect(res.body.comment).toBe("Mejoró la atención");
    });

    it("no debe actualizar con rating inválido", async () => {
      const review = await Review.create({
        rating: 3,
        comment: "Pasable",
        reservationId: reservation.id,
      });

      const res = await request(app)
        .put(`/api/reviews/${review.id}`)
        .send({ rating: 0 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La calificación debe ser un número entre 1 y 5");
    });

    it("debe devolver 404 al intentar actualizar reseña inexistente", async () => {
      const res = await request(app)
        .put("/api/reviews/9999")
        .send({ rating: 3 });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reseña no encontrada");
    });
  });

  describe("DELETE /api/reviews/:id", () => {
    it("debe eliminar una reseña existente", async () => {
      const review = await Review.create({
        rating: 1,
        comment: "Muy mala",
        reservationId: reservation.id,
      });

      const res = await request(app).delete(`/api/reviews/${review.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Reseña eliminada");
    });

    it("debe devolver 404 al intentar eliminar reseña inexistente", async () => {
      const res = await request(app).delete("/api/reviews/9999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reseña no encontrada");
    });

    it("debe devolver error si ID no es válido", async () => {
      const res = await request(app).delete("/api/reviews/abc");
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });
  });

  describe("PATCH /api/reviews/:id", () => {
    it("debe actualizar solo el comentario de una reseña", async () => {
      const review = await Review.create({
        rating: 3,
        comment: "Regular",
        reservationId: reservation.id,
      });

      const res = await request(app)
        .patch(`/api/reviews/${review.id}`)
        .send({ comment: "Mejoró bastante" });

      expect(res.statusCode).toBe(200);
      expect(res.body.comment).toBe("Mejoró bastante");
      expect(res.body.rating).toBe(3);
    });

    it("no debe aceptar rating fuera de rango", async () => {
      const review = await Review.create({
        rating: 4,
        comment: "Bien",
        reservationId: reservation.id,
      });

      const res = await request(app)
        .patch(`/api/reviews/${review.id}`)
        .send({ rating: 10 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La calificación debe ser un número entre 1 y 5");
    });

    it("debe devolver 404 si la reseña no existe", async () => {
      const res = await request(app).patch("/api/reviews/9999").send({ comment: "X" });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reseña no encontrada");
    });
  });

});
