
const API_URL = "http://localhost:5000";

// Store dashboard conversation history.
const chatHistory = [];

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Format AI replies while keeping HTML safe.
function formatAIResponse(text) {
    let formatted = escapeHTML(text);

    formatted = formatted.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
    );

    formatted = formatted.replace(
        /`([^`\n]+)`/g,
        "<code>$1</code>"
    );

    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(
        /^\s*[-*]\s+(.+)$/gm,
        "<li>$1</li>"
    );

    formatted = formatted.replace(
        /^\s*\d+\.\s+(.+)$/gm,
        "<li>$1</li>"
    );

    formatted = formatted.replace(
        /((?:<li>.*?<\/li>\s*)+)/gs,
        "<ul>$1</ul>"
    );

    formatted = formatted.replace(/\n/g, "<br>");

    return formatted;
}

// Display a message using the dashboard's existing CSS classes.
function addChatMessage(sender, message) {
    const chatBox = document.getElementById("chatBox");

    if (!chatBox) {
        console.error("Dashboard chatBox element not found.");
        return null;
    }

    const messageElement = document.createElement("div");

    messageElement.className =
        sender === "user" ? "user-message" : "ai-message";

    if (sender === "user") {
        messageElement.innerHTML =
            "<strong>You:</strong><p>" +
            escapeHTML(message).replace(/\n/g, "<br>") +
            "</p>";
    } else {
        messageElement.innerHTML =
            "<strong>AI:</strong><p>" +
            formatAIResponse(message) +
            "</p>";
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;

    return messageElement;
}

// Display the light-blue thinking indicator.
function showThinkingMessage() {
    const chatBox = document.getElementById("chatBox");

    if (!chatBox) {
        return null;
    }

    const loadingMessage = document.createElement("div");
    loadingMessage.className = "ai-message";

    loadingMessage.innerHTML =
        "<strong>AI:</strong><p>🤔 Thinking...</p>";

    loadingMessage.style.backgroundColor = "#E0F2FE";
    loadingMessage.style.color = "#1E40AF";
    loadingMessage.style.padding = "12px";
    loadingMessage.style.borderRadius = "10px";

    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    return loadingMessage;
}

async function askAI() {
    const input = document.getElementById("aiMessage");
    const chatBox = document.getElementById("chatBox");

    if (!input || !chatBox) {
        console.error("Dashboard chat elements not found.");
        return;
    }

    const message = input.value.trim();

    if (!message) {
        return;
    }

    const sendButton = document.querySelector(
        'button[onclick="askAI()"]'
    );

    input.value = "";

    // Show the user's message.
    addChatMessage("user", message);

    // Show the light-blue thinking indicator.
    const loadingMessage = showThinkingMessage();

    if (sendButton) {
        sendButton.disabled = true;
    }

    try {
        const response = await fetch(`${API_URL}/api/ai/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: message,
                history: chatHistory.slice(-10),
                mode: "dashboard-chat"
            })
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message ||
                data.error ||
                "The AI request failed."
            );
        }

        const reply =
            data.reply ||
            data.answer ||
            data.response;

        if (typeof reply !== "string" || !reply.trim()) {
            throw new Error("The AI returned an empty response.");
        }

        // Replace the thinking indicator with the normal AI reply.
        if (loadingMessage) {
            loadingMessage.removeAttribute("style");

            loadingMessage.innerHTML =
                "<strong>AI:</strong><p>" +
                formatAIResponse(reply) +
                "</p>";
        } else {
            addChatMessage("assistant", reply);
        }

        // Save the successful exchange for follow-up questions.
        chatHistory.push(
            { role: "user", content: message },
            { role: "assistant", content: reply }
        );

        // Keep the most recent 20 messages in browser memory.
        if (chatHistory.length > 20) {
            chatHistory.splice(0, chatHistory.length - 20);
        }

    } catch (error) {
        console.error("Dashboard AI Chat error:", error);

        if (loadingMessage) {
            loadingMessage.removeAttribute("style");

            loadingMessage.innerHTML =
                "<strong>AI:</strong><p>" +
                "Sorry, I couldn't get a response. " +
                "Please check that the backend and Ollama are running, " +
                "then try again." +
                "</p>";
        }
    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }

        input.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Send a message when Enter is pressed.
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("aiMessage");

    if (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                askAI();
            }
        });
    }
});
