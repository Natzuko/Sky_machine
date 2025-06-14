wss.on('connection', (ws) => {
    console.log('✅ Nuevo cliente conectado');

    ws.on('message', (message) => {
        try {
            // 1. Eliminar la verificación .trim() - El mensaje ya es un objeto
            let data;
            if (typeof message === 'string') {
                data = JSON.parse(message);
            } else {
                data = message; // Ya está parseado (puede ser un Buffer/objeto)
            }

            // 2. Validar coordenadas
            if (!data || typeof data !== 'object') {
                throw new Error('Formato de mensaje inválido');
            }

            const lat = parseFloat(data.lat);
            const lon = parseFloat(data.lon);
            const alt = parseFloat(data.alt) || 0;

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error('Latitud y longitud deben ser números válidos');
            }

            // 3. Generar URL
            const stellariumUrl = `https://stellarium-web.org/?lat=${lat}&lon=${lon}&alt=${alt}&fov=60`;
            console.log('🌍 URL generada:', stellariumUrl);

            // 4. Enviar respuesta
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        status: 'success',
                        url: stellariumUrl
                    }));
                }
            });

        } catch (error) {
            console.error('❌ Error al procesar mensaje:', error.message);
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