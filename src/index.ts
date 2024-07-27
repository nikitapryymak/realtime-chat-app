import { randomUUID } from "crypto";
import WebSocket from "ws";
import Redis from "ioredis";

const WS_PORT = 8080;
const REDIS_URL = "redis://localhost:6379";
const CHAT_CHANNEL = "chat_messages";

interface ChatMessage {
  id: string;
  user: string;
  content: string;
  timestamp: number;
}

// Create WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });

// Create Redis Pub/Sub clients
// const publisher = new Redis(REDIS_URL);

// Always ensure there's a listener for errors in the client to prevent process crashes due to unhandled errors
// publisher.on("error", (error) => {
//   console.error(`Redis client error:`, error);
// });

// const subscriber = publisher.duplicate();

// Subscribe to chat channel
// subscriber.subscribe(CHAT_CHANNEL);

// Listen for messages from Redis and broadcast to all clients
// subscriber.on("message", (channel: string, message: string) => {
//   if (channel !== CHAT_CHANNEL) return;

//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(message);
//     }
//   });
// });

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  ws.on("message", (message: string) => {
    try {
      const { user, content } = JSON.parse(message);
      const chatMessage: ChatMessage = {
        id: randomUUID(),
        user,
        content,
        timestamp: Date.now(),
      };

      console.log("Publishing message:", chatMessage);
      // Publish message to Redis
      //   publisher.publish(CHAT_CHANNEL, JSON.stringify(chatMessage));
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(chatMessage));
        }
      });
    } catch (error: any) {
      console.error("Failed to parse message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on port ${WS_PORT}`);
