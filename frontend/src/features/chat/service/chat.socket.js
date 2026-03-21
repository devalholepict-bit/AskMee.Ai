import { io } from "socket.io-client";

let socket = null;

export const initializeSocketConnection = () => {
    if (socket?.connected) return socket;

    socket = io("http://localhost:3000", {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server:", socket.id)
    })

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message)
    })

    return socket
}

export const getSocket = () => {
    return socket
}

export const emitSendMessage = ({ chatId, message }) => {
    if (!socket?.connected) {
        console.error("Socket not connected")
        return false
    }
    socket.emit("send_message", { chatId, message })
    return true
}