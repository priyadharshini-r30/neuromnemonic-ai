async function askAI() {
    const input = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");

    const message = input.value.trim();

    if (!message) return;

    // Show user message
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";

    userMessage.innerHTML = `<strong>You:</strong><p>${message}</p>`;
    chatBox.appendChild(userMessage);

    input.value = "";

    // Loading message
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "message ai-message";
    loadingMessage.innerHTML = "<strong>AI Tutor:</strong><p>Thinking... 🤔</p>";

    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(
            "http://localhost:5000/api/ai/ask",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: message
                })
            }
        );

        const data = await response.json();

        loadingMessage.remove();

        const aiMessage = document.createElement("div");
        aiMessage.className = "message ai-message";

        if (response.ok && data.success) {
            aiMessage.innerHTML = `
                <strong>AI Tutor:</strong>
                <p>${data.reply}</p>
            `;
        } else {
            aiMessage.innerHTML = `
                <strong>AI Tutor:</strong>
                <p>${data.message || "Sorry da, AI couldn't answer."}</p>
            `;
        }

        chatBox.appendChild(aiMessage);

    } catch (error) {
        console.error("AI Request Error:", error);

        loadingMessage.remove();

        const errorMessage = document.createElement("div");
        errorMessage.className = "message ai-message";

        errorMessage.innerHTML = `
            <strong>AI Tutor:</strong>
            <p>Sorry 😕 I couldn't connect to the AI Tutor.</p>
        `;

        chatBox.appendChild(errorMessage);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}


// Send button
document.getElementById("sendButton").addEventListener(
    "click",
    askAI
);


// Enter key support
document.getElementById("questionInput").addEventListener(
    "keypress",
    function (event) {
        if (event.key === "Enter") {
            askAI();
        }
    }
);