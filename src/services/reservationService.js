const { Reservation, Room, Review } = require("../models");
const axios = require("axios");

const reservationService = {
  async createReservation(data) {
    try {
      // Crear reserva 
      const createdReservation = await Reservation.create(data.reservation);

      // Consultar la habitación
      const roomData = await Room.findByPk(data.room.roomId);
      if (!roomData) {
        throw new Error(`La habitación con id ${data.room.roomId} no existe`);
      }

      //Crear review si existe en el payload
      let createdReview = null;
      if (data.review) {
        const reviewPayload = {
          ...data.review,
          reservationId: createdReservation.id,
        };
        createdReview = await Review.create(reviewPayload);
      }

      /* const compraResponse = await axios.post(
        "http://localhost:3000/compras",
        data
      );

      const createdCompra = compraResponse.data; */

      return {
        reservation: createdReservation,
        room: roomData,
        review: createdReview,
        //compra: createdCompra
      };
    } catch (error) {
      console.error("Error en createReservation:", error.message);
      throw error;
    }
  },
};

module.exports = reservationService;
