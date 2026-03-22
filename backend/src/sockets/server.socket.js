import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { generateResponseStream, generateChatTitle } from "../service/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")

    // ── JWT auth middleware for Socket.IO ──
    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const token = cookies.token;

            if (!token) {
                return next(new Error("Authentication error: No token"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id} (userId: ${socket.user.id})`);

        // ── Handle send_message ──
        socket.on("send_message", async ({ chatId, message, isWebSearch = false, image = null }) => {
            try {
                // Validate
                if (!message || typeof message !== "string" || !message.trim()) {
                    return socket.emit("message_error", { chatId, error: "Message is required" });
                }

                let chat = null;
                let activeChatId = chatId;

                // Get or create chat
                if (chatId) {
                    chat = await chatModel.findOne({ _id: chatId, user: socket.user.id });
                    if (!chat) {
                        return socket.emit("message_error", { chatId, error: "Chat not found" });
                    }
                } else {
                    const title = await generateChatTitle(message);
                    chat = await chatModel.create({ user: socket.user.id, title });
                    activeChatId = chat._id.toString();

                    // Tell client about the new chat
                    socket.emit("chat_created", {
                        chatId: activeChatId,
                        title: chat.title,
                    });
                }

                // Save user message
                await messageModel.create({
                    chat: activeChatId,
                    content: message,
                    role: "user"
                });

                // Fetch full history for context
                const messages = await messageModel.find({ chat: activeChatId }).sort({ createdAt: 1 });

                // Stream the AI response token by token
                const fullText = await generateResponseStream(messages, (token) => {
                    socket.emit("message_chunk", { chatId: activeChatId, token });
                }, isWebSearch, image);

                // Save the complete AI message
                const aiMessage = await messageModel.create({
                    chat: activeChatId,
                    content: fullText,
                    role: "ai"
                });

                // Signal completion
                socket.emit("message_done", {
                    chatId: activeChatId,
                    content: aiMessage.content,
                    role: aiMessage.role,
                });

            } catch (err) {
                console.error("Socket send_message error:", err);

                const isTimeout = err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' || err.message?.includes('timeout');
                const isAuthError = err.status === 401 || err.status === 403 || err.message?.includes('API key');

                let errorMsg = "AI service failed. Please try again.";
                if (isTimeout) errorMsg = "AI service timed out. Please try again.";
                if (isAuthError) errorMsg = "AI service authentication failed. Please contact support.";

                socket.emit("message_error", { chatId, error: errorMsg });
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}