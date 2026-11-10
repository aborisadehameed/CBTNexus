import express from "express";
import { protect, authorizeAdmin } from "../middleware/authMiddleware.js";
import {
  createFeedback,
  getMyFeedbacks,
  getFeedbackById,
  replyFeedback,
  getAllFeedbacksAdmin,
  updateFeedbackStatusAdmin,
  deleteFeedbackAdmin,
  deleteFeedbackMessageAdmin,
} from "../controllers/feedbackController.js";

const router = express.Router();

// User & shared routes
router.post("/", protect, createFeedback);
router.get("/my-feedback", protect, getMyFeedbacks);
router.get("/:id", protect, getFeedbackById);
router.post("/:id/reply", protect, replyFeedback);

// Admin-only routes
router.get("/admin/all", protect, authorizeAdmin, getAllFeedbacksAdmin);
router.patch("/admin/:id/status", protect, authorizeAdmin, updateFeedbackStatusAdmin);
router.delete("/admin/:id", protect, authorizeAdmin, deleteFeedbackAdmin);
router.delete("/admin/:id/message/:messageId", protect, authorizeAdmin, deleteFeedbackMessageAdmin);

export default router;
