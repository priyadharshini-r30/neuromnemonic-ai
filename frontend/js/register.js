
const API_URL = "http://localhost:5000";

const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const dateOfBirthInput = document.getElementById("dateOfBirth");

// Set today's date as the maximum allowed DOB
function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

if (dateOfBirthInput) {
    dateOfBirthInput.max = getTodayDate();
}

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const dateOfBirth = dateOfBirthInput.value;

        const educationQualification =
            document.getElementById("educationQualification").value;

        if (
            !name ||
            !email ||
            !password ||
            !dateOfBirth ||
            !educationQualification
        ) {
            message.textContent =
                "Please fill all required fields.";

            message.style.color = "red";
            return;
        }

        // Validate Date of Birth
        const todayDate = getTodayDate();

        if (dateOfBirth > todayDate) {

            message.textContent =
                "Date of Birth cannot be in the future.";

            message.style.color = "red";
            dateOfBirthInput.value = "";
            dateOfBirthInput.focus();

            return;
        }

        // Password validation:
        // 8+ characters
        // 1 uppercase
        // 1 lowercase
        // 1 number
        // 1 special character

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

        if (!passwordPattern.test(password)) {

            message.textContent =
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

            message.style.color = "red";
            return;
        }

        message.textContent =
            "Creating your account...";

        message.style.color = "#444";

        try {

            const response = await fetch(
                API_URL + "/api/users/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        dateOfBirth: dateOfBirth,
                        educationQualification:
                            educationQualification
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Registration failed.";

                message.style.color = "red";
                return;
            }

            message.textContent =
                "Registration successful! Please login.";

            message.style.color = "green";

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            setTimeout(function () {

                window.location.href = "login.html";

            }, 1000);

        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";

            message.style.color = "red";
        }
    });
}
