const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Almacena todos los clientes conectados
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  clients.add(ws); // Agrega el cliente al conjunto

  // Envía un mensaje de bienvenida solo al cliente nuevo
  ws.send('Conexión WebSocket establecida');

  // Maneja mensajes entrantes
  ws.on('message', (message) => {
    console.log('Mensaje recibido:', message.toString());

    // Retransmite el mensaje a TODOS los clientes (incluyendo al remitente)
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // Elimina el cliente cuando se desconecta
  ws.on('close', () => {
    console.log('Cliente desconectado');
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});