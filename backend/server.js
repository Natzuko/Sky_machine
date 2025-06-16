const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 10000;

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

// WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Datos recibidos:', data);

            // Aquí simplemente registramos los datos
            // Tú luego podrás conectar TouchDesigner a este backend

        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});