// TVOJ API KĽÚČ
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

// 1. Inicializácia zoznamu ľudí
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
    inputArea.classList.add('visible'); // Toto aktivuje zobrazenie inputu (cez CSS class)
    inputArea.style.display = 'flex';   // Poistka pre zobrazenie
    addMessage(`Ahoj! Ja som ${activeUser.name}. O čom si dnes popíšeme?`, 'ai');
}

// 3. Pomocná funkcia na pridanie bubliny do chatu
function addMessage(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}-msg`;
    m.innerText = text;
    messagesDiv.appendChild(m);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return m;
}

// 4. FUNKCIA PRE VOLANIE GEMINI (v1beta verzia)
async function askGemini(message) {
    // Používame v1beta, ktorá zvyčajne funguje s novými kľúčmi lepšie
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const promptText = `Hráš rolu osoby na zoznamke. Tvoje meno je ${activeUser.name}. 
    Tvoj popis: ${activeUser.bio}. Odpovedaj na túto správu od používateľa krátko, neformálne a po slovensky: ${message}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        // Ak API vráti chybu, zobrazíme ju pre ladenie
        if (data.error) {
            console.error("Gemini Error:", data.error);
            return "Chyba v hlave: " + data.error.message;
        }

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Hm, neviem čo na to povedať...";
        }
    } catch (err) {
        console.error("Network Error:", err);
        return "Niekde sa prerušilo spojenie.";
    }
}

// 5. Obsluha tlačidla Odoslať
sendBtn.onclick = async () => {
    const text = userInput.value.trim();
    if (!text) return;

    // Pridáme tvoju správu
    addMessage(text, 'user');
    userInput.value = '';

    // Indikátor, že AI píše
    const typingIndicator = addMessage(`${activeUser.name} píše...`, 'ai');

    // Počkáme na odpoveď od Gemini
    const aiReply = await askGemini(text);
    
    // Odstránime indikátor "píše..." a nahradíme ho skutočnou odpoveďou
    messagesDiv.removeChild(typingIndicator);
    addMessage(aiReply, 'ai');
};

// Povolenie odosielania správ Enterom
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});