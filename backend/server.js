const express = require('express');
const WebSocket = require('ws');
const http = require('http');

// Configuración de Express
const app = express();
const server = http.createServer(app);

// Configuración de WebSocket
const wss = new WebSocket.Server({
    server,  // ¡Importante! Compartir el mismo servidor HTTP
    path: '/ws'  // Ruta opcional para WebSocket
});

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('✅ Nuevo cliente conectado');

    ws.on('message', (message) => {
        try {
            let data;
            // Manejar diferentes formatos de mensaje
            if (typeof message === 'string') {
                data = JSON.parse(message);
            } else if (message instanceof Buffer) {
                data = JSON.parse(message.toString());
            } else {
                data = message;
            }

            // Validación de coordenadas
            const lat = parseFloat(data.lat);
            const lon = parseFloat(data.lon);
            const alt = parseFloat(data.alt) || 0;

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Latitud y longitud deben ser números válidos');
            }

            const stellariumUrl = `https://stellarium-web.org/?lat=${lat}&lon=${lon}&alt=${alt}&fov=60`;
            console.log('🌍 URL generada:', stellariumUrl);

            // Enviar a todos los clientes
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        status: 'success',
                        url: stellariumUrl
                    }));
                }
            });

        } catch (error) {
            console.error('❌ Error:', error.message);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    status: 'error',
                    message: error.message
                }));
            }
        }
    });

    ws.on('close', () => console.log('🔌 Cliente desconectado'));
});

// Ruta básica de prueba para HTTP
app.get('/', (req, res) => {
    res.send('Servidor WebSocket activo');
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    console.log(`🛰️  WebSocket disponible en ws://localhost:${PORT}/ws`);
});

// Manejo de errores global
process.on('uncaughtException', (err) => {
    console.error('⚠️ Error no capturado:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('⚠️ Promesa rechazada no manejada:', err);
});