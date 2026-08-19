async function askAI() {
    const input = document.getElementById("aiMessage");
    const chatBox = document.getElementById("chatBox");

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // User message
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
    loadingMessage.textContent = "AI: Thinking... 🤔";

    chatBox.appendChild(loadingMessage);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://localhost:5000/api/ai/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: message
            })
        });

        const data = await response.json();

        loadingMessage.remove();

        const aiMessage = document.createElement("div");
        aiMessage.className = "ai-message";

        if (data.success) {

            const aiLabel = document.createElement("strong");
            aiLabel.textContent = "AI: ";

            aiMessage.appendChild(aiLabel);

            const answer = document.createElement("div");

            let formattedAnswer = data.answer;

            // Escape HTML to keep AI output safe
            formattedAnswer = formattedAnswer
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // Convert **bold text** to <strong>
            formattedAnswer = formattedAnswer.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );

            // Convert numbered lists
            formattedAnswer = formattedAnswer.replace(
                /^(\d+)\.\s+(.*)$/gm,
                "<div class='ai-list-item'><strong>$1.</strong> $2</div>"
            );

            // Convert bullet points
            formattedAnswer = formattedAnswer.replace(
                /^[*-]\s+(.*)$/gm,
                "<div class='ai-list-item'>• $1</div>"
            );

            // Convert paragraphs and line breaks
            formattedAnswer = formattedAnswer
                .replace(/\n\n/g, "<br><br>")
                .replace(/\n/g, "<br>");

            answer.innerHTML = formattedAnswer;

            aiMessage.appendChild(answer);

        } else {

            aiMessage.textContent =
                "AI: Sorry, I couldn't process your question.";

        }

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