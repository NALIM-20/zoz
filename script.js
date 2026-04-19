// Tvoj API kľúč vložený priamo do premennej
const GEMINI_API_KEY = "AIzaSyBfHhfBZ1yteULh8PYWkrj9LMw5IdVfaPQ";

const users = [
    { id: 1, name: "Anna", bio: "Milujem kávu a programovanie v JavaScripte." },
    { id: 2, name: "Michal", bio: "Horský vodca, ktorý hľadá parťáka na túry." },
    { id: 3, name: "AI Bot", bio: "Som pokročilá umelá inteligencia. Pýtaj sa ma na čokoľvek." }
];

let activeUser = null;

const userList = document.getElementById('user-list');
const messagesDiv = document.getElementById('messages');
const inputArea = document.getElementById('input-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// 1. Vykreslenie zoznamu ľudí
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

// 2. Otvorenie chatu
function openChat() {
    document.getElementById('chat-header').innerText = `Chat s: ${activeUser.name}`;
    messagesDiv.innerHTML = '';
    inputArea.classList.remove('hidden'); // Odstráni classu, ktorá schováva input
    inputArea.style.display = 'flex';     // Poistka, aby bol input vidieť
    addMessage(`Ahoj, ja som ${activeUser.name}. O čom si popíšeme?`, 'ai');
}

// 3. Pomocná funkcia na pridanie bubliny
function addMessage(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}-msg`;
    m.innerText = text;
    messagesDiv.appendChild(m);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return m; // Vrátime element, ak by sme ho chceli neskôr zmazať
}

// 4. Volanie Gemini API
async function askGemini(message) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const promptText = `Hráš rolu osoby na zoznamke. Tvoje meno je ${activeUser.name}. 
    Tvoj popis: ${activeUser.bio}. Odpovedaj na túto správu krátko, neformálne a po slovensky: ${message}`;

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
            return "Mám chybu v hlave: " + data.error.message;
        }
        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        return "Nepodarilo sa mi pripojiť k mozgu (skontroluj internet).";
    }
}

// 5. Akcia po kliknutí na Odoslať
sendBtn.onclick = async () => {
    const text = userInput.value.trim();
    if (text) {
        addMessage(text, 'user'); // Pridá tvoju správu
        userInput.value = '';

        // Zobrazenie indikátora písania
        const typingIndicator = addMessage(`${activeUser.name} píše...`, 'ai');

        const aiReply = await askGemini(text);
        
        // Odstránime indikátor a pridáme reálnu odpoveď
        messagesDiv.removeChild(typingIndicator);
        addMessage(aiReply, 'ai');
    }
};

// Povolenie odosielania Enterom
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});