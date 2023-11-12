import asyncHandler from "../middleware/asyncHandler.js";
import Chat from "../models/chatModel.js";

// @desc    Add a new chat message
// @route   POST /api/chat
// @access  Private
const addChatMessage = asyncHandler(async (req, res) => {
  const { userId, userName, message, sender } = req.body;

  let chat = await Chat.findOne({ userId });

  if (!chat) {
    // Create a new chat if it doesn't exist
    chat = new Chat({
      userId,
      userName,
      messages: [{ sender, message }],
    });
  } else {
    // Add new message to existing chat
    chat.messages.push({ sender, message });
  }

  await chat.save();
  res.status(201).json(chat);
});

// @desc    Get chat history for a user
// @route   GET /api/chat/history/:targetUserId
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;

  const chat = await Chat.findOne({ userId: targetUserId });

  if (chat) {
    res.json(chat);
  } else {
    res.status(404).json({ message: "Chat not found" });
  }
});

// @desc    Get all chat sessions (assuming all are admin chats)
// @route   GET /api/chat/admin-sessions
// @access  Private (Admin only)
const getAdminSessions = asyncHandler(async (req, res) => {
  // Fetch all chat documents
  const allChats = await Chat.find({});

  // Transform the data to get a list of chat sessions with user info
  const chatSessions = allChats.map((chat) => ({
    chatId: chat._id,
    userId: chat.userId,
    userName: chat.userName,
    // You can add more details as required, like last message, etc.
  }));

  res.json(chatSessions);
});

export { addChatMessage, getChatHistory, getAdminSessions };
