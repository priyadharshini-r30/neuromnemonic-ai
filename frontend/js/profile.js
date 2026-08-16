const API_URL = "http://localhost:5000/api/profile";

const token = localStorage.getItem("token");

const profileForm = document.getElementById("profileForm");
const message = document.getElementById("message");

// Login check
if (!token) {
    window.location.href = "login.html";
}


// Load profile
async function loadProfile() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        console.log("Profile data:", data);

        if (!response.ok) {
            if (response.status === 404) {
                message.textContent = "";
                return;
            }

            throw new Error(
                data.message || "Profile loading failed"
            );
        }


        // Load saved User data
        document.getElementById("name").value =
            data.name || "";

        document.getElementById("email").value =
            data.email || "";

        document.getElementById("role").value =
            data.role || "";


        // Load saved Profile data
        document.getElementById("age").value =
            data.age || "";

        document.getElementById("college").value =
            data.college || "";

        document.getElementById("course").value =
            data.course || "";

        document.getElementById("studyGoal").value =
            data.studyGoal || "";

        document.getElementById("targetExam").value =
            data.targetExam || "";

        document.getElementById("dailyStudyHours").value =
            data.dailyStudyHours || "";


        // Subjects array → text
        document.getElementById("subjects").value =
            Array.isArray(data.subjects)
                ? data.subjects.join(", ")
                : "";


        document.getElementById("bio").value =
            data.bio || "";


        message.textContent = "";

    } catch (error) {
        console.error("Profile Load Error:", error);

        message.textContent =
            "Profile loading failed";

        message.style.color = "red";
    }
}


// Save profile
profileForm.addEventListener("submit", async function (e) {
    e.preventDefault();


    // Get values
    const age =
        document.getElementById("age").value.trim();

    const college =
        document.getElementById("college").value.trim();

    const course =
        document.getElementById("course").value.trim();

    const studyGoal =
        document.getElementById("studyGoal").value.trim();

    const targetExam =
        document.getElementById("targetExam").value.trim();

    const dailyStudyHours =
        document.getElementById("dailyStudyHours").value.trim();

    const subjectsText =
        document.getElementById("subjects").value.trim();


    // Required field validation
    if (
        !age ||
        !college ||
        !course ||
        !studyGoal ||
        !targetExam ||
        !dailyStudyHours ||
        !subjectsText
    ) {
        message.textContent =
            "❌ Please fill all required profile details.";

        message.style.color = "red";

        return;
    }


    // Convert subjects text into array
    const subjects = subjectsText
        .split(",")
        .map(subject => subject.trim())
        .filter(subject => subject !== "");


    // Profile data
    const profileData = {
        age: Number(age),

        college: college,

        course: course,

        studyGoal: studyGoal,

        targetExam: targetExam,

        dailyStudyHours:
            Number(dailyStudyHours),

        subjects: subjects,

        bio:
            document.getElementById("bio").value.trim()
    };


    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify(profileData)
        });


        const data = await response.json();

        console.log(
            "Profile save response:",
            data
        );


        if (!response.ok) {
            throw new Error(
                data.message ||
                "Profile save failed"
            );
        }


        message.textContent =
            "✅ Profile saved successfully!";

        message.style.color = "green";


    } catch (error) {
        console.error(
            "Profile Save Error:",
            error
        );

        message.textContent =
            "❌ " + error.message;

        message.style.color = "red";
    }
});


// Back to dashboard
function goDashboard() {
    window.location.href =
        "dashboard.html";
}


// Load profile when page opens
loadProfile();