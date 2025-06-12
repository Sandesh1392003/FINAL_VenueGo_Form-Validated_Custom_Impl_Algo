import jwt from "jsonwebtoken";
import crypto from "crypto";
import {v2 as cloudinary}  from "cloudinary"

export const setUserCookie = async (token, context) => {
  const { res } = context;
  if (!res) {
    throw new Error("Response object not found in context");
  }

  try {
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Adjust sameSite for production
    });
  } catch (err) {
    throw new Error("Failed to set authentication cookie");
  }
};

export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};

export const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const calculateDurationHour = (start, end) => {
  // Convert time strings to hours and minutes
  let [startHour, startMinute] = start.split(":").map(Number);
  let [endHour, endMinute] = end.split(":").map(Number);

  // Convert everything to minutes
  let startTotalMinutes = startHour * 60 + startMinute;
  let endTotalMinutes = endHour * 60 + endMinute;

  // Calculate total hours (assuming same day)
  let totalHours = (endTotalMinutes - startTotalMinutes) / 60;

  // Calculate total price
  return totalHours;
};


export const generateSignature = (data) => {
  const sortedKeys = data.signed_field_names.split(",");
  const signData = sortedKeys.map((key) => `${key}=${data[key]}`).join(",");

  return crypto.createHmac("sha256", process.env.SECRET_KEY).update(signData).digest("base64");
};


export const uploadSignature = async (tags, upload_preset, uploadFolder) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign = {
    timestamp: timestamp,
    folder: uploadFolder,
    upload_preset: upload_preset,
    tags: tags || undefined,
    // moderation: "aws_rek" (disabled because it is paid only) // or "google_video_intelligence" or "cloudinary_ai" depending on your choice
  };

  //Generate the signature
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cloudinary.config().api_secret
  );

  return { timestamp: timestamp, signature: signature };
};

export const deleteSignature = async (publicId) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign = {
    timestamp: timestamp,
    public_id: publicId,
  };

  //Generate the signature
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cloudinary.config().api_secret
  );

  return { timestamp: timestamp, signature: signature };
};

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      console.log('Image deleted successfully');
    } else {
      console.error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};
