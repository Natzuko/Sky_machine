// Conexión WebSocket
const socket = new WebSocket("wss://sky-machine-backend.onrender.com");

// Elementos del DOM
const realLocationBtn = document.getElementById("realLocation");
const sendManualBtn = document.getElementById("sendManual");
const latInput = document.getElementById("lat");
const lonInput = document.getElementById("lon");
const altInput = document.getElementById("alt");
const statusDiv = document.getElementById("status");
const coordinatesDiv = document.getElementById("coordinates");

// Estado de conexión
socket.onopen = () => {
    statusDiv.textContent = "✅ Conectado al servidor";
    statusDiv.style.color = "#00ff88";
};

socket.onerror = () => {
    statusDiv.textContent = "❌ Error de conexión";
    statusDiv.style.color = "#ff5555";
};

// Geolocalización real
realLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
    }
    
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, altitude = 0 } = position.coords;
            const data = {
                lat: latitude,
                lon: longitude,
                alt: altitude,
                time: new Date().toISOString()
            };
            socket.send(JSON.stringify(data));
            
            // Mostrar en pantalla
            coordinatesDiv.innerHTML = `
                <p><strong>Latitud:</strong> ${latitude.toFixed(4)}°</p>
                <p><strong>Longitud:</strong> ${longitude.toFixed(4)}°</p>
                <p><strong>Altitud:</strong> ${altitude ? altitude.toFixed(2) + " m" : "N/A"}</p>
            `;
        },
        (error) => {
            alert("Error al obtener la ubicación: " + error.message);
        }
    );
});

// Input manual
sendManualBtn.addEventListener("click", () => {
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    const alt = parseFloat(altInput.value) || 0;

    if (isNaN(lat) || isNaN(lon)) {
        alert("Latitud y Longitud deben ser números válidos.");
        return;
    }

    const data = { lat, lon, alt, time: new Date().toISOString() };
    socket.send(JSON.stringify(data));
    
    coordinatesDiv.innerHTML = `
        <p><strong>Latitud:</strong> ${lat}°</p>
        <p><strong>Longitud:</strong> ${lon}°</p>
        <p><strong>Altitud:</strong> ${alt} m</p>
    `;
});