// lib/websocket.js
let globalWebSocket = null;  // This variable survives page changes!

const WS_URL = process.env.NODE_ENV === "production" 
  ? "wss://api.yourdomain.com/api/convert/batch"  // Different subdomain
  : "ws://localhost:8000/api/socket";


export function connectWebSocket() {
  if (!globalWebSocket) {
    console.log("Creating WebSocket connection...");
    globalWebSocket = new WebSocket(WS_URL);
    
    globalWebSocket.onopen = () => {
      console.log("✅ Connected to server");
    };
    
    globalWebSocket.onmessage = (event) => {
      console.log("Message from server:", event.data);
    };
  }
  return globalWebSocket;
}

export function getWebSocket() {
  return globalWebSocket;
}