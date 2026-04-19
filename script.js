const users = [
    { id: 1, name: "Anna", bio: "Milujem kávu.", replies: ["Skvelé!", "Povedz mi viac.", "Zaujímavé."] },
    { id: 2, name: "Michal", bio: "Rád športujem.", replies: ["Dnes som bol behať.", "Máš rád šport?", "To je super!"] },
    { id: 3, name: "AI Bot", bio: "Vždy k dispozícii.", replies: ["Spracovávam tvoju správu...", "Rozumiem ti.", "Som tu pre teba."] }
];

let activeUser = null;

const userList = document.getElementById('user-list');
const messagesDiv = document.getElementById('messages');
const inputArea = document.getElementById('input-area');
const userInput = document.getElementById('user-input');

// Vykreslenie používateľov
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
    inputArea.classList.remove('hidden');
    addMessage(`Ahoj, ja som ${activeUser.name}! Ako sa máš?`, 'ai');
}

function addMessage(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}-msg`;
    m.innerText = text;
    messagesDiv.appendChild(m);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

document.getElementById('send-btn').onclick = () => {
    const text = userInput.value.trim();
    if (text) {
        addMessage(text, 'user');
        userInput.value = '';
        setTimeout(() => {
            const reply = activeUser.replies[Math.floor(Math.random() * activeUser.replies.length)];
            addMessage(reply, 'ai');
        }, 1000);
    }
};