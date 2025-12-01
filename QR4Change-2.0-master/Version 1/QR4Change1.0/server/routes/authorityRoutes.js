import express from "express";
import AuthorityController from "../controllers/authorityController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", AuthorityController.registerAuthority);
router.post("/login", AuthorityController.loginAuthority);
router.get("/complaints", authMiddleware, AuthorityController.getDepartmentComplaints);
router.put("/complaint/:complaintId", authMiddleware, AuthorityController.updateComplaintStatus);
router.get("/loggedAuthority", authMiddleware, AuthorityController.getLoggedAuthority);

export default router;
