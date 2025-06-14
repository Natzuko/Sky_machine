const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('✅ Nuevo cliente conectado');

    ws.on('message', (message) => {
        try {
            // 1. Verificar que el mensaje no esté vacío
            if (!message || message.trim() === '') {
                throw new Error('Mensaje vacío recibido');
            }

            // 2. Parsear y validar coordenadas
            const data = JSON.parse(message);
            
            if (!data || typeof data !== 'object') {
                throw new Error('Formato de mensaje inválido');
            }

            const lat = parseFloat(data.lat);
            const lon = parseFloat(data.lon);
            const alt = parseFloat(data.alt) || 0;

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Latitud y longitud deben ser números válidos');
            }

            // 3. Generar URL de Stellarium
            const stellariumUrl = `https://stellarium-web.org/?lat=${lat}&lon=${lon}&alt=${alt}&fov=60`;
            console.log('🌍 URL generada:', stellariumUrl);

            // 4. Enviar solo si es una solicitud válida
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        status: 'success',
                        url: stellariumUrl,
                        originalData: data
                    }));
                }
            });

        } catch (error) {
            console.error('❌ Error al procesar mensaje:', error.message);
            // Enviar error al cliente específico
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    status: 'error',
                    message: error.message
                }));
            }
        }
    });

    ws.on('close', () => {
        console.log('🔌 Cliente desconectado');
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor WebSocket escuchando en puerto ${PORT}`);
});