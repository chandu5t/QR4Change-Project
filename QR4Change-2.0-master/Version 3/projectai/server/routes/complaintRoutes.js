import express from 'express';
import ComplaintController from '../controllers/complaintController.js';
import upload from '../middleware/upload-middleware.js';

const router = express.Router();

router.post(
  '/register-complaint',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  ComplaintController.registerComplaint
);

router.get('/filter', ComplaintController.getComplaintsByCityAndCategory);
router.get('/status/:userId', ComplaintController.getUserComplaintStatus);
router.delete('/complaint/:id', ComplaintController.deleteComplaint);
router.get('/all', ComplaintController.getAllComplaints);

export default router;
