const API_URL =
    "http://localhost:5000";


// ========================================
// FORM ELEMENTS
// ========================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


const message =
    document.getElementById(
        "message"
    );


// ========================================
// REGISTER FORM
// ========================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ========================================
            // GET FORM VALUES
            // ========================================

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const dateOfBirth =
                document
                    .getElementById("dateOfBirth")
                    .value;


            const educationQualification =
                document
                    .getElementById(
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

                message.style.color =
                    "red";

                return;

            }


            // ========================================
            // PASSWORD VALIDATION
            // ========================================

            if (password.length < 6) {

                message.textContent =
                    "Password must contain at least 6 characters.";

                message.style.color =
                    "red";

                return;

            }


            // ========================================
            // SHOW LOADING
            // ========================================

            message.textContent =
                "Creating your account...";

            message.style.color =
                "#444";


            // ========================================
            // SEND REGISTER REQUEST
            // ========================================

            try {

                const response =
                    await fetch(
                        API_URL +
                        "/api/users/register",
                        {

                            method:
                                "POST",

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


                console.log(
                    "Registration Response:",
                    data
                );


                // ========================================
                // HANDLE ERROR
                // ========================================

                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Registration failed.";

                    message.style.color =
                        "red";

                    return;

                }


                // ========================================
                // SUCCESS
                // ========================================

                message.textContent =
                    "Registration successful! Please login.";

                message.style.color =
                    "green";


                // ========================================
                // SAVE USER IF RETURNED
                // ========================================

                if (data.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                // ========================================
                // REDIRECT TO LOGIN
                // ========================================

                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1000
                );

            }


            catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );


                message.textContent =
                    "Unable to connect to the server.";

                message.style.color =
                    "red";

            }

        }
    );

}