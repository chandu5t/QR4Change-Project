import express from 'express';
import ComplaintController, { upload } from '../controllers/complaintController.js';


const router = express.Router();

// ✅ Register Complaint (requires image upload)
// POST /api/complaints/register
router.post(
  '/register',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  ComplaintController.registerComplaint
);

// ✅ Get All Complaints (summary view for admins or public dashboard)
// GET /api/complaints
router.get('/', ComplaintController.getAllComplaints);

// ✅ Get Complaint by ID (tracking)
// GET /api/complaints/:complaintId
router.get('/:complaintId', ComplaintController.getComplaintById);

// ✅ Get Complaints by User ID




export default router;
