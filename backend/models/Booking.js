import mongoose from "mongoose";
import { TimeSchema } from "./Common.js";


const bookingSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeslots: [TimeSchema], // Timeslots for booking
    bookingStatus: {  // Renamed to align with GraphQL
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED","COMPLETED","RESCHEDULED","NO_SHOW"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",  // Default added
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    selectedServices:[{
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
      servicePrice: { type: Number, required: true },
    }]
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
