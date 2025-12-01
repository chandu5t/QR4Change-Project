import ComplaintModel from '../models/Complaint.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

class ComplaintController {

  static registerComplaint = async (req, res) => {
    try {
      const { title, description, location, state, district, city, category,  urgency } = req.body;

      if (!req.files || !req.files['image']) {
        return res.status(400).json({ success: false, message: 'Image is required' });
      }

      if (!title || !description || !location || !state || !district || !city || !category ) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      const imageFile = req.files['image'][0];
      console.log("Starting Cloudinary upload...");

      try {
        let result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
        console.log("Cloudinary upload successful");

        const newComplaint = new ComplaintModel({
          title,
          description,
          image: result.secure_url,
          location,
          state,
          district,
          city,
          category,
          status: 'pending',
          feedback: '',
          urgency,
        });

        const savedComplaint = await newComplaint.save();

        return res.status(201).json({
          success: true,
          message: 'Complaint Registered Successfully',
          complaint: {
            id: savedComplaint._id,
            title: savedComplaint.title,
            description: savedComplaint.description,
            image: savedComplaint.image,
            location: savedComplaint.location,
            state: savedComplaint.state,
            district: savedComplaint.district,
            city: savedComplaint.city,
            category: savedComplaint.category,
            status: savedComplaint.status,
            feedback: savedComplaint.feedback,
            createdAt: savedComplaint.createdAt,
            updatedAt: savedComplaint.updatedAt,
          }
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary error:", cloudinaryError);
        return res.status(500).json({ success: false, message: `Cloudinary error: ${cloudinaryError.message}` });
      }
    } catch (error) {
      console.error("General error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };


  static getAllComplaints = async (req, res) => {
    try {
      const complaints = await ComplaintModel.find()
        .select('title description image location state district city category status feedback createdAt updatedAt')
        .sort({ createdAt: -1 });

      if (!complaints || complaints.length === 0) {
        return res.status(404).json({ success: false, message: "No complaints found" });
      }

      return res.status(200).json({ success: true, count: complaints.length, complaints });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  };

  static getComplaintById = async (req, res) => {
    try {
      const { complaintId } = req.params;

      const complaint = await ComplaintModel.findById(complaintId)
        .select('title description image location state district city category status feedback createdAt updatedAt');

      if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      return res.status(200).json({ success: true, complaint });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  };

}

export { upload };  
export default ComplaintController;
