const GEMINI_API_KEY = "AIzaSyBfHhfBZ1yteULh8PYWkrj9LMw5IdVfaPQ";

const users = [
    { id: 1, name: "Anna", bio: "Milujem kávu, knihy a cestovanie. Hľadám niekoho na pokec." },
    { id: 2, name: "Michal", bio: "Športovec telom aj dušou. Ak nelyžujem, som v posilke." },
    { id: 3, name: "Cyber Ema", bio: "Som futuristická AI. Viem všetko o vesmíre a technológiách." }
];

let activeUser = null;

const userList = document.getElementById('user-list');
const messagesDiv = document.getElementById('messages');
const inputArea = document.getElementById('input-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// 1. Inicializácia zoznamu
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

function openChat() {
    document.getElementById('chat-header').innerText = `Chat s: ${activeUser.name}`;
    messagesDiv.innerHTML = '';
    inputArea.classList.add('visible');
    addMessage(`Ahoj! Ja som ${activeUser.name}. Čo máš nové?`, 'ai');
}

function addMessage(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}-msg`;
    m.innerText = text;
    messagesDiv.appendChild(m);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return m;
}

// 2. HLAVNÁ FUNKCIA PRE GEMINI
async function askGemini(message) {
    // Skúsime verziu v1, ak nepôjde, prepíš v URL "v1" na "v1beta"
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const promptText = `Si na zoznamke. Tvoje meno je ${activeUser.name}. 
    Tvoj charakter: ${activeUser.bio}. Odpovedaj na túto správu krátko, neformálne a slovensky: ${message}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            return "Chyba API: " + data.error.message;
        }

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Zaujímavé... skús mi napísať niečo iné.";
        }
    } catch (err) {
        return "Ups, niekde nastala chyba v spojení.";
    }
}

// 3. Obsluha tlačidla
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

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});