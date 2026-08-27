document.querySelector("#searchButton").addEventListener("click", async function() {

    const username = document.querySelector("#search").value;

    if (!username) {
        alert("Please enter a username.");
        return;
    }

    try {
        const response = await fetch("/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username
            })
        });

        const data = await response.json();
        const results = document.querySelector("#results");

        results.innerHTML = "";

        for (let i = 0; i < data.length; i++) {

            const account = data[i];
            const user = document.createElement("div");
            const name = document.createElement("span");
            name.textContent = account.username;

            const addButton = document.createElement("button");
            addButton.textContent = "Add Friend";

            addButton.addEventListener("click", async function() {

                const userID = localStorage.getItem("userID");

                try {
                    const response = await fetch("/add-friend", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userID: userID,
                            friendID: account.id
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        addButton.textContent = "Request Sent";
                        addButton.disabled = true;
                    } else {
                        alert(data.error);
                    }

                } catch (error) {
                    console.error("Add friend error:", error);
                }

            });

            user.appendChild(name);
            user.appendChild(addButton);
            results.appendChild(user);
        }

    } catch (error) {
        console.error("Search error:", error);
    }

});


async function loadFriendRequests() {

    const userID = localStorage.getItem("userID");

    try {

        const response = await fetch(`/friend-requests?userID=${userID}`);
        const data = await response.json();
        const requests = document.querySelector("#friendRequests");

        requests.innerHTML = "";

        for (let i = 0; i < data.length; i++) {

            const account = data[i];
            const request = document.createElement("div");
            const name = document.createElement("span");
            name.textContent = account.username;

            const acceptButton = document.createElement("button");
            acceptButton.textContent = "Accept";

            acceptButton.addEventListener("click", async function() {

                try {

                    const response = await fetch("/accept-friend", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userID: userID,
                            friendID: account.id
                        })
                    });

                    const result = await response.json();

                    if (result.success) {

                        request.remove();
                        loadFriends();

                    } else {
                        alert(result.error);
                    }

                } catch (error) {
                    console.error("Accept friend error:", error);
                }

            });

            request.appendChild(name);
            request.appendChild(acceptButton);
            requests.appendChild(request);
        }

    } catch (error) {
        console.error("Friend request error:", error);
    }
}


async function loadFriends() {

    const userID = localStorage.getItem("userID");

    try {

        const response = await fetch(`/friends?userID=${userID}`);
        const data = await response.json();
        const friendsList = document.querySelector("#friendsList");

        friendsList.innerHTML = "";

        for (let i = 0; i < data.length; i++) {

            const account = data[i];
            const friend = document.createElement("div");
            const name = document.createElement("span");
            name.textContent = account.username;

            const viewButton = document.createElement("button");
            viewButton.textContent = "View Timeline";

            viewButton.addEventListener("click", async function() {

                const response = await fetch(`/get-map-id/${account.id}`);
                const data = await response.json();
            
                if (response.ok) {
                    window.location.href = `/map.html?mapID=${data.mapID}`;
                } else {
                    alert(data.error);
                }
            
            });

            friend.appendChild(name);
            friend.appendChild(viewButton);
            friendsList.appendChild(friend);
        }

    } catch (error) {

        console.error("Friends error:", error);

    }
}

document.getElementById("backToMaplineButton").addEventListener("click", function () {
    window.location.href = "map.html";
});


loadFriendRequests();
loadFriends();