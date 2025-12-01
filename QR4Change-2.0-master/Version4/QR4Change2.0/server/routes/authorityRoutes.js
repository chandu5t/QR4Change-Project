import express from "express";
import AuthorityController from "../controllers/authorityController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ Authority Registration
// POST /api/authority/register
router.post("/register", AuthorityController.register);

// ✅ Authority Login
// POST /api/authority/login
router.post("/login", AuthorityController.login);

// ✅ Get Complaints for Authority (filtered by state/district/city & category)
// GET /api/authority/complaints
router.get("/complaints", authMiddleware, AuthorityController.getComplaints);

// ✅ Update Complaint Status and Feedback
// PUT /api/authority/complaint/:complaintId
router.put("/complaint/:complaintId", authMiddleware, AuthorityController.updateComplaint);

// ✅ Get Logged-in Authority Profile
// GET /api/authority/profile
router.get("/profile", authMiddleware, AuthorityController.getProfile);

export default router;
