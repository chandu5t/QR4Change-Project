import ComplaintModel from "../models/Complaint.js";
import AuthorityModel from "../models/Authority.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
class AuthorityController {
  // ✅ Register Authority
  static register = async (req, res) => {
    try {
      const { name, email, password, role, state, district, city } = req.body;

      if (!name || !email || !password || !role || !state || !district || !city) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const existing = await AuthorityModel.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: "Authority already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAuthority = new AuthorityModel({
        name,
        email,
        password: hashedPassword,
        role,
        state,
        district,
        city,
      });

      await newAuthority.save();

      return res.status(201).json({ success: true, message: "Authority registered successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // ✅ Login Authority
  static login = async (req, res) => {
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
        {
          id: authority._id,
          role: authority.role,
          state: authority.state,
          district: authority.district,
          city: authority.city,
        },
        "mysupersecretkey123", // ⚠️ move to process.env.JWT_SECRET in production
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        authority: {
          id: authority._id,
          name: authority.name,
          role: authority.role,
          state: authority.state,
          district: authority.district,
          city: authority.city,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  // ✅ Get Complaints by Authority Scope
  static getComplaints = async (req, res) => {
    try {
      const { role, state, district, city } = req.user; // from JWT

      let category;
      if (role === "Municipal") category = { $in: ["Garbage", "Water Leakage", "Other"] };
      else if (role === "PWD") category = "Road Damage";
      else if (role === "Electricity") category = "Street Light";
      else return res.status(400).json({ success: false, message: "Invalid authority role" });

      const complaints = await ComplaintModel.find({ state, district, city, category });

      return res.status(200).json({ success: true, complaints });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };



static updateComplaint = async (req, res) => {
  try {
    const rawId = req.params.id || req.params.complaintId;
    if (!rawId) {
      return res.status(400).json({ success: false, message: "No complaint id provided in params" });
    }
    const id = rawId.toString().trim();
    console.log("updateComplaint called with id:", id);

    // validate ObjectId early
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID format" });
    }

    const complaint = await ComplaintModel.findById(id);
    if (!complaint) {
      console.log("findById returned null for id:", id);
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { role, state, district, city } = req.user;
    if (
      complaint.state !== state ||
      complaint.district !== district ||
      complaint.city !== city ||
      (role === "Municipal" && !["Garbage", "Water Leakage", "Other"].includes(complaint.category)) ||
      (role === "PWD" && complaint.category !== "Road Damage") ||
      (role === "Electricity" && complaint.category !== "Street Light")
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this complaint" });
    }

    complaint.status = req.body.status || complaint.status;
    complaint.feedback = req.body.feedback !== undefined ? req.body.feedback : complaint.feedback;
    const saved = await complaint.save();

    return res.status(200).json({ success: true, complaint: saved });
  } catch (error) {
    console.error("updateComplaint error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


  // ✅ Get Logged-in Authority Details
  static getProfile = async (req, res) => {
    try {
      const { id } = req.user;

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
