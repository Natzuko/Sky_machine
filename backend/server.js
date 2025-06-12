// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // WebSocket sobre HTTP

// Endpoint HTTP
app.get('/', (req, res) => {
  res.send('¡Backend funcionando!');
});

// WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  ws.send('Conexión WebSocket establecida');

  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message.toString());
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});