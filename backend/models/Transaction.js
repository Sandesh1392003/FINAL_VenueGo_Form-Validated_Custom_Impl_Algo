import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true }, // Unique ID from backend
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING",
  },
  paymentGateway: { type: String, default: "eSewa" },
  esewaReference: String, // eSewa transaction reference ID (optional)

},{timestamps: true});

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
