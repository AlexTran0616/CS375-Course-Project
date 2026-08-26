document.querySelector("#login").addEventListener("click", async function () {

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    if (!username || !password) {
        alert("Please enter both a username and password.");
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {

            console.log("Login successful:", data);
            localStorage.setItem("userID", data.id);
            localStorage.setItem("currentUser", data.username);
            window.location.href = "map.html";

        } else {

            alert(data.error || "Invalid username or password.");

        }

    } catch (error) {

        console.error("Login error:", error);
        alert("Something went wrong while logging in.");

    }
});