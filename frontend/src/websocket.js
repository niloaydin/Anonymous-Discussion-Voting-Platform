import io from "socket.io-client";
import { WEBSOCKET_URL } from "./config/baseUrl";

const SOCKET_URL = WEBSOCKET_URL; 
const socket = io(SOCKET_URL);
console.log(`FRONTEND SOCKET initialized: ${socket.id ? socket.id : "Not connected yet"}`);

export default socket;
