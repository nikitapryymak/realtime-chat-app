let ws;
const connectContainer = document.getElementById("connect-container");
const chatContainer = document.getElementById("chat-container");
const messagesContainer = document.getElementById("messages");
const usernameInput = document.getElementById("username-input");
const messageInput = document.getElementById("message-input");
const connectBtn = document.getElementById("connect-btn");
const sendBtn = document.getElementById("send-btn");
const disconnectBtn = document.getElementById("disconnect-btn");

connectBtn.addEventListener("click", connectToChat);
sendBtn.addEventListener("click", sendMessage);
disconnectBtn.addEventListener("click", disconnectFromChat);

function thowError(message) {
  throw new Error(message);
}

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

    const chatEvent = {
      type: "event",
      action: "joined",
      user: username,
    };
    ws.send(JSON.stringify(chatEvent));
  });

  ws.addEventListener("close", () => {
    console.log("WebSocket connection closed");
    connectContainer.style.display = "block";
    chatContainer.style.display = "none";
  });

  ws.addEventListener("error", () => {
    console.log("WebSocket error");
    addSystemMessage("Error connecting to chat room");
  });

  ws.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);

      message.type === "event"
        ? handleChatEvent(message)
        : message.type === "message"
        ? handleChatMessage(message)
        : thowError(`Unhandled message type: ${message.type}`);
    } catch (error) {
      console.log("Error recieving message", error);
    }
  });
}

function disconnectFromChat() {
  if (!ws) return;
  const chatEvent = {
    type: "event",
    action: "left",
    user: usernameInput.value.trim(),
  };
  ws.send(JSON.stringify(chatEvent));
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const message = {
    type: "message",
    user: usernameInput.value,
    content,
  };

  ws.send(JSON.stringify(message));
  messageInput.value = "";
}

function handleChatMessage({ user, content }) {
  const isSentMessage = user === usernameInput.value;

  const messageElement = document.createElement("div");
  messageElement.className = `message ${
    isSentMessage ? "message-sent" : "message-received"
  }`;
  messageElement.innerHTML = `
    <div class="message-user">${user}</div>
    <div class="message-content">${content}</div>`;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  messageInput.focus();
}

function handleChatEvent({ user, action }) {
  // handle "leave chat" event
  if (user === usernameInput.value && action === "left") {
    ws.close();
    ws = null;
    return;
  }

  const eventElement = document.createElement("div");
  const actionText =
    action === "joined"
      ? "joined the chat"
      : action === "left"
      ? "left the chat"
      : thowError(`Unhandled event action: ${action}`);
  eventElement.innerHTML = `
    <sl-alert open style="margin-bottom: 1rem;">
    <sl-icon slot="icon" name="info-circle"></sl-icon>
      <strong>${user}</strong> ${actionText}
    </sl-alert>`;
  messagesContainer.appendChild(eventElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(content) {
  const systemMsg = document.createElement("div");
  systemMsg.innerHTML = `
    <sl-alert open style="margin-bottom: 1rem;">
    <sl-icon slot="icon" name="info-circle"></sl-icon>
        ${content}
    </sl-alert>`;
  messagesContainer.appendChild(systemMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

usernameInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    connectToChat();
  }
});
