async function askAI() {
    const input = document.getElementById("aiMessage");
    const chatBox = document.getElementById("chatBox");

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // -----------------------------
    // 1. Show User Message
    // -----------------------------
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";

    const userLabel = document.createElement("strong");
    userLabel.textContent = "You: ";

    userMessage.appendChild(userLabel);
    userMessage.appendChild(
        document.createTextNode(message)
    );

    chatBox.appendChild(userMessage);

    input.value = "";

    // -----------------------------
    // 2. Loading Message
    // -----------------------------
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "ai-message";
    loadingMessage.id = "loadingMessage";

    loadingMessage.textContent = "AI: Thinking... 🤔";

    chatBox.appendChild(loadingMessage);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

        // -----------------------------
        // 3. Call Backend
        // -----------------------------
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

        // Check HTTP response
        if (!response.ok) {
            throw new Error(
                "Server returned status " + response.status
            );
        }

        const data = await response.json();

        console.log("AI Backend Response:", data);

        // Remove loading
        loadingMessage.remove();

        // -----------------------------
        // 4. Create AI Message
        // -----------------------------
        const aiMessage = document.createElement("div");
        aiMessage.className = "ai-message";

        const aiLabel = document.createElement("strong");
        aiLabel.textContent = "AI: ";

        aiMessage.appendChild(aiLabel);

        // -----------------------------
        // 5. Get AI Reply
        // -----------------------------
        if (data.success) {

            const answer = document.createElement("div");

            /*
             * Support both:
             * data.reply
             * data.answer
             */

            let formattedAnswer =
                data.reply ||
                data.answer ||
                data.response ||
                "";

            // -----------------------------
            // If response is empty
            // -----------------------------
            if (!formattedAnswer.trim()) {

                formattedAnswer =
                    "Sorry da, AI didn't return a response. 😅";

            }

            // -----------------------------
            // Escape HTML
            // -----------------------------
            formattedAnswer = formattedAnswer
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // -----------------------------
            // Bold text
            // -----------------------------
            formattedAnswer = formattedAnswer.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );

            // -----------------------------
            // Bullet points
            // -----------------------------
            formattedAnswer = formattedAnswer.replace(
                /^[*-]\s+(.*)$/gm,
                "<div class='ai-list-item'>• $1</div>"
            );

            // -----------------------------
            // Numbered lists
            // -----------------------------
            formattedAnswer = formattedAnswer.replace(
                /^(\d+)\.\s+(.*)$/gm,
                "<div class='ai-list-item'><strong>$1.</strong> $2</div>"
            );

            // -----------------------------
            // Line breaks
            // -----------------------------
            formattedAnswer = formattedAnswer
                .replace(/\n\n/g, "<br><br>")
                .replace(/\n/g, "<br>");

            answer.innerHTML = formattedAnswer;

            aiMessage.appendChild(answer);

        } else {

            aiMessage.appendChild(
                document.createTextNode(
                    data.message ||
                    "Sorry da, I couldn't process your question."
                )
            );
        }

        // Add AI message
        chatBox.appendChild(aiMessage);

    } catch (error) {

        console.error("AI Request Error:", error);

        // Remove loading
        if (loadingMessage) {
            loadingMessage.remove();
        }

        // -----------------------------
        // Error Message
        // -----------------------------
        const errorMessage = document.createElement("div");
        errorMessage.className = "ai-message";

        errorMessage.textContent =
            "AI: Unable to connect to the AI server. Please check the backend.";

        chatBox.appendChild(errorMessage);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}