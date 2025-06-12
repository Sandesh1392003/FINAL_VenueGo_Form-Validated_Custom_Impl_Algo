// models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ImageSchema, LocationSchema } from "./Common.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["VenueOwner", "Customer","Admin"],
      default: "Customer",
      required: true,
    },

    profileImg: ImageSchema, // Reusing ImageSchema
    legalDocImg: ImageSchema, // Reusing ImageSchema

    location: LocationSchema, // Reusing LocationSchema
    address: {type: String},
    phone: {type: String},
    description: {type: String},

    esewaId: { type: String }, // Changed from Number to String for safety

    bookedVenue: [{ type: mongoose.Schema.Types.ObjectId, ref: "Venue" }],

    verified: { type: Boolean, default: false, required: true },

    verificationToken: String,
    verificationTokenExpiresAt: Date,

    resetToken: String,
    resetTokenExpiresAt: Date,
    roleApprovalStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" }

  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // This prevents double hashing
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("Password not found in user document");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
