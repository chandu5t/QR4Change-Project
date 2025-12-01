import mongoose from "mongoose";

const authoritySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["Municipal", "PWD", "Electricity"],
      required: true,
    },
    state: { type: String, required: true, trim: true },   // 🔹 Added state
    district: { type: String, required: true, trim: true }, // 🔹 Added district
    city: { type: String, required: true, trim: true },     // 🔹 Kept city
  },
  { timestamps: true }
);

const AuthorityModel = mongoose.model("authority", authoritySchema);
export default AuthorityModel;
