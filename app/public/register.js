document.querySelector("#createAccountButton").addEventListener("click", async function () {

        const username = document.querySelector("#username").value;
        const password = document.querySelector("#password").value;

        const response = await fetch("/register", {
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

        console.log("Created account:", data);
    });