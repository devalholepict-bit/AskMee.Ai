// TODO: Rename 'chat.contoller.js' to 'chat.controller.js' and update all imports
import { generateResponse, generateChatTitle } from "../service/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
    try {
        const { 
            message, 
            chat: chatFromBody, 
            chatId: chatIdFromBody, 
            isWebSearch = false,
            image = null
        } = req.body;
        const providedChatId = chatIdFromBody || chatFromBody;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            })
        }

        let title = null, chat = null;
        let activeChatId = null;

        if (providedChatId) {
            chat = await chatModel.findOne({
                _id: providedChatId,
                user: req.user.id
            })

            if (!chat) {
                return res.status(404).json({
                    message: "Chat not found"
                })
            }

            activeChatId = chat._id;
        } else {
            title = await generateChatTitle(message);
            chat = await chatModel.create({
                user: req.user.id,
                title
            })

            activeChatId = chat._id;
        }

        const userMessage = await messageModel.create({
            chat: activeChatId,
            content: message,
            role: "user"
        })

        const messages = await messageModel.find({ chat: activeChatId }).sort({ createdAt: 1 })

        let result;
        try {
            result = await generateResponse(messages, isWebSearch, image);
        } catch (aiErr) {
            console.error("AI service error:", aiErr);

            const isTimeout = aiErr.code === 'ETIMEDOUT' || aiErr.code === 'ECONNABORTED' || aiErr.message?.includes('timeout');
            const isAuthError = aiErr.status === 401 || aiErr.status === 403 || aiErr.message?.includes('API key');

            if (isTimeout) {
                return res.status(504).json({ message: "AI service timed out. Please try again." });
            }
            if (isAuthError) {
                return res.status(502).json({ message: "AI service authentication failed. Please contact support." });
            }
            return res.status(502).json({ message: "AI service is currently unavailable. Please try again later." });
        }

        const aiMessage = await messageModel.create({
            chat: activeChatId,
            content: result,
            role: "ai"
        })

        res.status(201).json({
            title,
            chat,
            userMessage,
            aiMessage
        })

    } catch (err) {
        console.error("sendMessage error:", err);
        res.status(500).json({ message: "Failed to send message", error: err.message })
    }
}

export async function getChats(req, res) {
    try {
        const user = req.user

        const chats = await chatModel.find({ user: user.id })

        res.status(200).json({
            message: "Chats retrieved successfully",
            chats
        })
    } catch (err) {
        console.error("getChats error:", err);
        res.status(500).json({ message: "Failed to retrieve chats", error: err.message })
    }
}

export async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id
        })

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            })
        }

        const messages = await messageModel.find({
            chat: chatId
        })

        res.status(200).json({
            message: "Messages retrieved successfully",
            messages
        })
    } catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ message: "Failed to retrieve messages", error: err.message })
    }
}

export async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOneAndDelete({
            _id: chatId,
            user: req.user.id
        })

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            })
        }

        await messageModel.deleteMany({
            chat: chatId
        })

        res.status(200).json({
            message: "Chat deleted successfully"
        })
    } catch (err) {
        console.error("deleteChat error:", err);
        res.status(500).json({ message: "Failed to delete chat", error: err.message })
    }
}