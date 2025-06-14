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

// Enviar coordenadas MANUALES
document.getElementById('sendManual').addEventListener('click', () => {
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;
    const alt = document.getElementById('alt').value || 0;

    if (!lat || !lon) {
        alert("Ingresa latitud y longitud.");
        return;
    }

    socket.send(JSON.stringify({ lat, lon, alt }));
    coordinatesDiv.innerHTML = `
        <p><strong>Coordenadas enviadas:</strong></p>
        <p>Latitud: ${lat}</p>
        <p>Longitud: ${lon}</p>
        <p>Altitud: ${alt}</p>
    `;
});

// Enviar coordenadas AUTOMÁTICAS (geolocalización)
document.getElementById('realLocation').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const alt = position.coords.altitude || 0;

            socket.send(JSON.stringify({ lat, lon, alt }));
            coordinatesDiv.innerHTML = `
                <p><strong>Ubicación actual:</strong></p>
                <p>Latitud: ${lat.toFixed(4)}</p>
                <p>Longitud: ${lon.toFixed(4)}</p>
                <p>Altitud: ${alt ? alt.toFixed(2) + " m" : "N/A"}</p>
            `;
        },
        (error) => {
            alert("Error al obtener la ubicación: " + error.message);
        }
    );
});