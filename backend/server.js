const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Configuración de WebSocket con ping/pong para mantener conexión
const wss = new WebSocket.Server({
    server,
    path: '/ws'
});

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('✅ Nuevo cliente conectado (TouchDesigner/Frontend)');
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        try {
            let data;
            if (typeof message === 'string') {
                data = JSON.parse(message);
            } else {
                data = JSON.parse(message.toString());
            }

            // Validación para TouchDesigner
            if (data.type === 'stellarium_coords') {
                const { lat, lon, alt = 0 } = data;
                const stellariumUrl = `https://stellarium-web.org/?lat=${lat}&lon=${lon}&alt=${alt}&fov=60`;

                console.log('🌍 Enviando a TouchDesigner:', stellariumUrl);

                // Reenviar a todos los clientes (incluyendo TD)
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'stellarium_url',
                            url: stellariumUrl,
                            originalData: data
                        }));
                    }
                });
            }

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

    ws.on('close', () => {
        console.log('🔌 Cliente desconectado');
    });
});

// Ping a clientes cada 30 segundos (optimización de latencia)
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping(null, false, true);
    });
}, 30000);

// Endpoint de verificación
app.get('/touchdesigner', (req, res) => {
    res.json({
        status: 'ready',
        websocket_url: 'wss://sky-machine-backend.onrender.com/ws',
        message: 'Conectar WebSocket DAT en TD a esta URL'
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log(`🛰️  WebSocket disponible en ws://localhost:${PORT}/ws`);
});