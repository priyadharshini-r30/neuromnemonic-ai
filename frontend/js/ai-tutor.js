const chatBox = document.getElementById("chatBox");
const questionInput = document.getElementById("questionInput");
const sendButton = document.getElementById("sendButton");

async function askAITutor() {
    const question = questionInput.value.trim();

    if (!question) {
        return;
    }

    // Show user's question
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.innerHTML = `
        <strong>You:</strong>
        <p>${question}</p>
    `;

    chatBox.appendChild(userMessage);

    // Clear input
    questionInput.value = "";

    // Disable button while AI is responding
    sendButton.disabled = true;
    sendButton.textContent = "Thinking...";

    // Show temporary AI message
    const aiMessage = document.createElement("div");
    aiMessage.className = "message ai-message";
    aiMessage.innerHTML = `
        <strong>AI Tutor:</strong>
        <p>Thinking... 🤔</p>
    `;

    chatBox.appendChild(aiMessage);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://localhost:5000/api/ai/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        aiMessage.innerHTML = `
            <strong>AI Tutor:</strong>
            <p>${data.answer.replace(/\n/g, "<br>")}</p>
        `;

    } catch (error) {
        console.error("AI Tutor Error:", error);

        aiMessage.innerHTML = `
            <strong>AI Tutor:</strong>
            <p>Sorry 😕 I couldn't connect to the AI Tutor.</p>
        `;
    }

    sendButton.disabled = false;
    sendButton.textContent = "Send";

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send button
sendButton.addEventListener("click", askAITutor);

// Press Enter to send
questionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        askAITutor();
    }
});