import express from "express";
import User from "../models/User.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js";
import { getOnlineCount, getPeakOnlineCount } from "../server.js";

const router = express.Router();

// GET /api/admin/stats — returns total users, today's registrations
router.get("/stats", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    // Today's registrations: from midnight UTC of today
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const todayRegistrations = await User.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    res.json({ totalUsers, todayRegistrations, onlineCount: getOnlineCount(), peakOnlineCount: getPeakOnlineCount() });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/activate-user — activate lifetime access for a user by email
router.post("/activate-user", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      {
        $set: {
          isPaid: true,
          paidAt: new Date(),
          paymentReference: "MANUAL_ACTIVATION_ADMIN",
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found` });
    }

    console.log(`[Admin] Activated lifetime access for: ${user.email}`);
    res.json({
      success: true,
      message: `User ${user.email} successfully activated!`,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isPaid: user.isPaid,
        paidAt: user.paidAt,
      },
    });
  } catch (err) {
    console.error("Admin activate-user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
