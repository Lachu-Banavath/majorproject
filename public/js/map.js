const map = L.map('map').setView(coordinates, 11); // coordinates = [lat, lng]

L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey1}`, {
    attribution: '&copy; OpenStreetMap contributors, Geoapify',
    maxZoom: 20,
}).addTo(map);

L.marker(coordinates).addTo(map)
    .bindPopup("<p>Exact Location provided after booking</p>")

    .openPopup();
