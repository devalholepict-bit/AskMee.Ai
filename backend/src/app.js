import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import cors from "cors";
import path from "path";

const app = express();

const __dirname = path.resolve();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const corsOptions = {
    origin: 'https://askmee-ai.onrender.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

// Health check
// app.get("/", (req, res) => {
//     res.json({ message: "Server is running" });
// });

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.use((req, res) => {
  res.sendFile(
    path.resolve(__dirname, "frontend", "dist", "index.html")
  );
});



export default app;