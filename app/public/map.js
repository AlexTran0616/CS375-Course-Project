let map = L.map('map').setView([51.505, -0.09], 13);
let markerX = document.getElementById("x");
let markerY = document.getElementById("y");
let markerContent = document.getElementById("content");
let addPinButton = document.getElementById("addPin");
//let markers = new Array();
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
map.doubleClickZoom.disable();

function addMarker(event){
    let marker = L.marker([parseInt(markerX.value), parseInt(markerY.value)]);
    let text = document.getElementById('content').value;
    let file = document.getElementById('popupImageInput').files[0];

    let finalize = (imgSrc) => {
        marker.bindPopup(`
            ${imgSrc ? `<img src="${imgSrc}" style="max-width:150px;"><br>` : ""}
            ${text}
            <br><input type='button' value='Delete this marker' id='deleteButton'/>
        `);
    };

    if(file){
        let reader = new FileReader();
        reader.onload = () => finalize(reader.result);
        reader.readAsDataURL(file);
    } else {
        finalize(null);
    }
    
    marker.on('popupopen', () => {
        document.getElementById("deleteButton").addEventListener('click', () => {
            console.log("DELETE");
            map.removeLayer(marker);
        });
    })
    marker.addTo(map);
    marker.openPopup();
}

addPinButton.addEventListener("click", addMarker);

map.on('dblclick', function(event) {
    let marker = L.marker(event.latlng);
    let contentSaved = false;
    marker.addTo(map);

    let popupContent = `
        <input type="text" id="popupInput" placeholder="Enter content">
        <input type="file" id="popupImageInput" accept="image/*">
        <button id="popupSave">Save</button>
    `;

    marker.bindPopup(popupContent);

    marker.on('popupopen', () => {
        if(contentSaved){
            document.getElementById("deleteButton").addEventListener('click', () => {
                console.log("DELETE");
                map.removeLayer(marker);
            });
        }else{
            document.getElementById('popupSave').addEventListener('click', () => {
                let text = document.getElementById('popupInput').value;
                let file = document.getElementById('popupImageInput').files[0];

                let finalize = (imgSrc) => {
                    marker.setPopupContent(`
                        ${imgSrc ? `<img src="${imgSrc}" style="max-width:150px;"><br>` : ""}
                        ${text}
                        <br><input type='button' value='Delete this marker' id='deleteButton'/>
                    `);
                    contentSaved = true;
                };

                if(file){
                    let reader = new FileReader();
                    reader.onload = () => finalize(reader.result);
                    reader.readAsDataURL(file);
                } else {
                    finalize(null);
                }
            });
        }
    });

    marker.openPopup();
});
