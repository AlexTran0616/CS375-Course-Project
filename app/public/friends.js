let friendsButton = document.getElementById("friendsButton");
let friendsOverlay = document.getElementById("friendsOverlay");
let friendsCloseButton = document.getElementById("friendsCloseButton");
let friendsList = document.getElementById("friendsList");
let addFriendInput = document.getElementById("addFriendInput");
let addFriendButton = document.getElementById("addFriendButton");
let viewingBanner = document.getElementById("viewingBanner");
let viewingBannerText = document.getElementById("viewingBannerText");
let backToMyMaplineButton = document.getElementById("backToMyMaplineButton");

//hardcoded friends cause we dont got a friends feature yet
let defaultFriends = [
    {
        name: "Alice",
        markers: [
            { id: 1, lat: 48.8566, lng: 2.3522, title: "Paris Trip", description: "Visited the Eiffel Tower", eventDate: "2018-06-15", imageSrc: null },
            { id: 2, lat: 35.6762, lng: 139.6503, title: "Tokyo", description: "Saw the cherry blossoms", eventDate: "2020-04-01", imageSrc: null }
        ]
    },
    {
        name: "Bob",
        markers: [
            { id: 1, lat: 40.7128, lng: -74.0060, title: "NYC Move", description: "Started a new job", eventDate: "2019-09-01", imageSrc: null }
        ]
    }
];
let friends = loadFriends();
function loadFriends() {
    let saved = localStorage.getItem("maplineFriends");
    if (saved) {
        return JSON.parse(saved);
    }
    return defaultFriends;
}
function saveFriends() {
    localStorage.setItem("maplineFriends", JSON.stringify(friends));
}
function renderFriendsList() {
    while (friendsList.firstChild) {
        friendsList.firstChild.remove();
    }
    for (let i = 0; i < friends.length; i++) {
        let friend = friends[i];
        let row = document.createElement("div");
        row.className = "friend-row";
        let nameSpan = document.createElement("span");
        nameSpan.className = "friend-name";
        nameSpan.textContent = friend.name;
        let buttonsDiv = document.createElement("div");
        buttonsDiv.className = "friend-buttons";
        let viewButton = document.createElement("button");
        viewButton.textContent = "View Mapline";
        viewButton.addEventListener('click', function () {
            viewFriendMapline(friend.markers, friend.name);
            friendsOverlay.classList.add("hidden");
            viewingBannerText.textContent = "Viewing " + friend.name + "'s Mapline";
            viewingBanner.classList.remove("hidden");
        });
        let removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener('click', function () {
            if (confirm("Remove " + friend.name + " from your friends?")) {
                // build a new list that skips the friend we're removing
                let newFriends = [];
                for (let j = 0; j < friends.length; j++) {
                    if (j !== i) {
                        newFriends.push(friends[j]);
                    }
                }
                friends = newFriends;
                saveFriends();
                renderFriendsList();
            }
        });
        buttonsDiv.appendChild(viewButton);
        buttonsDiv.appendChild(removeButton);
        row.appendChild(nameSpan);
        row.appendChild(buttonsDiv);
        friendsList.appendChild(row);
    }
}
friendsButton.addEventListener('click', function () {
    renderFriendsList();
    friendsOverlay.classList.remove("hidden");
});
friendsCloseButton.addEventListener('click', function () {
    friendsOverlay.classList.add("hidden");
});
addFriendButton.addEventListener('click', function () {
    let name = addFriendInput.value.trim();
    if (name == "") {
        alert("Please enter a friend's name.");
        return;
    }
    let alreadyFriends = false;
    for (let i = 0; i < friends.length; i++) {
        if (friends[i].name.toLowerCase() === name.toLowerCase()) {
            alreadyFriends = true;
        }
    }
    if (alreadyFriends) {
        alert("You are already friends with " + name + ".");
        return;
    }
    console.log("adding friend", name);
    friends.push({ name: name, markers: [] });
    saveFriends();
    renderFriendsList();
    addFriendInput.value = "";
});
backToMyMaplineButton.addEventListener('click', function () {
    backToMyMapline();
    viewingBanner.classList.add("hidden");
});
