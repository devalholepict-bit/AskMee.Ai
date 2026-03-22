import { initializeSocketConnection, getSocket, emitSendMessage } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import {
    setChats, setCurrentChatId, setError, setLoading,
    createNewChat, addNewMessage, addMessages, removeChat,
    startStreaming, appendStreamChunk, finishStreaming,
} from "../chat.slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";


export const useChat = () => {

    const dispatch = useDispatch()
    const chats = useSelector(state => state.chat.chats)
    const listenersAttached = useRef(false)


    /**
     * Initialize socket and attach event listeners (runs once)
     */
    function setupSocket() {
        const socket = initializeSocketConnection()

        // Prevent duplicate listeners
        if (listenersAttached.current || !socket) return
        listenersAttached.current = true

        // New chat was created on the backend
        socket.on("chat_created", ({ chatId, title }) => {
            dispatch(createNewChat({ chatId, title }))
            dispatch(setCurrentChatId(chatId))
        })

        // Streaming token arrived
        socket.on("message_chunk", ({ chatId, token }) => {
            dispatch(appendStreamChunk({ chatId, token }))
        })

        // Streaming complete — save finalized message
        socket.on("message_done", ({ chatId, content, role }) => {
            dispatch(finishStreaming())
            dispatch(addNewMessage({ chatId, content, role }))
        })

        // Error during streaming
        socket.on("message_error", ({ chatId, error }) => {
            dispatch(finishStreaming())
            dispatch(setError(error || "Something went wrong"))
        })
    }


    /**
     * Send a message via Socket.IO (supports streaming)
     */
    function handleSendMessage(payload) {
        const { message, chatId, isWebSearch = false, image = null } = payload
        dispatch(setError(null))

        // Immediately show the user message in UI
        if (chatId) {
            dispatch(addNewMessage({ chatId, content: message, role: "user" }))
        }

        // Start streaming state
        dispatch(startStreaming({ chatId: chatId || "__pending__" }))

        // Emit via socket
        const sent = emitSendMessage({ chatId, message, isWebSearch, image })
        if (!sent) {
            dispatch(finishStreaming())
            dispatch(setError("Not connected to server. Please refresh the page."))
        }

        // Pass to API:
        sendMessage({ message, chatId, isWebSearch, image }).catch(err => console.error(err))
    }


    async function handleGetChats() {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[ chat._id ] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to load chats"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleOpenChat(chatId) {
        try {
            if (chats[ chatId ]?.messages.length === 0) {
                const data = await getMessages(chatId)
                const { messages } = data

                const formattedMessages = messages.map(msg => ({
                    content: msg.content,
                    role: msg.role,
                }))

                dispatch(addMessages({
                    chatId,
                    messages: formattedMessages,
                }))
            }
            dispatch(setCurrentChatId(chatId))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to load messages"))
        }
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            dispatch(removeChat(chatId))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to delete chat"))
        }
    }

    function handleNewChat() {
        dispatch(setCurrentChatId(null))
        dispatch(setError(null))
    }

    return {
        setupSocket,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleNewChat,
    }

}