document.querySelector("#login").addEventListener("click", async function () {

        const username = document.querySelector("#username").value;

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username
            })
        });

        const data = await response.json();

        console.log("Retrieved from database:", data);
    });