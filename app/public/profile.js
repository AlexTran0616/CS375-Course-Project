let defaultAvatar = "data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    "<circle cx='50' cy='50' r='50' fill='%23d9d9d9'/>" +
    "<circle cx='50' cy='38' r='18' fill='%23a3a3a3'/>" +
    "<circle cx='50' cy='95' r='30' fill='%23a3a3a3'/>" +
    "</svg>";
let headerButton = document.getElementById("headerButton");
let headerAvatar = document.getElementById("headerAvatar");
let headerTitle = document.getElementById("headerTitle");
let editProfileOverlay = document.getElementById("editProfileOverlay");
let editProfileCloseButton = document.getElementById("editProfileCloseButton");
let editProfileAvatarPreview = document.getElementById("editProfileAvatarPreview");
let editProfileAvatarInput = document.getElementById("editProfileAvatarInput");
let changePhotoButton = document.getElementById("changePhotoButton");
let editProfileNameInput = document.getElementById("editProfileNameInput");
let editProfileDoneButton = document.getElementById("editProfileDoneButton");
let savedName = localStorage.getItem("maplineName_" + currentUser);
let savedAvatar = localStorage.getItem("maplineAvatar_" + currentUser);

const profileViewingFriendName = new URLSearchParams(window.location.search).get("friendName");

if (profileViewingFriendName) {
    headerTitle.textContent = profileViewingFriendName + "'s Mapline";
} else if (savedName) {
    headerTitle.textContent = savedName;
} else {
    headerTitle.textContent = "YOUR MAPLINE";
}

if (savedAvatar) {
    headerAvatar.src = savedAvatar;
} else {
    headerAvatar.src = defaultAvatar;
}
headerButton.addEventListener('click', function () {
    if (profileViewingFriendName) {
        return;
    }

    editProfileNameInput.value = savedName || "YOUR MAPLINE";
    editProfileAvatarPreview.src = savedAvatar || defaultAvatar;
    editProfileOverlay.classList.remove("hidden");
});
editProfileCloseButton.addEventListener('click', function () {
    editProfileOverlay.classList.add("hidden");
});
changePhotoButton.addEventListener('click', function () {
    editProfileAvatarInput.click();
});
editProfileAvatarInput.addEventListener('change', function () {
    let file = editProfileAvatarInput.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function () {
        editProfileAvatarPreview.src = reader.result;
    };
    reader.readAsDataURL(file);
});
editProfileDoneButton.addEventListener('click', function () {
    let newName = editProfileNameInput.value.trim();

    if (newName == "") {
        alert("Please enter a mapline name.");
        return;
    }

    if (newName != "") {
        headerTitle.textContent = newName;
        headerAvatar.src = editProfileAvatarPreview.src;
        savedName = newName;
        savedAvatar = editProfileAvatarPreview.src;

        localStorage.setItem("maplineName_" + currentUser, savedName);
        localStorage.setItem("maplineAvatar_" + currentUser, savedAvatar);
    }

    editProfileOverlay.classList.add("hidden");
});
