const request = require("supertest");
const app = require("../../app");
const sequelize = require("../config/database");
const { Reservation, Room, Review } = require("../models");

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

  describe("POST /api/v2/reservations", () => {
    it("debería crear una reservación válida", async () => {
      const res = await request(app)
        .post("/api/v2/reservations")
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
        .post("/api/v2/reservations")
        .send({ guestName: "" });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Invalid value(s)");
    });

    it("debería fallar si checkOut <= checkIn", async () => {
      const res = await request(app)
        .post("/api/v2/reservations")
        .send({
          guestName: "Invalid Date",
          roomId: room.id,
          checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
          checkOut: new Date(),
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Invalid value(s)");
    });
  });


  describe("POST /api/v2/reservations - JSON compuesto", () => {
    it("debe crear reserva, incluir la room y crear un review", async () => {
      const response = await request(app)
        .post("/api/v2/reservations")
        .send({
          reservation: {
            guestName: "Juan",
            roomId: room.id,
            checkIn: "2025-09-20",
            checkOut: "2025-09-22",
          },
          room: {
            roomId: room.id,
          },
          review: {
            rating: 5,
            comment: "Excelente habitación",
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty("reservation");
      expect(response.body).toHaveProperty("room");
      expect(response.body).toHaveProperty("review");

      //Validaciones de reserva
      expect(response.body.reservation.guestName).toBe("Juan");
      expect(response.body.reservation.roomId).toBe(room.id);

      //Validaciones de room
      expect(response.body.room.number).toBe(room.number);

      //Validaciones de review
      expect(response.body.review.rating).toBe(5);

      const review = await Review.findByPk(response.body.review.id);
      expect(review).not.toBeNull();
    });
  });

  describe("GET /api/v2/reservations", () => {
    it("debería retornar todas las reservaciones", async () => {
      const res = await request(app).get("/api/v2/reservations");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v2/reservations/:id", () => {
    it("debería retornar una reservación existente", async () => {
      const res = await request(app).get(`/api/v2/reservations/${reservation.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.guestName).toBe("Juan Pérez");
    });

    it("debería retornar 404 si no existe", async () => {
      const res = await request(app).get("/api/v2/reservations/9999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reservación no encontrada");
    });

    it("debería retornar 400 si el ID no es válido", async () => {
      const res = await request(app).get("/api/v2/reservations/abc");
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });
  });

  describe("PUT /api/v2/reservations/:id", () => {
    it("debería actualizar una reservación existente", async () => {
      const res = await request(app)
        .put(`/api/v2/reservations/${reservation.id}`)
        .send({ status: "confirmed" });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("confirmed");
    });

    it("debería retornar 404 si no existe", async () => {
      const res = await request(app)
        .put("/api/v2/reservations/9999")
        .send({ status: "cancelled" });
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reservación no encontrada");
    });

    it("debería fallar si checkOut <= checkIn", async () => {
      const res = await request(app)
        .put(`/api/v2/reservations/${reservation.id}`)
        .send({
          checkIn: "2025-09-10",
          checkOut: "2025-09-09",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La fecha de check-out debe ser posterior al check-in");
    });
  });

  describe("DELETE /api/v2/reservations/:id", () => {
    it("debería eliminar una reservación existente", async () => {
      const newReservation = await Reservation.create({
        guestName: "To Delete",
        status: "pending",
        roomId: room.id,
        checkIn: "2025-09-15",
        checkOut: "2025-09-17",
      });

      const res = await request(app).delete(`/api/v2/reservations/${newReservation.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Reservación eliminada");
    });

    it("debería retornar 404 si no existe", async () => {
      const res = await request(app).delete("/api/v2/reservations/9999");
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reservación no encontrada");
    });

    it("debería retornar 400 si el ID no es válido", async () => {
      const res = await request(app).delete("/api/v2/reservations/abc");
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });
  });

  describe("PATCH /api/v2/reservations/:id", () => {
    it("debería actualizar parcialmente el estado", async () => {
      const res = await request(app)
        .patch(`/api/v2/reservations/${reservation.id}`)
        .send({ status: "cancelled" });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("cancelled");
    });

    it("debería retornar error si checkOut <= checkIn", async () => {
      const res = await request(app)
        .patch(`/api/v2/reservations/${reservation.id}`)
        .send({ checkIn: "2025-09-10", checkOut: "2025-09-09" });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("La fecha de check-out debe ser posterior al check-in");
    });

    it("debería retornar 404 si no existe", async () => {
      const res = await request(app).patch("/api/v2/reservations/9999").send({ status: "confirmed" });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Reservación no encontrada");
    });

    it("debería retornar 400 si el ID no es válido", async () => {
      const res = await request(app).patch("/api/v2/reservations/abc").send({ status: "confirmed" });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });
  });

});
