document.addEventListener('DOMContentLoaded', () => {
    // Estado de la aplicación (sin planetas)
    const state = {
        ws: null,
        connected: false,
        locations: {
            greenlake: 0,
            garching: 0,
            guereins: 0,
            hurricane: 0
        }
    };

    // Elementos del DOM
    const elements = {
        connectBtn: document.getElementById('connect-btn'),
        connectionStatus: document.querySelector('.connection-status'),
        connectionIcon: document.getElementById('connection-icon'),
        connectionText: document.getElementById('connection-text'),
        sliders: document.querySelectorAll('.vision-slider')
    };

    // 1. Configurar sliders rojo 
    function setupSliders() {
        elements.sliders.forEach(slider => {
            const location = slider.dataset.location;
            
            // Inicializar el valor visual
            slider.style.setProperty('--slider-value', `${state.locations[location]}%`);

            slider.addEventListener('input', (e) => {
                state.locations[location] = parseInt(e.target.value);
                e.target.style.setProperty('--slider-value', `${state.locations[location]}%`);
                if (state.connected) sendData(location);
            });
        });
    }

    // 2. Enviar datos al backend 
    function sendData(location) {
        const data = {
            type: 'skyMachineControl',
            location: location,
            visionValue: state.locations[location],
            visionType: state.locations[location] > 50 ? 'nocturnal' : 'atmospheric',
            timestamp: Date.now()
        };

        state.ws.send(JSON.stringify(data));
        console.log('Enviado:', data);
    }

    // 3. Gestión de WebSocket 
    function connectWebSocket() {
        state.ws = new WebSocket('wss://sky-machine-backend.onrender.com');

        state.ws.onopen = () => {
            state.connected = true;
            updateConnectionUI();
            console.log('Conexión establecida con el backend');
        };

        state.ws.onclose = () => {
            state.connected = false;
            updateConnectionUI();
            console.log('Conexión cerrada - Intentando reconectar en 5s...');
            setTimeout(connectWebSocket, 5000);
        };

        state.ws.onerror = (error) => {
            console.error('Error en WebSocket:', error);
            elements.connectionText.textContent = 'Error de conexión';
        };
    }

    // 4. Actualizar interfaz (ajustes visuales)
    function updateConnectionUI() {
        if (state.connected) {
            elements.connectionIcon.textContent = '';
            elements.connectionText.textContent = 'Conectado';
            elements.connectionStatus.classList.add('connected');
            elements.connectionStatus.classList.remove('disconnected');
            elements.connectBtn.textContent = 'Desconectar';
        } else {
            elements.connectionIcon.textContent = '';
            elements.connectionText.textContent = 'Desconectado';
            elements.connectionStatus.classList.add('disconnected');
            elements.connectionStatus.classList.remove('connected');
            elements.connectBtn.textContent = 'Conectar';
        }
    }

    // 5. Inicialización
    function init() {
        setupSliders();
        elements.connectBtn.addEventListener('click', () => {
            if (state.connected) {
                state.ws.close();
            } else {
                connectWebSocket();
            }
        });

        // Conexión automática 
        connectWebSocket();
    }

    init();
});