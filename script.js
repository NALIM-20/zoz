const GEMINI_API_KEY = "AIzaSyBfHhfBZ1yteULh8PYWkrj9LMw5IdVfaPQ";

async function askGemini(message, userProfile) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // Pripravíme inštrukciu pre AI, aby vedela, za koho má hrať
    const prompt = `Hraj rolu osoby na zoznamke. Tvoje meno je ${userProfile.name}. 
                    Tvoj popis je: ${userProfile.bio}. 
                    Tu je správa od používateľa: "${message}". 
                    Odpovedaj krátko, neformálne a slovensky.`;

    const data = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        return json.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Chyba:", error);
        return "Prepáč, stratila som spojenie (skontroluj API kľúč).";
    }
}

// Úprava funkcie pri kliknutí na Odoslať
document.getElementById('send-btn').onclick = async () => {
    const text = userInput.value.trim();
    if (text) {
        addMessage(text, 'user');
        userInput.value = '';
        
        // Zobrazíme "AI premýšľa" (voliteľné)
        const loadingMsg = "Píše...";
        addMessage(loadingMsg, 'ai');

        const aiReply = await askGemini(text, activeUser);
        
        // Odstránime poslednú "loading" správu a pridáme reálnu
        const messages = document.getElementById('messages');
        messages.removeChild(messages.lastChild);
        
        addMessage(aiReply, 'ai');
    }
};