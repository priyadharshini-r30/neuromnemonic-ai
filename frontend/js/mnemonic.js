const generateBtn = document.getElementById("generateBtn");
const topicInput = document.getElementById("topic");
const languageSelect = document.getElementById("language");
const typeSelect = document.getElementById("type");
const resultDiv = document.getElementById("result");
const loadingDiv = document.getElementById("loading");

generateBtn.addEventListener("click", async () => {

    const topic = topicInput.value.trim();
    const language = languageSelect.value;
    const type = typeSelect.value;

    // Check topic
    if (!topic) {
        alert("Please enter a topic!");
        return;
    }

    // Show loading
    loadingDiv.style.display = "block";
    resultDiv.textContent = "";

    try {

        let endpoint;

        // Select API based on generation type
        if (type === "mnemonic") {
            endpoint = "http://localhost:5000/api/mnemonic/mnemonic";
        } else {
            endpoint = "http://localhost:5000/api/mnemonic/story";
        }

        // Send request to backend
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic: topic,
                language: language
            })
        });

        const data = await response.json();

        // Handle backend error
        if (!response.ok) {
            throw new Error(data.message || "Generation failed");
        }

        // Display result
        if (type === "mnemonic") {
            resultDiv.textContent = data.mnemonic;
        } else {
            resultDiv.textContent = data.story;
        }

    } catch (error) {

        console.error("Generation Error:", error);

        resultDiv.textContent =
            "❌ Failed to generate. Please make sure the backend server and Ollama are running.";

    } finally {

        // Hide loading
        loadingDiv.style.display = "none";
    }
});