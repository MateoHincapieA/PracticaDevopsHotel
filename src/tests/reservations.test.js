const request = require("supertest");
const app = require("../../app");
const sequelize = require("../config/database");
const { Reservation, Room } = require("../models");

describe("Reservations API", () => {
  let room;
  let reservation;
  beforeEach(async () => {
    await sequelize.sync({ force: true });

    room = await Room.create({
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

  describe("POST /api/reservations", () => {
    it("debería crear una reservación válida", async () => {
      const res = await request(app)
        .post("/api/reservations")
        .send({
          guestName: "Jane Doe",
          status: "confirmed",
          roomId: room.id,
          checkIn: "2025-09-01",
          checkOut: "2025-09-05",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.guestName).toBe("Jane Doe");
      expect(res.body.roomId).toBe(room.id);
    });

    it("debería fallar si faltan campos obligatorios", async () => {
      const res = await request(app)
        .post("/api/reservations")
        .send({ guestName: "" });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("El nombre del huésped es obligatorio");
    });

    it("debería fallar si checkOut <= checkIn", async () => {
      const res = await request(app)
        .post("/api/reservations")
        .send({
          guestName: "Invalid Date",
          roomId: room.id,
          checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOut: new Date(),
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La fecha de check-out debe ser posterior al check-in");
    });
  });

  describe("GET /api/reservations", () => {
    it("debería retornar todas las reservaciones", async () => {
      const res = await request(app).get("/api/reservations");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/reservations/:id", () => {
    it("debería retornar una reservación existente", async () => {
      const res = await request(app).get(`/api/reservations/${reservation.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.guestName).toBe("Juan Pérez");
    });

    it("debería retornar 404 si no existe", async () => {
      const res = await request(app).get("/api/reservations/9999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reservación no encontrada");
    });

    it("debería retornar 400 si el ID no es válido", async () => {
      const res = await request(app).get("/api/reservations/abc");
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });
  });

  describe("PUT /api/reservations/:id", () => {
    it("debería actualizar una reservación existente", async () => {
      const res = await request(app)
        .put(`/api/reservations/${reservation.id}`)
        .send({ status: "confirmed" });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("confirmed");
    });

    it("debería retornar 404 si no existe", async () => {
      const res = await request(app)
        .put("/api/reservations/9999")
        .send({ status: "cancelled" });
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reservación no encontrada");
    });

    it("debería fallar si checkOut <= checkIn", async () => {
      const res = await request(app)
        .put(`/api/reservations/${reservation.id}`)
        .send({
          checkIn: "2025-09-10",
          checkOut: "2025-09-09",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La fecha de check-out debe ser posterior al check-in");
    });
  });

  describe("DELETE /api/reservations/:id", () => {
    it("debería eliminar una reservación existente", async () => {
      const newReservation = await Reservation.create({
        guestName: "To Delete",
        status: "pending",
        roomId: room.id,
        checkIn: "2025-09-15",
        checkOut: "2025-09-17",
      });

      const res = await request(app).delete(`/api/reservations/${newReservation.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Reservación eliminada");
    });

    it("debería retornar 404 si no existe", async () => {
      const res = await request(app).delete("/api/reservations/9999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reservación no encontrada");
    });

    it("debería retornar 400 si el ID no es válido", async () => {
      const res = await request(app).delete("/api/reservations/abc");
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });
  });
});
