const request = require("supertest");
const app = require("../../app");
const sequelize = require('../config/database');
const { Room } = require("../models");

describe("Rooms API", () => {

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /api/rooms", () => {
    it("debe crear una habitación válida", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .send({ number: "101", type: "single", price: 100 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.number).toBe("101");
    });

    it("no debe crear habitación sin número", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .send({ type: "double", price: 120 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Número es obligatorio");
    });

    it("no debe crear habitación sin tipo", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .send({ number: "102", price: 150 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Tipo es obligatorio");
    });

    it("no debe crear habitación sin precio", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .send({ number: "103", type: "suite" });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Precio debe ser mayor o igual a 0");
    });

    it("no debe crear habitación con número duplicado", async () => {
      await Room.create({ number: "104", type: "single", price: 90 });

      const res = await request(app)
        .post("/api/rooms")
        .send({ number: "104", type: "double", price: 200 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Número de habitación ya creado");
    });
  });

  describe("GET /api/rooms", () => {
    it("debe obtener todas las habitaciones", async () => {
      const res = await request(app).get("/api/rooms");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/rooms/:id", () => {
    it("debe obtener una habitación por ID válido", async () => {
      const room = await Room.create({ number: "105", type: "suite", price: 250 });

      const res = await request(app).get(`/api/rooms/${room.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.number).toBe("105");
    });

    it("debe devolver error con ID inválido", async () => {
      const res = await request(app).get("/api/rooms/abc");

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });

    it("debe devolver 404 si la habitación no existe", async () => {
      const res = await request(app).get("/api/rooms/9999");

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Habitación no encontrada");
    });
  });

  describe("PUT /api/rooms/:id", () => {
    it("debe actualizar una habitación existente", async () => {
      const room = await Room.create({ number: "106", type: "single", price: 80 });

      const res = await request(app)
        .put(`/api/rooms/${room.id}`)
        .send({ type: "double", price: 120 });

      expect(res.statusCode).toBe(200);
      expect(res.body.type).toBe("double");
      expect(res.body.price).toBe(120);
    });

    it("debe devolver error con ID inválido", async () => {
      const res = await request(app).put("/api/rooms/xyz").send({ type: "suite" });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });

    it("debe devolver 404 si la habitación no existe", async () => {
      const res = await request(app).put("/api/rooms/9999").send({ type: "suite" });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Habitación no encontrada");
    });

    it("no debe permitir precio negativo", async () => {
      const room = await Room.create({ number: "107", type: "single", price: 50 });

      const res = await request(app)
        .put(`/api/rooms/${room.id}`)
        .send({ price: -10 });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("Precio debe ser mayor o igual a 0");
    });
  });

  describe("DELETE /api/rooms/:id", () => {
    it("debe eliminar una habitación existente", async () => {
      const room = await Room.create({ number: "108", type: "double", price: 300 });

      const res = await request(app).delete(`/api/rooms/${room.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Habitación eliminada");
    });

    it("debe devolver error con ID inválido", async () => {
      const res = await request(app).delete("/api/rooms/xyz");

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe("ID inválido");
    });

    it("debe devolver 404 si la habitación no existe", async () => {
      const res = await request(app).delete("/api/rooms/9999");

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Habitación no encontrada");
    });
  });
});

