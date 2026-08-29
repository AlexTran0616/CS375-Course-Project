let map = L.map('map').setView([39.956, -75.195], 15);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
map.doubleClickZoom.disable();
let msPerDay = 1000 * 60 * 60 * 24;
let timelineStart;
let timelineEnd;
let totalTimelineDays;
let timelineElapsedColor = "#098428";
let timelineRemainingColor = "#b6f2c9";
let monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];
let nextMarkerId = crypto.randomUUID();
let pendingChanges = new Map(); // id -> { type: 'add' | 'edit' | 'delete', data }
let myMarkers = [];
let markers = myMarkers;
let isReadOnly = false;
let currentEditId = null;
let timelineSlider = document.getElementById("timelineSlider");
let timelineStartLabel = document.getElementById("timelineStartLabel");
let timelineEndLabel = document.getElementById("timelineEndLabel");
let addMarkerPanel = document.getElementById("addMarkerPanel");
let yCoordinateInput = document.getElementById("yCoordinateInput");
let xCoordinateInput = document.getElementById("xCoordinateInput");
let titleInput = document.getElementById("titleInput");
let eventDateInput = document.getElementById("eventDateInput");
let addMarkerButton = document.getElementById("addMarkerButton");
let editMarkerOverlay = document.getElementById("editMarkerOverlay");
let editMarkerCloseButton = document.getElementById("editMarkerCloseButton");
let editTitleInput = document.getElementById("editTitleInput");
let editEventDateInput = document.getElementById("editEventDateInput");
let editDescriptionInput = document.getElementById("editDescriptionInput");
let editImageInput = document.getElementById("editImageInput");
let editImagePreview = document.getElementById("editImagePreview");
let editMarkerDoneButton = document.getElementById("editMarkerDoneButton");
let saveMaplineButton = document.getElementById("saveMaplineButton");
addMarkerPanel.classList.add("hidden");
let currentMapId = null;
let currentUser = localStorage.getItem("currentUser");

const params = new URLSearchParams(window.location.search);
const viewingMapID = params.get("mapID");
const viewingFriendName = params.get("friendName");
if (!currentUser) {
    console.log("null user");
    window.location.href = "login.html"; // no user info, force re-login
}

