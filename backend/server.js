const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Almacén de clientes conectados
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('✅ Nuevo cliente conectado (TouchDesigner/Frontend)');
    clients.add(ws);

    ws.on('message', (message) => {
        console.log(`📩 Mensaje recibido: ${message}`);

        // Reenviar el mensaje a todos los clientes excepto al remitente
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('❌ Cliente desconectado');
        clients.delete(ws);
    });

    // Manejo de errores
    ws.on('error', (error) => {
        console.error('⚠️ Error en WebSocket:', error);
    });
});

// Heartbeat modificado para evitar el error de encoding
const heartbeatInterval = setInterval(() => {
    clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                // Enviar ping sin especificar encoding inválido
                ws.ping();
            } catch (e) {
                console.error('Error en heartbeat:', e);
            }
        }
    });
}, 30000);

// Limpieza al cerrar el servidor
server.on('close', () => {
    clearInterval(heartbeatInterval);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log(`🛰️ WebSocket disponible en ws://localhost:${PORT}/ws`);
});