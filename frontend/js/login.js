document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Check required fields
    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/users/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Login Successful!");

            // Save authentication data
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Check onboarding status
            if (data.user.onboardingCompleted) {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "goal-setup.html";
            }

        } else {
            alert(data.message || "Login failed");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Server connection failed");
    }
});