function formatDateLabel(date) {
    return monthNames[date.getMonth()] + " " + date.getFullYear();
}
function dateFromSliderValue(value) {
    return new Date(timelineStart.getTime() + value * msPerDay);
}
function formatDateForInput(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
}
function parseDateInput(value) {
    return new Date(value + "T00:00:00");
}
function updateTimelineLabels() {
    timelineStartLabel.textContent = formatDateLabel(dateFromSliderValue(Number(timelineSlider.value)));
    timelineEndLabel.textContent = formatDateLabel(timelineEnd);
}
function updateSliderGradient() {
    let percent = (Number(timelineSlider.value) / Number(timelineSlider.max)) * 100;
    timelineSlider.style.background =
        "linear-gradient(to right, " +
        timelineElapsedColor + " 0%, " +
        timelineElapsedColor + " " + percent + "%, " +
        timelineRemainingColor + " " + percent + "%, " +
        timelineRemainingColor + " 100%)";
}
function recalculateTimelineBounds() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    timelineEnd = today;

    let oneYearBack = new Date(today);
    oneYearBack.setFullYear(oneYearBack.getFullYear() - 1);

    if (markers.length === 0) {
        timelineStart = oneYearBack;
    } else {
        let earliest = markers[0].eventDate;
        for (let i = 1; i < markers.length; i++) {
            if (markers[i].eventDate < earliest) {
                earliest = markers[i].eventDate;
            }
        }
        if (earliest < oneYearBack) {
            timelineStart = earliest;
        } else {
            timelineStart = oneYearBack;
        }
    }
    totalTimelineDays = Math.round((timelineEnd - timelineStart) / msPerDay);
    timelineSlider.max = totalTimelineDays;
    timelineSlider.value = totalTimelineDays;

    updateTimelineLabels();
    updateSliderGradient();
}
function filterMarkersByTimeline() {
    for (let i = 0; i < markers.length; i++) {
        let selectedDate = dateFromSliderValue(Number(timelineSlider.value));
        let record = markers[i];
        let shouldShow = record.eventDate <= selectedDate;
        let isShowing = map.hasLayer(record.leafletMarker);

        if (shouldShow && !isShowing) {
            record.leafletMarker.addTo(map);
        } else if (!shouldShow && isShowing) {
            map.removeLayer(record.leafletMarker);
        }
    }
}
function buildPopupContent(record, readOnly) {
    let imageHtml = record.imageSrc ? `<img src="${record.imageSrc}" class="popup-image"><br>` : "";
    let descriptionHtml = record.description ? `<p class="popup-description">${record.description}</p>` : "";
    let buttonsHtml = readOnly ? "" : `
        <div class="popup-buttons">
            <button id="popupEditButton"><i class="fa-solid fa-pen"></i> Edit</button>
            <button id="popupDeleteButton"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
    `;
    return `
        <div class="marker-popup">
            <strong>${record.title}</strong>
            ${imageHtml}
            ${descriptionHtml}
            ${buttonsHtml}
        </div>
    `;
}
function createLeafletMarkerForRecord(record, readOnly) {
    let leafletMarker = L.marker([record.lat, record.lng]);
    leafletMarker.bindPopup(buildPopupContent(record, readOnly));
    if (!readOnly) {
        leafletMarker.on('popupopen', () => {
            document.getElementById("popupEditButton").addEventListener('click', () => {
                map.closePopup();
                openEditMarkerModal(record);
            });
            document.getElementById("popupDeleteButton").addEventListener('click', () => {
                if (confirm("Delete this marker?")) {
                    console.log("DELETE");
                    deleteMarkerRecord(record);
                }
            });
        });
    }
    record.leafletMarker = leafletMarker;
}
function deleteMarkerRecord(record) {
    markChanged(record, 'delete');
    map.removeLayer(record.leafletMarker);
    markers = markers.filter(m => m !== record);
    recalculateTimelineBounds();
    filterMarkersByTimeline();
}
function openEditMarkerModal(record) {
    currentEditId = record.id;
    editTitleInput.value = record.title;
    editEventDateInput.value = formatDateForInput(record.eventDate);
    editDescriptionInput.value = record.description;
    if (record.imageSrc) {
        editImagePreview.src = record.imageSrc;
        editImagePreview.classList.remove("hidden");
    } else {
        editImagePreview.src = "";
        editImagePreview.classList.add("hidden");
    }
    editImageInput.value = "";
    editMarkerOverlay.classList.remove("hidden");
}
function closeEditMarkerModal() {
    editMarkerOverlay.classList.add("hidden");
    currentEditId = null;
}
function findMarkerById(id) {
    for (let i = 0; i < markers.length; i++) {
        if (markers[i].id === id) {
            return markers[i];
        }
    }
    return null;
}
editMarkerCloseButton.addEventListener('click', closeEditMarkerModal);
editMarkerDoneButton.addEventListener('click', function () {
    let record = findMarkerById(currentEditId);
    if (!record) {
        closeEditMarkerModal();
        return;
    }
    let newTitle = editTitleInput.value.trim();
    let newDateValue = editEventDateInput.value;
    if (!newTitle) {
        alert("Please enter a title.");
        return;
    }
    if (!newDateValue) {
        alert("Please choose an event date.");
        return;
    }
    record.title = newTitle;
    record.description = editDescriptionInput.value.trim();
    record.eventDate = parseDateInput(newDateValue);
    let file = editImageInput.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = () => {
            record.imageSrc = reader.result;
            record.leafletMarker.setPopupContent(buildPopupContent(record, false));
            recalculateTimelineBounds();
            filterMarkersByTimeline();
            closeEditMarkerModal();
            markChanged(record, 'edit'); 
        };
        reader.readAsDataURL(file);
    } else {
        record.leafletMarker.setPopupContent(buildPopupContent(record, false));
        recalculateTimelineBounds();
        filterMarkersByTimeline();
        closeEditMarkerModal();
        markChanged(record, 'edit'); 
    }
});
addMarkerButton.addEventListener('click', function () {
    let yValue = parseFloat(yCoordinateInput.value);
    let xValue = parseFloat(xCoordinateInput.value);
    let title = titleInput.value.trim();
    let dateValue = eventDateInput.value;
    if (isNaN(yValue) || yValue < -90 || yValue > 90) {
        alert("Please enter a valid Y coordinate between -90 and 90.");
        return;
    }
    if (isNaN(xValue) || xValue < -180 || xValue > 180) {
        alert("Please enter a valid X coordinate between -180 and 180.");
        return;
    }
    if (!title) {
        alert("Please enter a title.");
        return;
    }
    if (!dateValue) {
        alert("Please choose an event date.");
        return;
    }
    let record = {
        id: nextMarkerId,
        lat: yValue,
        lng: xValue,
        title: title,
        description: "",
        eventDate: parseDateInput(dateValue),
        imageSrc: null,
        leafletMarker: null
    };
    nextMarkerId = crypto.randomUUID();
    console.log("adding marker", record);
    createLeafletMarkerForRecord(record, false);
    markers.push(record);
    markChanged(record, 'add');
    recalculateTimelineBounds();
    filterMarkersByTimeline();
    yCoordinateInput.value = "";
    xCoordinateInput.value = "";
    titleInput.value = "";
    eventDateInput.value = "";
});
map.on('dblclick', function(event) {
    if (isReadOnly) {
        return;
    }
    let today = new Date();
    today.setHours(0,0,0,0);
    let record = {
        id: nextMarkerId,
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        title: "",
        description: "",
        eventDate: today,
        imageSrc: null,
        leafletMarker: null
    };
    nextMarkerId = crypto.randomUUID();
    console.log("adding marker", record);
    createLeafletMarkerForRecord(record, false);
    markers.push(record);
    markChanged(record, 'add');
    recalculateTimelineBounds();
    filterMarkersByTimeline();
});
timelineSlider.addEventListener('input', function () {
    updateTimelineLabels();
    updateSliderGradient();
    filterMarkersByTimeline();
});
function viewFriendMapline(friendMarkerData, friendName) {
    for (let i = 0; i < markers.length; i++) {
        map.removeLayer(markers[i].leafletMarker);
    }
    let friendRecords = [];
    for (let i = 0; i < friendMarkerData.length; i++) {
        let data = friendMarkerData[i];
        let record = {
            id: data.id,
            lat: data.lat,
            lng: data.lng,
            title: data.title,
            description: data.description,
            eventDate: new Date(data.eventDate),
            imageSrc: data.imageSrc,
            leafletMarker: null
        };
        createLeafletMarkerForRecord(record, true);
        friendRecords.push(record);
    }
    markers = friendRecords;
    isReadOnly = true;
    //addMarkerPanel.classList.add("hidden");
    recalculateTimelineBounds();
    filterMarkersByTimeline();
}
function backToMyMapline() {
    for (let i = 0; i < markers.length; i++) {
        map.removeLayer(markers[i].leafletMarker);
    }
    markers = myMarkers;
    isReadOnly = false;
    //addMarkerPanel.classList.remove("hidden");
    recalculateTimelineBounds();
    filterMarkersByTimeline();
}
function markChanged(record, type) {
    if (type === 'delete') {
        // if it was never saved to the DB, deleting it is a true no-op — just drop it
        if (pendingChanges.get(record.id)?.type === 'add') {
            pendingChanges.delete(record.id);
            return;
        }
        pendingChanges.set(record.id, { type: 'delete' });
        return;
    }

    // if already marked as 'add', keep it as 'add' with updated data (don't downgrade to 'edit')
    let existing = pendingChanges.get(record.id);
    let effectiveType = existing?.type === 'add' ? 'add' : type;
    pendingChanges.set(record.id, { type: effectiveType, data: convertForDB(record) });
}
function convertForRecord(dbMarker){
    let dt = new Date(dbMarker.dt);
    dt.setHours(0,0,0,0);
    dbMarker.eventDate = dt;
    dbMarker.id = dbMarker.marker_id;
    dbMarker.imageSrc = dbMarker.image;

    createLeafletMarkerForRecord(dbMarker, isReadOnly);

    return dbMarker;
}
async function loadMapline(){
    if(currentMapId){
        console.log("Loading MapLine...");
        let response = await fetch(`/load-map/${currentMapId}`);
        myMarkers = await response.json();
        myMarkers = myMarkers.map(convertForRecord);
        markers = myMarkers;
        recalculateTimelineBounds();
        filterMarkersByTimeline();
        console.log("MapLine loaded");
    } else {
        console.log("No map id found");
    }
}
function convertForDB(record){
    dbMarker = {
        id: record.id,
        lat: record.lat,
        lng: record.lng,
        title: record.title,
        description: record.description,
        eventDate: record.eventDate.toISOString(),
        imageSrc: record.imageSrc
    };
    return dbMarker
}
async function ensureMapExists() {

    if (!currentUser) {
        return null;
    }
    if (viewingMapID) {
        currentMapId = parseInt(viewingMapID);
        isReadOnly = true;
        addMarkerPanel.classList.add("hidden");
        saveMaplineButton.classList.add("hidden");
    
        if (viewingFriendName) {
            headerTitle.textContent = viewingFriendName + "'s Mapline";
        }
    
        loadMapline();
        return currentMapId;
    }

    if (currentMapId) {
        isReadOnly = false;
        addMarkerPanel.classList.remove("hidden");
        loadMapline();
        return currentMapId;
    }else {
        let response = await fetch('/create-map', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: headerTitle.textContent,
                owner: currentUser
            })
        });

        let data = await response.json();

        currentMapId = data.id;
        loadMapline();

        return currentMapId;
    }
}
async function saveMapline() {
    let mapId = currentMapId;

    let markersToAdd = [];
    let markersToEdit = [];
    let markersToDelete = [];

    for (let [id, change] of pendingChanges) {
        if (change.type === 'add') markersToAdd.push(change.data);
        else if (change.type === 'edit') markersToEdit.push(change.data);
        else if (change.type === 'delete') markersToDelete.push(id);
    }

    let response = await fetch('/update-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapId, markersToAdd, markersToEdit, markersToDelete })
    });

    if (response.ok) {
        pendingChanges.clear();
    }
}
saveMaplineButton.addEventListener('click', saveMapline);
ensureMapExists();
recalculateTimelineBounds();