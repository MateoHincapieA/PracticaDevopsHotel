const express = require('express');
const sequelize = require('./src/config/database');
const routes = require("./src/routes");

const app = express();
app.use(express.json());

// Ruta inicial
app.get('/', (req, res) => {
  res.send('API response');
});

//rutas entidades
app.use("/api/v2", routes);

// Sincronizar modelos con la base de datos
sequelize.sync({ force: false })
  .then(() => console.log("BD conectada"))
  .catch(err => console.error("Error al conectar DB:", err));

// Puerto desde .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
