const socket = new WebSocket('wss://sky-machine-backend.onrender.com/ws');
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

// Función mejorada para enviar coordenadas (formato compatible con TD)
function sendToBackend(lat, lon, alt = 0) {
    if (socket.readyState === WebSocket.OPEN) {
        const payload = {
            type: 'stellarium_coords',  // Identificador para TouchDesigner
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            alt: parseFloat(alt),
            timestamp: new Date().toISOString()
        };
        socket.send(JSON.stringify(payload));
        return true;
    }
    return false;
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

    if (sendToBackend(lat, lon, alt)) {
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

            if (sendToBackend(lat, lon, alt)) {
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
            statusDiv.textContent = "❌ Error de geolocalización";
            statusDiv.style.color = "#ff5555";
            alert(`Error: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});