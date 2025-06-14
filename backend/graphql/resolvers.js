// graphql/resolvers.js
import Booking from "../models/Booking.js";
import Venue from "../models/Venue.js";
import User from "../models/user.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailtype.js";
import {
  calculateDurationHour,
  deleteImageFromCloudinary,
  deleteSignature,
  generateResetToken,
  generateSignature,
  setUserCookie,
  uploadSignature,
} from "../utils/functions.js";
import { generateToken } from "../utils/functions.js";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import {
  validateEsewaId,
  validateImage,
  validateLocation,
} from "../utils/Validation.js";
import { v4 as uuidv4 } from "uuid";
import Transaction from "../models/Transaction.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      // Directly use `user`
      if (!user) {
        throw new Error("Not Authenticated");
      }

      const foundUser = await User.findById(user.id);
      return foundUser;
    },
    // Fetch all events
    venues: async () => {
      return await Venue.find()
        .populate("owner")
        .populate("reviews")
        .populate("services.serviceId");
    },

    // Fetch a single event by ID
    venue: async (_, { id }) => {
      return await Venue.findById(id)
        .populate("owner")
        .populate("reviews")
        .populate("services.serviceId");
    },

    // Fetch all bookings
    bookings: async () => {
      return await Booking.find().populate("venue").populate("user");
    },

    // Fetch a single booking by ID
    booking: async (_, { id }) => {
      return await Booking.findById(id).populate("venue").populate("user");
    },

    // Fetch all users
    users: async () => {
      return await User.find();
    },

    // Fetch a single user by ID
    user: async (_, { id }) => {
      return await User.findById(id).populate("bookedVenue");
    },
    reviewsByVenue: async (_, { venueId }) => {
      return await Review.find({ venue: venueId }).populate("user");
    },
    reviewsByUser: async (_, { userId }) => {
      return await Review.find({ user: userId }).populate("venue");
    },
    transactions: async () => {
      return await Transaction.find();
    },
    transaction: async (_, { id }) => {
      return await Transaction.findById(id)
        .populate("user")
        .populate("booking");
    },
    myVenues: async (_, __, { user }) => {
      console.log(user)
      // if (!user) {
      //   throw new Error("Not Authenticated");
      // }
      return Venue.find({ owner: user.id });
    },
    services: async () => {
      return await Service.find();
    },

    recentBookings: async (_, { limit }) => {
      return await Booking.find()
        .sort({ createdAt: -1 })
        .limit(limit || 5);
    },

    topVenues: async (_, { limit }) => {
      const venues = await Booking.aggregate([
        {
          $group: {
            _id: "$venue", // Group by venue ID
            totalBookings: { $sum: 1 }, // Count total bookings
            totalRevenue: { $sum: "$totalPrice" }, // Sum total revenue
          },
        },
        {
          $lookup: {
            from: "reviews", // Join with reviews collection
            localField: "_id",
            foreignField: "venue",
            as: "reviews",
          },
        },
        {
          $addFields: {
            avgRating: { $avg: "$reviews.rating" }, // Calculate average rating
          },
        },
        {
          $lookup: {
            from: "venues", // Join with venues collection
            localField: "_id",
            foreignField: "_id",
            as: "venueDetails",
          },
        },
        { $unwind: "$venueDetails" },
        {
          $project: {
            _id: 1,
            name: "$venueDetails.name",
            location: "$venueDetails.location",
            categories: "$venueDetails.categories", // ✅ Include categories
            totalBookings: 1,
            totalRevenue: 1,
            avgRating: { $round: ["$avgRating", 2] }, // Round rating to 2 decimals
          },
        },
        { $sort: { totalBookings: -1, avgRating: -1, totalRevenue: -1 } }, // Sort by highest bookings, rating & revenue
        { $limit: limit || 5 },
      ]);

      return venues.map((venue) => ({
        id: venue._id,
        name: venue.name,
        location: venue.location,
        categories: venue.categories || [], // ✅ Default to empty array if undefined
        totalBookings: venue.totalBookings,
        totalRevenue: venue.totalRevenue || 0, // Default to 0 if no revenue
        avgRating: venue.avgRating || 0, // Default to 0 if no ratings
      }));
    },


    pendingVenueOwners: async () => {
      return await User.find({
        role: "VenueOwner",
        roleApprovalStatus: "PENDING",
      });
    },
    pendingVenues: async () => {
      return await Venue.find({ approvalStatus: "PENDING" }).populate("owner")
    }
  },

  Mutation: {
    // Create a new venue
    addVenue: async (_, args, { user }) => {
      const {
        name,
        description,
        location,
        capacity,
        image,
        basePricePerHour,
        services = [], // Default to an empty array to prevent errors
        categories,
      } = args.input;

      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }

      try {
        const serviceReferences = [];

        if (services.length > 0) {
          for (const service of services) {
            const existingService = await Service.findById(service.serviceId);
            if (!existingService) {
              throw new Error(`Service not found: ${service.serviceId}`);
            }

            if (!["hourly", "fixed"].includes(service.category)) {
              throw new Error(`Invalid category for service ${service.serviceId}`);
            }

            serviceReferences.push({
              serviceId: existingService._id,
              servicePrice: service.servicePrice ?? 0,
              category: service.category,
            });
          }
        }

        // Ensure categories is an array
        const categoriesArray = Array.isArray(categories)
          ? categories
          : [categories];

        const newVenue = new Venue({
          name,
          description,
          location, // Ensure location has required fields
          capacity,
          image,
          basePricePerHour,
          services: serviceReferences, // Only storing selected services with custom prices
          categories: categoriesArray,
          owner: user.id,
          approvalStatus: "PENDING",
        });

        await newVenue.save();
        return newVenue;
      } catch (err) {
        throw new Error(`Error adding venue: ${err.message}`);
      }
    },

    updateVenue: async (_, { id, input }, { user }) => {
      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }

      const venue = await Venue.findById(id);
      if (!venue) {
        throw new Error("Venue not found");
      }

      if (venue.owner.toString() !== user.id) {
        throw new Error("Not authorized to update this venue");
      }

      try {
        // Handle Venue Image Update
        if (
          input.image?.public_id &&
          venue.image?.public_id !== input.image.public_id
        ) {
          try {
            await deleteImageFromCloudinary(venue.image.public_id);
          } catch (error) {
            console.error(
              "Error deleting old venue image from Cloudinary:",
              error
            );
          }
        }

        // Handle Service Updates (Venue-specific custom pricing)
        let updatedServiceReferences = venue.services; // Keep existing services if no update is provided

        if (input.services) {
          updatedServiceReferences = [];

          for (const service of input.services) {
            if (!service.serviceId || service.servicePrice == null) {
              throw new Error(
                "Each service must have a serviceId and servicePrice."
              );
            }

            const existingService = await Service.findById(service.serviceId);
            if (!existingService) {
              throw new Error(`Service not found: ${service.serviceId}`);
            }

            // Store the service reference with the custom price in the Venue model
            updatedServiceReferences.push({
              serviceId: existingService._id,
              servicePrice: service.servicePrice,
            });
          }
        }

        // Ensure categories is always stored as an array
        const updatedcategories = input.categories
          ? Array.isArray(input.categories)
            ? input.categories
            : [input.categories]
          : venue.categories; // Keep existing if not provided

        // Update venue fields selectively
        if (input.name) venue.name = input.name;
        if (input.description) venue.description = input.description;
        if (input.location) venue.location = input.location;
        if (input.capacity) venue.capacity = input.capacity;
        if (input.image) venue.image = input.image;
        if (input.basePricePerHour)
          venue.basePricePerHour = input.basePricePerHour;
        if (updatedServiceReferences) venue.services = updatedServiceReferences;
        if (updatedcategories) venue.categories = updatedcategories;

        await venue.save();

        return { success: true, message: "Updated successfully" };
      } catch (error) {
        throw new Error(`Error updating venue: ${error.message}`);
      }
    },

    bookVenue: async (_, args, { user }) => {
      if (!user) {
        throw new Error("Not Authenticated");
      }

      const { venue, date, start, end, selectedServices } = args.input;
      // console.log("Received selectedServices:", selectedServices);

      try {
        const venueData = await Venue.findById(venue).populate(
          "services.serviceId"
        );
        if (!venueData) {
          throw new Error("Venue not found");
        }

        // Calculate total hours
        const durationHours = calculateDurationHour(start, end);
        if (durationHours <= 0) {
          throw new Error("Invalid time range selected.");
        }

        // Validate selected services & calculate total service cost
        let serviceCost = 0;
        const validServices = await Promise.all(
          selectedServices.map(async (serviceId) => {
            // Check if serviceId is valid
            if (!mongoose.Types.ObjectId.isValid(serviceId)) {
              throw new Error(`Invalid service ID: ${serviceId}`);
            }

            // Find the service in the venue's offerings
            const venueService = venueData.services.find(
              (s) => s.serviceId._id.toString() === serviceId
            );

            if (!venueService) {
              throw new Error(`Service not found in venue: ${serviceId}`);
            }

            // Use only the venue-defined custom price
            const servicePrice = venueService.servicePrice;
            if (servicePrice == null) {
              throw new Error(`Custom price not set for service: ${serviceId}`);
            }

            serviceCost += servicePrice; // No per-hour calculation

            return {
              serviceId: new mongoose.Types.ObjectId(serviceId),
              servicePrice,
            };
          })
        );

        // Calculate total price (venue base price + selected services)
        const basePrice = venueData.basePricePerHour ?? 0;
        const totalAmount = basePrice * durationHours + serviceCost;

        if (isNaN(totalAmount)) {
          throw new Error(
            "Total price calculation failed: Invalid price values."
          );
        }

        // Check for conflicting "PAID" bookings
        const existingBooking = await Booking.findOne({
          venue,
          date,
          paymentStatus: "PAID",
          timeslots: {
            $elemMatch: {
              $or: [{ start: { $lt: end }, end: { $gt: start } }],
            },
          },
        });

        if (existingBooking) {
          throw new Error(
            "Time slot already booked. Please choose a different time."
          );
        }

        // Create a new booking
        const booking = new Booking({
          user: user.id,
          venue,
          date,
          timeslots: [{ start, end }],
          selectedServices: validServices,
          totalPrice: totalAmount,
          bookingStatus: "PENDING",
          paymentStatus: "PENDING",
        });

        await booking.save();
        return booking;
      } catch (err) {
        throw new Error(`Error booking venue: ${err.message}`);
      }
    },

    initiatePayment: async (_, { bookingId, amount }, { user }) => {
      // Check if user is authenticated
      if (!user) throw new AuthenticationError("User not authenticated");

      const transactionId = uuidv4(); // Generate a unique transaction ID

      // Save transaction in DB
      const transaction = new Transaction({
        transactionId,
        user: user.id,
        booking: bookingId,
        amount,
        status: "PENDING",
      });

      await transaction.save();

      return {
        response: { success: true, message: "payment inititated" },
        transactionId,
      };
    },

    async verifyPayment(_, { transactionId }, { user }) {
      if (!user) throw new AuthenticationError("User not authenticated");
      const transaction = await Transaction.findOne({ transactionId });

      if (!transaction) {
        return { success: false, message: "Transaction not found!" };
      }

      const productCode = "EPAYTEST"; // Replace with actual product code if stored

      // Construct the URL with query parameters
      const url = new URL(
        "https://rc.esewa.com.np/api/epay/transaction/status/"
      );
      url.searchParams.append("product_code", productCode); // Merchant Code
      url.searchParams.append("total_amount", transaction.amount); // Total amount
      url.searchParams.append("transaction_uuid", transactionId); // Transaction Reference ID

      try {
        const esewaResponse = await fetch(url, {
          method: "GET", // Use GET for this endpoint
          headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Typically, for GET requests, this may not be needed
          },
        });

        const responseJson = await esewaResponse.json();

        // Check for the "status" field and verify if it's "COMPLETE"
        if (responseJson.status === "COMPLETE") {
          transaction.status = "PAID";
          transaction.esewaReference = responseJson.ref_id;
          await transaction.save();

          const booking = await Booking.findById(transaction.booking);
          if (booking) {
            booking.paymentStatus = "PAID";
            booking.bookingStatus = "APPROVED";
            await booking.save();
          }

          return {
            success: true,
            message: "Payment verified and booking confirmed!",
          };
        }

        return { success: false, message: "Payment verification failed!" };
      } catch (error) {
        console.error("Error verifying payment:", error);
        return {
          success: false,
          message: `Internal server error: ${error.message}`,
        };
      }
    },

    // approveBooking: async (parent, args, { user }) => {
    //   if (!user || user.role !== "VenueOwner") {
    //     throw new Error("Not authenticated");
    //   }

    //   const { bookingId } = args;

    //   try {
    //     const transaction = await Transaction.findOne({ booking: bookingId });

    //     if (!transaction || transaction.status !== "PAID") {
    //       throw new Error("Payment not verified");
    //     }
    //     // Find and update the booking first
    //     const booking = await Booking.findByIdAndUpdate(
    //       bookingId,
    //       {
    //         bookingStatus: "APPROVED",
    //         paymentStatus: "PAID", // Update the payment status here
    //       },
    //       { new: true }
    //     );

    //     if (!booking) {
    //       throw new Error("Booking not found");
    //     }

    //     // If booking is found and updated, then update the user
    //     await User.findByIdAndUpdate(
    //       user.id,
    //       {
    //         bookedVenue: booking._id,
    //       },
    //       { new: true }
    //     );

    //     return { success: true, message: "Booking approved sucessfully" };
    //   } catch (err) {
    //     throw new Error(`Failed to approve booking: ${err.message}`);
    //   }
    // },

    // rejectBooking: async (parent, args, { user }) => {
    //   if (!user || user.role !== "VenueOwner") {
    //     throw new Error("Not authenticated");
    //   }

    //   const { bookingId } = args;

    //   try {
    //     // Find and update the booking
    //     const booking = await Booking.findByIdAndUpdate(
    //       bookingId,
    //       { bookingStatus: "REJECTED" },
    //       { new: true }
    //     );

    //     if (!booking) {
    //       throw new Error("Booking not found");
    //     }

    //     return { success: true, message: "Booking rejected successfully" };
    //   } catch (err) {
    //     throw new Error(`Failed to reject booking: ${err.message}`);
    //   }
    // },

    // cancelBooking: async (_, { bookingId }) => {
    //   try {
    //     // Find the booking to cancel
    //     const booking = await Booking.findById(bookingId);
    //     if (!booking) {
    //       throw new Error("Booking not found");
    //     }

    //     // Update the booking status to CANCELLED
    //     booking.bookingStatus = "CANCELLED"; // Correct field to use is `bookingStatus`, not `status`
    //     await booking.save();

    //     // Update the user's bookedVenue field to remove the cancelled booking
    //     await User.findByIdAndUpdate(
    //       booking.user, // Use the user associated with the booking
    //       {
    //         $pull: { bookedVenue: booking._id }, // Remove the booking from the user's bookedVenue array
    //       },
    //       { new: true }
    //     );

    //     return booking; // Return the updated booking
    //   } catch (err) {
    //     throw new Error(`Error canceling booking: ${err.message}`);
    //   }
    // },

    addReview: async (_, args, { user }) => {
      const { comment, rating, venue } = args.input;

      if (!user) {
        throw new Error("Not Authenticated");
      }

      try {
        // Validate rating range
        if (rating < 1 || rating > 5) {
          throw new Error("Rating must be between 1 and 5.");
        }

        // Create and save the review
        const review = new Review({ user: user.id, venue, comment, rating });
        await review.save();

        return {
          response: {
            success: true,
            message: "Review added successfully.",
          },
          review,
        };
      } catch (err) {
        throw new Error(`Error adding review: ${err.message}`);
      }
    },

    removeReview: async (_, args) => {
      const { reviewId } = args;

      try {
        // Find and delete the review
        const review = await Review.findOneAndDelete({ _id: reviewId });
        if (!review) throw new Error("Review doesn't exist.");

        return {
          response: {
            success: true,
            message: "Review deleted successfully.",
          },
          deletedReview: review,
        };
      } catch (err) {
        throw new Error(`Error removing review: ${err.message}`);
      }
    },

    updateReview: async (_, args) => {
      const { reviewId, comment, rating } = args;

      try {
        // Validate rating range if provided
        if (rating && (rating < 1 || rating > 5)) {
          throw new Error("Rating must be between 1 and 5.");
        }

        // Find and update the review
        const review = await Review.findOneAndUpdate(
          { _id: reviewId },
          { ...(comment && { comment }), ...(rating && { rating }) }, // Update only provided fields
          { new: true } // Return the updated review
        );

        if (!review) throw new Error("Review not found.");

        return {
          response: {
            success: true,
            message: "Review updated successfully.",
          },
          updatedReview: review,
        };
      } catch (err) {
        throw new Error(`Error updating review: ${err.message}`);
      }
    },

    // Register a new user
    register: async (parent, args, { res }) => {
      const { name, email, password } = args;

      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        // Generate a random 6-digit verification code
        const randTokenGenerate = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        const newUser = new User({
          name,
          email,
          password,
          role: "Customer",
          verificationToken: randTokenGenerate.toString(),
          verificationTokenExpiresAt: new Date(
            Date.now() + 15 * 60 * 1000
          ).toISOString(),
        });

        await newUser.save();
        console.log(
          `Sending verification email to: ${newUser.email} with code: ${randTokenGenerate}`
        );
        await sendEmail(
          "email_verification",
          newUser.email,
          "Email Verification",
          randTokenGenerate
        );
        return {
          message: `Sending verification email to: ${newUser.email} with code`,
          success: true,
        };
      } catch (err) {
        console.error("Registration Error:", err);
        throw new Error("Registration failed. Please try again.");
      }
    },

    deleteUser: async (_, args) => {
      const { userId } = args;
      try {
        const user = await User.findOneAndDelete({ _id: userId });
        if (!user) {
          throw new Error("User doesn't exist");
        }
        return {
          response: {
            message: "User deleted sucessfully",
            success: true,
          },
          user,
        };
      } catch (err) { }
    },

    updateUserDetails: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error("Unauthorized!!!!");
      }
      try {
        const existingUser = await User.findById(user.id);
        if (!existingUser) {
          throw new Error("User doesn't exist");
        }

        Object.assign(existingUser, input);
        await existingUser.save(); // ✅ Save changes to the database

        return {
          message: "User details updated successfully",
          success: true,
        };
      } catch (err) {
        throw new Error("Error updating user details: " + err.message);
      }
    },

    // Login user and return a JWT
    login: async (_, { email, password }, context) => {
      const user = await User.findOne({ email }).select("+password"); // Ensure password is selected
      // console.log(user)
      if (!user) {
        throw new Error("User not found");
      }

      if (!user || user.verified === false) {
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password); // Direct comparison

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      setUserCookie(token, context);

      return token;
    },

    logout: async (_, __, { res }) => {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : undefined, // Only set in production
      });
      return { message: "logged out sucessfully", success: true };
    },

    resendCode: async (_, { email }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User doesn't exist");
        }
        // Generate a random 6-digit verification code
        const randTokenGenerate = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        user.verificationToken = randTokenGenerate;
        await user.save();

        sendEmail(
          "email_verification",
          email,
          "Email Verification",
          randTokenGenerate
        );
        return { message: "Verification code sended", success: true };
      } catch (err) {
        console.error("Failed to send code,", err.message);
        throw new Error(err.message);
      }
    },

    verifyUser: async (_, { email, code }, context) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists and the verification token matches the provided code
        if (!user || user.verificationToken !== code) {
          console.error("Invalid Code");
          throw new Error("Invalid Code");
        }

        // Check if the verification token has expired
        const tokenExpirationDate = new Date(user.verificationTokenExpiresAt);
        if (tokenExpirationDate < new Date()) {
          console.error("Verification code has expired");
          throw new Error("Verification code has expired");
        }

        // Clear the verification token and update user verification status
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        user.verified = true;
        user.expiresAt = undefined;

        // Save the updated user
        await user.save();

        // Send welcome email
        await sendEmail(
          "welcome_message",
          user.email,
          "Welcome to the family",
          "",
          user.username
        );

        const token = generateToken(user);
        setUserCookie(token, context);
        // Log the success
        // console.log("User verified and welcome email sent.");

        // Return the user object, excluding the password field
        return {
          token,
          user: { ...user.toObject(), password: undefined },
        };
      } catch (err) {
        // Improved error logging
        console.error("Failed to verify user:", err.message);
        throw new Error(`Verification Failed: ${err.message}`);
      }
    },

    passwordReset: async (_, { email }) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("User doesn't exist");
        }

        // Generate a secure reset token (you should define this function)
        const passwordResetToken = generateResetToken();

        // Set token expiry time (15 minutes from now)
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Update the user with the reset token and expiry
        user.resetToken = passwordResetToken;
        user.resetTokenExpiresAt = new Date(expiresAt); // Store as Date

        await user.save();

        console.log("User after updating:", user);

        // Send password reset email with the token link
        await sendEmail(
          "password_reset",
          user.email,
          "Password Reset Requested",
          "",
          user.name,
          `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}` // Reset link
        );

        // console.log("Password reset email sent");
        return {
          message: "Password reset link sended to your email.",
          success: true,
        };
      } catch (err) {
        console.error("Failed to reset password:", err.message);
        throw new Error(`Failed to reset password: ${err.message}`);
      }
    },

    newPassword: async (_, { password, token }, context) => {
      try {
        // Find user by the reset token
        const user = await User.findOne({ resetToken: token });

        if (!user || Date.now() > user.resetTokenExpiresAt) {
          throw new Error("Token is invalid or has expired.");
        }

        // Set the new password
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        user.expiresAt = undefined;
        user.verified = true
        await user.save();

        // Generate a new token for the user (if you want to log them in immediately)
        const newAuthToken = generateToken(user);

        setUserCookie(newAuthToken, context);
        // Send success email
        sendEmail(
          "password_reset_success",
          user.email,
          "Password Reset Successfully",
          "",
          user.username
        );

        return {
          message: "Password Reset Successfully",
          success: true,
        };
      } catch (err) {
        console.error("Error resetting password:", err.message);
        throw new Error(err.message);
      }
    },

    removeVenue: async (_, { venueId }, { user }) => {
      if (!user || user.role !== "VenueOwner") {
        throw new Error("Not authenticated");
      }

      // Find venue by ID
      const venue = await Venue.findById(venueId);
      if (!venue) {
        throw new Error("Venue not found");
      }

      // Check if the user is the owner
      if (venue.owner.toString() !== user.id) {
        throw new Error("Not authorized to delete this venue");
      }

      // Delete the venue image from Cloudinary
      if (venue.image && venue.image.public_id) {
        try {
          await deleteImageFromCloudinary(venue.image.public_id);
        } catch (error) {
          console.error("Error deleting venue image from Cloudinary:", error);
        }
      }

      // Delete the venue from the database
      await Venue.findByIdAndDelete(venueId);

      return {
        success: true,
        message: "Venue deleted successfully, services remain intact.",
      };
    },

    updateToVenueOwner: async (_, { input }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) throw new AuthenticationError("User not authenticated");

        const existingUser = await User.findById(user.id);
        if (!existingUser) throw new UserInputError("User not found");

        // Validate images
        if (
          !validateImage(input.profileImg) ||
          !validateImage(input.legalDocImg)
        ) {
          throw new UserInputError("Invalid image data");
        }

        // Validate location
        if (!validateLocation(input.address)) {
          throw new UserInputError("Invalid address data");
        }

        // Validate Esewa ID
        if (!validateEsewaId(input.esewaId)) {
          throw new UserInputError("Invalid Esewa ID");
        }

        // Update user fields
        existingUser.name = input.name;
        existingUser.email = input.email;
        existingUser.phone = input.phone;
        existingUser.description = input.description;
        existingUser.profileImg = input.profileImg;
        existingUser.legalDocImg = input.legalDocImg;
        existingUser.address = input.address;
        existingUser.esewaId = input.esewaId;
        existingUser.description = input.description;
        existingUser.roleApprovalStatus = "PENDING";

        await existingUser.save();

        return {
          success: true,
          message: "User upgraded to Venue Owner successfully",
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    generateSignature: async (
      _,
      { total_amount, transaction_uuid, product_code },
      { user }
    ) => {
      if (!user) {
        throw new Error("Unauthorized!!");
      }
      const signed_field_names = "total_amount,transaction_uuid,product_code";

      const data = {
        total_amount,
        transaction_uuid,
        product_code,
        signed_field_names,
      };

      const signature = generateSignature(data);

      return {
        signature,
        signed_field_names,
      };
    },

    async getUploadSignature(
      _,
      { tags, upload_preset, uploadFolder },
      { user }
    ) {
      if (!user) {
        throw new Error("Unauthorized!!");
      }
      return uploadSignature(tags, upload_preset, uploadFolder);
    },

    async getDeleteSignature(_, { publicId }, context) {
      return deleteSignature(publicId);
    },

    approveVenueOwner: async (_, { userId }, { user }) => {
      if (!user || user.role !== "Admin")
        return { success: false, message: "Unauthorized" };

      await User.findByIdAndUpdate(userId, {
        roleApprovalStatus: "APPROVED",
        role: "VenueOwner",
      });

      return { success: true, message: "User approved as Venue Owner." };
    },

    rejectVenueOwner: async (_, { userId }, { user }) => {
      if (!user || user.role !== "Admin")
        return { success: false, message: "Unauthorized" };

      await User.findByIdAndUpdate(userId, {
        role: "Customer",
        roleApprovalStatus: "REJECTED",
      });

      return { success: true, message: "User's venue owner request rejected." };
    },
    approveVenue: async (_, { venueId }, { user }) => {
      if (!user || user.role !== "Admin")
        return { success: false, message: "Unauthorized" };

      const venue = await Venue.findByIdAndUpdate(
        venueId,
        { approvalStatus: "APPROVED" },
        { new: true }
      );

      if (!venue) return { success: false, message: "Venue not found" };

      return { success: true, message: "Venue approved successfully." };
    },

    rejectVenue: async (_, { venueId }, { user }) => {
      if (!user || user.role !== "Admin")
        return { success: false, message: "Unauthorized" };

      const venue = await Venue.findByIdAndUpdate(
        venueId,
        { approvalStatus: "REJECTED" },
        { new: true }
      );

      if (!venue) return { success: false, message: "Venue not found" };

      return { success: true, message: "Venue rejected." };
    }

  },
  User: {
    async venues(parent) {
      return await Venue.find({ owner: parent._id });
    },
    async reviews(parent) {
      return await Review.find({ user: parent._id });
    },
    async bookings(parent) {
      return await Booking.find({ user: parent._id });
    },
  },

  Booking: {
    async user(parent) {
      return await User.findById(parent.user); // Fetch user who made this booking
    },
    async venue(parent) {
      return await Venue.findById(parent.venue); // Booking relates to one venue
    },
  },

  Review: {
    async user(parent) {
      return await User.findById(parent.user);
    },
    async venue(parent) {
      return await Venue.findById(parent.venue); // Review relates to one venue
    },
  },

  Venue: {
    async users(parent) {
      const bookings = await Booking.find({ venue: parent._id });
      const userIds = bookings.map((booking) => booking.user);
      return await User.find({ _id: { $in: userIds } });
    },
    async reviews(parent) {
      return await Review.find({ venue: parent._id });
    },
    async bookings(parent) {
      return await Booking.find({ venue: parent._id });
    },
    async services(parent) {
      return await Promise.all(
        parent.services.map(async (service) => {
          const serviceDetails = await Service.findById(service.serviceId);
          return {
            serviceId: serviceDetails, // Full service document
            servicePrice: service.servicePrice, // Custom price set by venue owner
          };
        })
      );
    },
  },

  Transaction: {
    async user(parent) {
      return await User.findById(parent.userId); // Fetch user who initiated the transaction
    },
    async booking(parent) {
      return await Booking.findById(parent.bookingId); // Fetch related booking
    },
    async venue(parent) {
      const booking = await Booking.findById(parent.bookingId);
      return booking ? await Venue.findById(booking.venue) : null; // Fetch venue from booking
    },
  },
  Services: {
    async venues(parent) {
      // Fetch the venues associated with the service
      const venues = await Venue.find({
        "services.serviceId": parent._id,
      });
      return venues;
    },
    async bookings(parent) {
      // Fetch bookings that include this service
      const bookings = await Booking.find({
        selectedServices: {
          $elemMatch: { serviceId: parent._id },
        },
      });
      return bookings;
    },
    async users(parent) {
      // Fetch users who have booked this service by looking for bookings containing the serviceId
      const bookings = await Booking.find({
        selectedServices: {
          $elemMatch: { serviceId: parent._id },
        },
      });
      const userIds = bookings.map((booking) => booking.user);
      return await User.find({ _id: { $in: userIds } });
    },
  },
};

export default resolvers;
