import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        isStreaming: false,
        streamingMessage: null, // { chatId, content }
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[ chatId ] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload
            if (state.chats[ chatId ]) {
                state.chats[ chatId ].messages.push({ content, role })
            }
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            if (state.chats[ chatId ]) {
                state.chats[ chatId ].messages.push(...messages)
            }
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        removeChat: (state, action) => {
            const chatId = action.payload
            delete state.chats[chatId]
            if (state.currentChatId === chatId) {
                state.currentChatId = null
            }
        },
        resetChat: (state) => {
            state.chats = {}
            state.currentChatId = null
            state.isLoading = false
            state.isStreaming = false
            state.streamingMessage = null
            state.error = null
        },

        // ── Streaming reducers ──
        startStreaming: (state, action) => {
            const { chatId } = action.payload
            state.isStreaming = true
            state.isLoading = true
            state.streamingMessage = { chatId, content: "" }
        },
        appendStreamChunk: (state, action) => {
            const { token } = action.payload
            if (state.streamingMessage) {
                state.streamingMessage.content += token
            }
        },
        finishStreaming: (state) => {
            state.isStreaming = false
            state.isLoading = false
            state.streamingMessage = null
        },
    }
})

export const {
    setChats, setCurrentChatId, setLoading, setError,
    createNewChat, addNewMessage, addMessages,
    removeChat, resetChat,
    startStreaming, appendStreamChunk, finishStreaming,
} = chatSlice.actions
export default chatSlice.reducer