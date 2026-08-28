function setupPasswordToggle(buttonId, inputId) {
    const toggleButton = document.querySelector(buttonId);
    const passwordInput = document.querySelector(inputId);
    const toggleIcon = toggleButton.querySelector("i");

    toggleButton.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.classList.remove("fa-eye");
            toggleIcon.classList.add("fa-eye-slash");
        } else {
            passwordInput.type = "password";
            toggleIcon.classList.remove("fa-eye-slash");
            toggleIcon.classList.add("fa-eye");
        }
    });
}
setupPasswordToggle("#toggleLoginPassword", "#loginPassword");
setupPasswordToggle("#toggleRegisterPassword", "#registerPassword");
document.querySelector("#login").addEventListener("click", async function () {
    const username = document.querySelector("#loginUsername").value;
    const password = document.querySelector("#loginPassword").value;
    if (!username || !password) {
        alert("Please enter both an email and a password.");
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
            alert(data.error || "Invalid email or password.");

        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Something went wrong while logging in.");
    }
});
document.querySelector("#createAccountButton").addEventListener("click", async function () {
    const username = document.querySelector("#registerUsername").value;
    const password = document.querySelector("#registerPassword").value;
    if (!username || !password) {
        alert("Please enter both an email and a password.");
        return;
    }
    try {
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
        if (response.ok) {
            console.log("Created account:", data);
            alert("Account created! You can now log in above.");
            document.querySelector("#registerUsername").value = "";
            document.querySelector("#registerPassword").value = "";
        } else {
            alert(data.error || "Something went wrong creating your account.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("Something went wrong creating your account.");
    }
});
