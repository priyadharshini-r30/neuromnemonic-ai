const API_URL = "http://localhost:5000";


// ========================================
// GET FORM ELEMENTS
// ========================================

const registerForm =
    document.getElementById("registerForm");

const message =
    document.getElementById("message");


// ========================================
// REGISTER
// ========================================

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ========================================
        // GET FORM VALUES
        // ========================================

        const name =
            document.getElementById("name")
                .value
                .trim();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;

        const dateOfBirth =
            document.getElementById("dateOfBirth")
                .value;

        const educationQualification =
            document.getElementById(
                "educationQualification"
            )
                .value;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !name ||
            !email ||
            !password ||
            !dateOfBirth ||
            !educationQualification
        ) {

            message.textContent =
                "Please fill all required fields.";

            return;
        }


        // ========================================
        // SEND DATA
        // ========================================

        message.textContent =
            "Creating your account...";


        try {

            const response =
                await fetch(
                    API_URL +
                    "/api/users/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                password:
                                    password,

                                dateOfBirth:
                                    dateOfBirth,

                                educationQualification:
                                    educationQualification

                            })
                    }
                );


            const data =
                await response.json();


            // ========================================
            // HANDLE ERROR
            // ========================================

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Registration failed.";

                return;
            }


            // ========================================
            // SAVE TOKEN
            // ========================================

            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );

            }


            // ========================================
            // SUCCESS
            // ========================================

            message.textContent =
                "Registration successful!";


            // ========================================
            // GO TO GOAL SETUP
            // ========================================

            setTimeout(
                function () {

                    window.location.href =
                        "goal-setup.html";

                },
                1000
            );


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            message.textContent =
                "Unable to connect to the server.";

        }

    }
);