import express from "express";
import {  validateToken } from "../helpers/token.js";
import { getChatHistory, geyChatByUserId, saveChat, updateChat } from "../controllers/chatController.js";


const chatRoutes = express.Router();

// add the chat 
chatRoutes.post("/save", validateToken, saveChat);

// update the chat 
chatRoutes.put("/update/:id", validateToken, updateChat);

// get the chat history
chatRoutes.get("/history/:id", validateToken, getChatHistory);

// get the chat by user id
chatRoutes.get("/user-history", validateToken, geyChatByUserId);

export default chatRoutes;
