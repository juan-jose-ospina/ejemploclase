'use strict';

const path = require('path');
const express = require('express');
const { calcular, OPERACIONES } = require('./calculator');

const app = express();

// Interfaz web (carpeta public)
app.use(express.static(path.join(__dirname, 'public')));

// Comprobación de estado: la interfaz la usa para mostrar si la API responde
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok' });
});

// GET /api/sumar?a=2&b=3  ->  { "operacion": "sumar", "a": 2, "b": 3, "resultado": 5 }
app.get('/api/:operacion', (req, res) => {
  const { operacion } = req.params;

  if (!OPERACIONES.includes(operacion)) {
    return res.status(404).json({
      error: `Operación no soportada: ${operacion}. Usa: ${OPERACIONES.join(', ')}`,
    });
  }

  const { a, b } = req.query;
  try {
    const resultado = calcular(operacion, a, b);
    res.json({ operacion, a: Number(a), b: Number(b), resultado });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Solo levanta el servidor si se ejecuta directamente (así las pruebas pueden importar `app`)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Calculadora lista en http://localhost:${PORT}`);
  });
}

module.exports = app;