import { Router } from 'express';
import { sendMessage, getChats, getMessages, deleteChat } from "../controllers/chat.contoller.js";
import { authUser } from "../middlewar/auth.middleware.js";

const chatRouter = Router();


chatRouter.post("/message", authUser, sendMessage)

chatRouter.get("/", authUser, getChats)

chatRouter.get("/:chatId/messages", authUser, getMessages)

chatRouter.delete("/delete/:chatId", authUser, deleteChat)

export default chatRouter;