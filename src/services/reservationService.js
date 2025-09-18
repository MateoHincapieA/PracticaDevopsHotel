const { Reservation, Room, Review } = require("../models");

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

      let compraResponse = "";
      fetch("https://demo-276672580331.us-central1.run.app/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Error en la petición: " + response.status);
          }
          return response.json(); // parsear la respuesta
        })
        .then(result => {
          compraResponse = result;
          console.log("Respuesta de la API:", result);
        })
        .catch(error => {
          console.error("Hubo un problema con la petición:", error);
        });

      return {
        reservation: createdReservation,
        room: roomData,
        compra: compraResponse,
        review: createdReview,
      };
    } catch (error) {
      console.error("Error en createReservation:", error.message);
      throw error;
    }
  },
};

module.exports = reservationService;
