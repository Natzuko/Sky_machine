// Conexión WebSocket
const socket = new WebSocket('wss://sky-machine-backend.onrender.com');
const statusDiv = document.getElementById('status');
const coordinatesDiv = document.getElementById('coordinates');

// Estado de conexión
socket.onopen = () => {
    statusDiv.textContent = "✅ Conectado al servidor";
    statusDiv.style.color = "#00ff88";
};

socket.onerror = (error) => {
    statusDiv.textContent = "❌ Error de conexión";
    statusDiv.style.color = "#ff5555";
    console.error("Error en WebSocket:", error);
};

// Función mejorada para enviar coordenadas
function sendCoords(lat, lon, alt = 0) {
    // Validación básica
    if (isNaN(lat) || isNaN(lon)) {
        alert("Latitud y longitud deben ser números válidos");
        return false;
    }

    // Convertir a números (por si vienen como strings)
    const latNum = Number(lat);
    const lonNum = Number(lon);
    const altNum = Number(alt) || 0;

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            lat: latNum,
            lon: lonNum,
            alt: altNum
        }));
        return true;
    } else {
        statusDiv.textContent = "⚠️ No conectado al servidor";
        statusDiv.style.color = "#ffcc00";
        return false;
    }
}

// Enviar coordenadas MANUALES
document.getElementById('sendManual').addEventListener('click', () => {
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;
    const alt = document.getElementById('alt').value || 0;

    if (!lat || !lon) {
        alert("Ingresa latitud y longitud.");
        return;
    }

    if (sendCoords(lat, lon, alt)) {
        coordinatesDiv.innerHTML = `
            <p><strong>Coordenadas enviadas:</strong></p>
            <p>Latitud: ${lat}</p>
            <p>Longitud: ${lon}</p>
            <p>Altitud: ${alt}</p>
        `;
    }
});

// Enviar coordenadas AUTOMÁTICAS (geolocalización)
document.getElementById('realLocation').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
    }

    statusDiv.textContent = "🔄 Detectando ubicación...";
    statusDiv.style.color = "#ffcc00";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const alt = position.coords.altitude || 0;

            if (sendCoords(lat, lon, alt)) {
                coordinatesDiv.innerHTML = `
                    <p><strong>Ubicación actual:</strong></p>
                    <p>Latitud: ${lat.toFixed(4)}</p>
                    <p>Longitud: ${lon.toFixed(4)}</p>
                    <p>Altitud: ${alt ? alt.toFixed(2) + " m" : "N/A"}</p>
                `;
                statusDiv.textContent = "✅ Ubicación enviada";
                statusDiv.style.color = "#00ff88";
            }
        },
        (error) => {
            let errorMessage = "Error al obtener ubicación: ";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += "Permiso denegado";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += "Ubicación no disponible";
                    break;
                case error.TIMEOUT:
                    errorMessage += "Tiempo de espera agotado";
                    break;
                default:
                    errorMessage += error.message;
            }
            alert(errorMessage);
            statusDiv.textContent = "❌ Error de geolocalización";
            statusDiv.style.color = "#ff5555";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});

// Manejar mensajes de respuesta del servidor
socket.onmessage = (event) => {
    try {
        const response = JSON.parse(event.data);
        if (response.status === 'error') {
            console.error('Error del servidor:', response.message);
        }
        // Puedes agregar más lógica aquí si el servidor envía confirmaciones
    } catch (e) {
        console.log('Mensaje recibido:', event.data);
    }
};