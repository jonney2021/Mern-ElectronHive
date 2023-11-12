import express from "express";
import {
  addChatMessage,
  getChatHistory,
  getAdminSessions,
} from "../controllers/chatController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to add a new chat message
router.route("/").post(protect, addChatMessage);

// Route to get chat history for a specific user
// Accessible by admins
router.route("/history/:targetUserId").post(protect, admin, getChatHistory);

router.route("/admin-sessions").get(protect, admin, getAdminSessions);

export default router;
