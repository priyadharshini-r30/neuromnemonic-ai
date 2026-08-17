async function askAI() {
    const input = document.getElementById("aiMessage");
    const chatBox = document.getElementById("chatBox");

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // Create user message safely
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";

    const userLabel = document.createElement("strong");
    userLabel.textContent = "You: ";

    userMessage.appendChild(userLabel);
    userMessage.appendChild(document.createTextNode(message));

    chatBox.appendChild(userMessage);

    input.value = "";

    // Loading message
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "ai-message";
    loadingMessage.id = "loadingMessage";
    loadingMessage.textContent = "AI: Thinking...";

    chatBox.appendChild(loadingMessage);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://localhost:5000/api/ai/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        loadingMessage.remove();

        const aiMessage = document.createElement("div");
        aiMessage.className = "ai-message";

        const aiLabel = document.createElement("strong");
        aiLabel.textContent = "AI: ";

        aiMessage.appendChild(aiLabel);
        aiMessage.appendChild(
            document.createTextNode(
                data.success
                    ? data.reply
                    : "Sorry, I couldn't process your question."
            )
        );

        chatBox.appendChild(aiMessage);

    } catch (error) {
        console.error("AI Request Error:", error);

        loadingMessage.remove();

        const errorMessage = document.createElement("div");
        errorMessage.className = "ai-message";
        errorMessage.textContent =
            "AI: Unable to connect to the AI server.";

        chatBox.appendChild(errorMessage);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}