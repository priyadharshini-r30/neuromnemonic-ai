const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login Successful");

            localStorage.setItem("token", data.token);

            window.location.href = "dashboard.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        alert("Server Error");
    }
});
const showPassword = document.getElementById("showPassword");
const password = document.getElementById("password");

showPassword.addEventListener("change", () => {
    if (showPassword.checked) {
        password.type = "text";
    } else {
        password.type = "password";
    }
});