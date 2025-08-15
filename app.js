const express = require('express');
const app = express();

app.use(express.json());

// Ruta inicial
app.get('/', (req, res) => {
  res.send('API response');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
