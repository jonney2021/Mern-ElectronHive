import express from "express";
import { getAnalyticsByDate } from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
// Route for analytics by date
router.get("/", protect, admin, getAnalyticsByDate);

export default router;
