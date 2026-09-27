document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        // ========================================
        // VALIDATION
        // ========================================

        if (!email || !password) {

            alert(
                "Please enter email and password"
            );

            return;
        }


        try {

            // ========================================
            // LOGIN
            // ========================================

            const response =
                await fetch(
                    "http://localhost:5000/api/users/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            // ========================================
            // LOGIN FAILED
            // ========================================

            if (!response.ok) {

                alert(
                    data.message ||
                    "Login failed"
                );

                return;
            }


            // ========================================
            // SAVE LOGIN DATA
            // ========================================

            localStorage.setItem(
                "token",
                data.token
            );


            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            console.log(
                "Login successful"
            );


            // ========================================
            // CHECK SAVED GOAL
            // ========================================

            try {

                const goalResponse =
                    await fetch(
                        "http://localhost:5000/api/goals",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    `Bearer ${data.token}`
                            }
                        }
                    );


                // ====================================
                // GOAL EXISTS
                // ====================================

                if (goalResponse.ok) {

                    const goal =
                        await goalResponse.json();


                    console.log(
                        "Saved goal found:",
                        goal
                    );


                    // Save goal locally
                    localStorage.setItem(
                        "goal",
                        JSON.stringify(goal)
                    );


                    // Existing user
                    // directly go to dashboard

                    window.location.href =
                        "dashboard.html";

                    return;
                }


                // ====================================
                // GOAL NOT FOUND
                // ====================================

                if (
                    goalResponse.status === 404
                ) {

                    console.log(
                        "No saved goal found."
                    );


                    // New user / incomplete setup
                    window.location.href =
                        "goal-setup.html";

                    return;
                }


                // ====================================
                // OTHER GOAL ERROR
                // ====================================

                console.error(
                    "Goal check failed:",
                    goalResponse.status
                );


                // Safe fallback
                window.location.href =
                    "dashboard.html";


            } catch (goalError) {

                console.error(
                    "Goal checking error:",
                    goalError
                );


                // Login itself was successful.
                // So don't send the user back
                // to registration/login.

                window.location.href =
                    "dashboard.html";
            }


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            alert(
                "Server connection failed"
            );

        }

    });