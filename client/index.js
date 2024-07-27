let ws;
const connectContainer = document.getElementById("connect-container");
const chatContainer = document.getElementById("chat-container");
const messagesContainer = document.getElementById("messages");
const usernameInput = document.getElementById("username-input");
const messageInput = document.getElementById("message-input");
const connectBtn = document.getElementById("connect-btn");
const sendBtn = document.getElementById("send-btn");

connectBtn.addEventListener("click", connectToChat);
sendBtn.addEventListener("click", sendMessage);

function connectToChat() {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a username");
    return;
  }

  ws = new WebSocket("ws://localhost:80/ws");

  ws.addEventListener("open", () => {
    console.log("WebSocket connection established");
    connectContainer.style.display = "none";
    chatContainer.style.display = "block";
    addSystemMessage("Connected to chat room");
  });

  ws.addEventListener("close", () => {
    console.log("WebSocket connection closed");
    addSystemMessage("Disconnected from chat room");
  });

  ws.addEventListener("error", () => {
    console.log("WebSocket error");
    addSystemMessage("Error connecting to chat room");
  });

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    console.log("received message", message);
    addMessage(message);
  });
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const message = {
    user: usernameInput.value,
    content: content,
  };

  ws.send(JSON.stringify(message));
  messageInput.value = "";
}

function addMessage({ user, content }) {
  const isSentMessage = user === usernameInput.value;

  const messageElement = document.createElement("div");
  messageElement.className = `message ${
    isSentMessage ? "message-sent" : "message-received"
  }`;
  messageElement.innerHTML = `
            <div class="message-user">${user}</div>
            <div class="message-content">${content}</div>
        `;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  messageInput.focus();
}

function addSystemMessage(content) {
  const systemMsg = document.createElement("div");
  systemMsg.innerHTML = `
            <sl-alert open style="margin-bottom: 1rem;">
            <sl-icon slot="icon" name="info-circle"></sl-icon>
                ${content}
            </sl-alert>
        `;
  messagesContainer.appendChild(systemMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Allow sending messages with Enter key
messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
