import ComplaintModel from "../models/Complaint.js";
import AuthorityModel from "../models/Authority.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthorityController {
  // Register Authority
  static registerAuthority = async (req, res) => {
    try {
      const { name, email, password, role, city } = req.body;
      if (!name || !email || !password || !role || !city) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const existing = await AuthorityModel.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: "Authority already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAuth = new AuthorityModel({ name, email, password: hashedPassword, role, city });
      await newAuth.save();

      return res.status(201).json({ success: true, message: "Authority registered successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // Authority Login
  static loginAuthority = async (req, res) => {
    try {
      const { email, password } = req.body;
      const authority = await AuthorityModel.findOne({ email });
      if (!authority) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, authority.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
      }

   const token = jwt.sign(
  { id: authority._id, role: authority.role, city: authority.city },
  "mysupersecretkey123", // hardcoded secret
  { expiresIn: "1d" }
);


      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        authority: { id: authority._id, name: authority.name, role: authority.role, city: authority.city },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get Complaints by City & Role
  static getDepartmentComplaints = async (req, res) => {
    try {
      const { role, city } = req.user; // from JWT

      let category;
      if (role === "Municipal") category = { $in: ["Garbage", "Water Leakage", "Other"] };
      else if (role === "PWD") category = "Road Damage";
      else if (role === "Electricity") category = "Street Light";
      else return res.status(400).json({ success: false, message: "Invalid authority role" });

      const complaints = await ComplaintModel.find({ city, category });
      return res.status(200).json({ success: true, complaints });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // Update Complaint Status & Remark
  static updateComplaintStatus = async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { status, feedback } = req.body;
      const { city } = req.user; // authority city

      if (!["pending", "in progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      // Authority can only update complaints from their own city
      const complaint = await ComplaintModel.findOne({ _id: complaintId, city });
      if (!complaint) {
        return res.status(404).json({ success: false, message: "Complaint not found in your city" });
      }

      complaint.status = status;
      complaint.feedback = feedback || complaint.feedback;
      await complaint.save();

      return res.status(200).json({
        success: true,
        message: "Complaint status updated successfully",
        complaint,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };




  static getLoggedAuthority = async (req, res) => {
    try {
      const { id } = req.user; // decoded from JWT middleware

      const authority = await AuthorityModel.findById(id).select("-password");
      if (!authority) {
        return res.status(404).json({ success: false, message: "Authority not found" });
      }

      return res.status(200).json({
        success: true,
        authority,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

export default AuthorityController;
