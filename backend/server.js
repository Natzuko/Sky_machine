const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('✅ Nuevo cliente conectado');

    // Evento para mensajes recibidos
    ws.on('message', (message) => {
        try {
            // 1. Parsear y validar coordenadas
            const { lat, lon, alt = 0 } = JSON.parse(message);
            if (typeof lat !== 'number' || typeof lon !== 'number') {
                throw new Error('Latitud y longitud deben ser números');
            }

            // 2. Generar URL de Stellarium
            const stellariumUrl = `https://stellarium-web.org/?lat=${lat}&lon=${lon}&alt=${alt}&fov=60`;
            console.log('🌍 URL generada:', stellariumUrl);

            // 3. Enviar a TODOS los clientes (incluyendo TouchDesigner)
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(stellariumUrl);
                }
            });

        } catch (error) {
            console.error('❌ Error al procesar mensaje:', error.message);
            ws.send(JSON.stringify({ error: error.message }));
        }
    });

    // Manejo de desconexión
    ws.on('close', () => {
        console.log('🔌 Cliente desconectado');
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor WebSocket escuchando en puerto ${PORT}`);
});