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
  // Register Complaint
  static registerComplaint = async (req, res) => {
    try {
      const { title, description, location, city, category, userId,urgency } = req.body;

      if (!req.files || !req.files['image']) {
        return res.status(400).json({
          success: false,
          message: 'Image is required',
        });
      }

      const imageFile = req.files['image'][0];
      console.log("Starting Cloudinary upload...");

      try {
        let result = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
        console.log("Cloudinary upload successful");

        if (title && description && location && city && category && userId && urgency) {
          const newComplaint = new ComplaintModel({
            title,
            description,
            image: result.secure_url,
            location,
            city,
            category,
            userId,
            status: 'pending',
            feedback: '', // default empty,,
            urgency
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
              city: savedComplaint.city,
              category: savedComplaint.category,
              status: savedComplaint.status,
              feedback: savedComplaint.feedback,
              urgency:savedComplaint.urgency,
              createdAt: savedComplaint.createdAt,
              updatedAt: savedComplaint.updatedAt
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'All fields are required'
          });
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: `Cloudinary error: ${cloudinaryError.message}`,
        });
      }
    } catch (error) {
      console.error("General error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get Complaints by City and Category
  static getComplaintsByCityAndCategory = async (req, res) => {
    try {
      const { city, category } = req.query;  


      if (!city || !category) {
        return res.status(400).json({ success: false, message: 'City and Category are required' });
      }

      const complaints = await ComplaintModel.find({ city, category })
        .select('title description status feedback image location createdAt updatedAt');

      return res.status(200).json({ success: true, complaints });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  };

  // Get Complaints by User ID (with feedback + status)
  static getUserComplaintStatus = async (req, res) => {
    try {
      const { userId } = req.params;

      const complaints = await ComplaintModel.find({ userId })
        .select('title status feedback updatedAt urgency category image');

      return res.status(200).json({ success: true, complaints });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  };




 

// Delete Complaint by ID
static deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID is required",
      });
    }

    const deletedComplaint = await ComplaintModel.findByIdAndDelete(id);

    if (!deletedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
      deletedComplaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



static getAllComplaints = async (req, res) => {
  try {
    const complaints = await ComplaintModel.find()
      .select('title description image location city category status feedback createdAt updatedAt');

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No complaints found",
      });
    }

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

}




export { upload };   // so you can use upload.fields([{ name: 'image', maxCount: 1 }]) in your routes
export default ComplaintController;
