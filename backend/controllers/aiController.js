const askAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3.2:3b",
                prompt: message,
                stream: false
            })
        });

        const data = await response.json();

        res.json({
            success: true,
            reply: data.response
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            success: false,
            message: "AI service is not available"
        });
    }
};

module.exports = { askAI };