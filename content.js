document.addEventListener("dblclick", async (e) => {
    let word = window.getSelection().toString().trim();

    if (word && /^[a-zA-Z\-]+$/.test(word)) {
        const meaning = await fetchMeaning(word);
        const explanation = await fetchAIExplanation(word);
        showPopup(e.pageX, e.pageY, word, meaning, explanation);
    }
});

async function fetchMeaning(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        return data[0]?.meanings[0]?.definitions[0]?.definition || "Meaning not found.";
    } catch (error) {
        return "Error fetching meaning.";
    }
}

async function fetchAIExplanation(word) {
    const apiKey = "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";  // ← Replace with your actual key

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant who explains words in plain English with simple examples."
                    },
                    {
                        role: "user",
                        content: `Explain the word "${word}" in plain English with a short example sentence.`
                    }
                ],
                max_tokens: 60,
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "AI explanation not available.";
    } catch (error) {
        return "Could not fetch AI explanation.";
    }
}

function showPopup(x, y, word, meaning, explanation) {
    const existing = document.getElementById("wordwhiz-popup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "wordwhiz-popup";
    popup.style.cssText = `
        position: absolute;
        top: ${y + 10}px;
        left: ${x + 10}px;
        background: white;
        color: black;
        border: 1px solid #ccc;
        padding: 10px;
        font-family: sans-serif;
        font-size: 14px;
        max-width: 300px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        z-index: 99999;
    `;
    popup.innerHTML = `
        <strong>${word}</strong><br>
        <b>📖 Meaning:</b> ${meaning}<br><br>
        <b>🤖 GPT:</b> ${explanation}
    `;
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 10000);
}

