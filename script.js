const GEMINI_API_KEY = "AIzaSyBfHhfBZ1yteULh8PYWkrj9LMw5IdVfaPQ";

const users = [
    { id: 1, name: "Anna", bio: "Milujem kávu, knihy a hľadám niekoho na pokec." },
    { id: 2, name: "Michal", bio: "Športovec telom aj dušou. Rád chodím na túry." },
    { id: 3, name: "AI Bot", bio: "Som futuristický robot. Pýtaj sa ma na čokoľvek." }
];

let activeUser = null;

const userList = document.getElementById('user-list');
const messagesDiv = document.getElementById('messages');
const inputArea = document.getElementById('input-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// 1. Vytvorenie zoznamu ľudí v sidebare
users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `<strong>${user.name}</strong><br><small>${user.bio}</small>`;
    div.onclick = () => {
        activeUser = user;
        document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
        openChat();
    };
    userList.appendChild(div);
});

// 2. Otvorenie okna chatu
function openChat() {
    document.getElementById('chat-header').innerText = `Chat s: ${activeUser.name}`;
    messagesDiv.innerHTML = ''; // Vyčistí staré správy
    inputArea.classList.add('active'); // Zobrazí políčko na písanie
    addMessage(`Ahoj! Ja som ${activeUser.name}. O čom si dnes popíšeme?`, 'ai');
}

// 3. Pridanie správy do okna
function addMessage(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}-msg`;
    m.innerText = text;
    messagesDiv.appendChild(m);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return m;
}

// 4. VOLANIE GEMINI API
async function askGemini(message) {
    // Skúsime najprv stabilnú v1 verziu
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestData = {
        contents: [{
            parts: [{ text: `Si na zoznamke ako ${activeUser.name}. Bio: ${activeUser.bio}. Odpovedaj na túto správu krátko a slovensky: ${message}` }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.error) {
            console.error("API Chyba:", data.error);
            return "Chyba: " + data.error.message;
        }

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Zaujímavé... skús mi napísať niečo iné.";
        }
    } catch (err) {
        return "Nepodarilo sa pripojiť k AI serveru.";
    }
}

// 5. Kliknutie na tlačidlo Odoslať
sendBtn.onclick = async () => {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    const typing = addMessage(`${activeUser.name} píše...`, 'ai');

    const aiReply = await askGemini(text);
    
    messagesDiv.removeChild(typing);
    addMessage(aiReply, 'ai');
};

// Odoslanie cez ENTER
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});