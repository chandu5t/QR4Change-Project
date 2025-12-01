import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String, 
    required: true
  },
  location: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Garbage', 'Road Damage', 'Street Light', 'Water Leakage', 'Other']
 // You can customize
 
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'in progress', 'resolved', 'rejected']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  feedback: {
    type: String,
    default: ''
  },
  urgency: {
    type: String,
    enum: ['High', 'Low'],
  }
}, {
  timestamps: true
});

const ComplaintModel = mongoose.model("complaint",ComplaintSchema);
export default ComplaintModel;
