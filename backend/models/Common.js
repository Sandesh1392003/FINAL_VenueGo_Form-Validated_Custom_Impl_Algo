import mongoose from "mongoose";

// Image Schema for reusability
export const ImageSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  secure_url: { type: String, required: true },
  asset_id: String,
  version: Number,
  format: String,
  width: Number,
  height: Number,
  created_at: Date,
});

// Location Schema
export const LocationSchema = new mongoose.Schema({
  street: String,
  province: {
    type: String,
    enum: ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpaschim"],
  },
  zipCode: Number,
  city: String,
});


export const TimeSchema = new mongoose.Schema({
  start: String, // e.g., "09:00"
  end: String,   // e.g., "12:00"
});

export const AvailabilitySchema = new mongoose.Schema({
  date: String, // "YYYY-MM-DD"
  slots: [TimeSchema], // Reserved slots on this date
});

export const ServiceSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  servicePrice: { type: Number, default: 0 ,required: true},
});