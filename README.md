# 🪐 ASKMEE.AI – Intelligent AI Search Platform
 
A **production-level full stack** AI-powered Search & Chat Application built with the **MERN stack** (MongoDB, Express, React, Node.js) featuring real-time web search, vision AI, and streaming responses.
 
---
 
## 🚀 Tech Stack
 
| Layer | Technologies |
|-------|-------------|
| Frontend | React 19 + Vite, Redux Toolkit, React Router v7, Axios |
| Backend | Node.js, Express v5, MongoDB (Mongoose), JWT, bcryptjs |
| AI & Search | LangChain, Mistral AI, Pixtral-12B (Vision), Tavily Search API |
| Real-time | Socket.IO (streaming AI responses) |
| Email | Nodemailer + Gmail OAuth2 |
| UI | Tailwind CSS v4, CSS Variables, Dark/Light mode, Responsive |
 
---
 
## 📁 Project Structure
 
```
AskMe-Ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # register, login, logout, verify, username
│   │   │   └── chat.contoller.js     # sendMessage, getChats, getMessages, deleteChat
│   │   ├── middlewar/
│   │   │   └── auth.middleware.js    # JWT cookie verification
│   │   ├── models/
│   │   │   ├── user.model.js         # User schema (username, email, password, verified)
│   │   │   ├── chat.model.js         # Chat schema (user ref, title)
│   │   │   └── message.model.js      # Message schema (chat ref, role, content)
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth/* routes
│   │   │   └── chat.routes.js        # /api/chats/* routes
│   │   ├── service/
│   │   │   ├── ai.service.js         # LangChain agent (Mistral + Pixtral + Tavily)
│   │   │   ├── internet.service.js   # Tavily web search wrapper
│   │   │   └── mail.service.js       # Gmail OAuth2 email sender
│   │   ├── sockets/
│   │   │   └── server.socket.js      # Socket.IO real-time streaming events
│   │   └── app.js                    # Express app config, CORS, middleware, routes
│   ├── server.js                     # Entry point: HTTP + Socket.IO + DB connect
│   └── .env                          # Environment variables
└── frontend/
    └── src/
        └── app/
            ├── components/
            │   ├── Logo.jsx              # Reusable Orbit SVG logo (sm/md/lg)
            │   └── ThemeToggle.jsx       # Dark/Light mode toggle button
            ├── context/
            │   └── ThemeContext.jsx      # Global theme state + localStorage
            ├── features/
            │   ├── auth/
            │   │   ├── auth.slice.js         # Redux: user, loading, error
            │   │   ├── hook/useAuth.js        # register, login, logout, getMe handlers
            │   │   ├── pages/login.jsx        # Login + Register flip card UI
            │   │   ├── components/Protected.jsx # Auth guard component
            │   │   └── service/auth.api.js    # Axios auth API calls
            │   ├── chat/
            │   │   ├── chat.slice.js          # Redux: chats, currentChatId, loading
            │   │   ├── hooks/useChat.js        # Send message, open chat, web search
            │   │   ├── pages/Dashboard.jsx    # Main chat UI: sidebar + messages + input
            │   │   └── service/
            │   │       ├── chat.api.js        # Axios chat API calls
            │   │       └── chat.socket.js     # Socket.IO client events
            │   └── landing/
            │       ├── pages/Landing.jsx          # Landing page composer
            │       └── components/
            │           ├── Navbar.jsx             # Fixed glassmorphic navbar
            │           ├── HeroSection.jsx        # Typewriter animation hero
            │           └── AboutSection.jsx       # Features + CTA section
            ├── App.jsx                   # RouterProvider + auto-login
            ├── app.routes.jsx            # Routes: / landing, /login, /dashboard
            ├── app.store.js              # Redux store (auth + chat slices)
            └── index.css                 # Tailwind + CSS variable theme tokens
```
 
---
 
## ✨ Features
 
- 🤖 **AI Chat** — Real-time streaming responses powered by Mistral AI via LangChain agent
- 🌐 **Web Search Toggle** — Conditionally activates Tavily API for live internet results with citations
- 🖼️ **Vision AI** — Upload images and get AI analysis powered by Pixtral-12B (free Mistral model)
- ⚡ **Streaming Responses** — Socket.IO streams AI tokens word-by-word like ChatGPT
- 🔐 **JWT Authentication** — HTTP-only cookie sessions with 7-day expiry
- 📧 **Email Verification** — Gmail OAuth2 via Nodemailer with branded verification emails
- 👤 **Username Onboarding** — First-login modal to set username, persisted in MongoDB
- 🕐 **Chat History** — All conversations saved and synced in real-time via MongoDB
- 📝 **Auto Chat Titles** — Mistral generates 2-4 word titles from first message
- 🗑️ **Delete Chats** — Remove conversations from sidebar and database
- 🌙 **Dark/Light Mode** — CSS variable system with ThemeContext, persisted to localStorage
- 📐 **Resizable Sidebar** — Drag-to-resize with localStorage width persistence
- 🪐 **Orbit Logo** — Custom reusable SVG logo system (3 sizes: sm/md/lg)
- 🚀 **Landing Page** — Typewriter animation hero, about section, smooth scroll routing
- 📱 **Fully Responsive** — Mobile, tablet, desktop
 
---
