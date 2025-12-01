import mongoose from "mongoose";

const authoritySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ["Municipal", "PWD", "Electricity"],
    required: true,
  },
  city: { type: String, required: true, trim: true } // 🔹 Added city for authority scope
}, { timestamps: true });

const AuthorityModel = mongoose.model("authority", authoritySchema);
export default AuthorityModel;
