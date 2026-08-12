let map = L.map('map').setView([51.505, -0.09], 13);
let markerX = document.getElementById("x");
let markerY = document.getElementById("y");
let markerContent = document.getElementById("content");
let addPinButton = document.getElementById("addPin");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
map.doubleClickZoom.disable();

function addMarker(event){
    L.marker([parseInt(markerX.value), parseInt(markerY.value)]).addTo(map)
    .bindPopup(content.value)
    .openPopup();
}

addPinButton.addEventListener("click", addMarker);

map.on('dblclick', function(event) {
    let marker = L.marker(event.latlng).addTo(map);

    let popupContent = `
        <input type="text" id="popupInput" placeholder="Enter content">
        <button id="popupSave">Save</button>
    `;

    marker.bindPopup(popupContent);

    marker.on('popupopen', () => {
        document.getElementById('popupSave').addEventListener('click', () => {
            let text = document.getElementById('popupInput').value;
            marker.setPopupContent(text);
        });
    });

    marker.openPopup();
});
