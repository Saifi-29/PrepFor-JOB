import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const register = catchAsync(async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    // Enhanced input validation
    if (!fullname || !email || !phoneNumber || !password || !role) {
      throw new AppError("All fields are required", 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError("Invalid email format", 400);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters long", 400);
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phoneNumber)) {
      throw new AppError("Phone number must be 10 digits", 400);
    }

    const file = req.file;
    if (!file) {
      throw new AppError("Profile photo is required", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("User already exists with this email", 400);
    }

    // Upload file to cloudinary
    const fileUri = getDataUri(file);
    const cloudResponse = await uploadToCloudinary(fileUri.content);

    if (!cloudResponse || !cloudResponse.secure_url) {
      throw new AppError("Failed to upload profile photo", 500);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullname: fullname.trim(),
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      success: true,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Registration Error:', error);
    throw new AppError(error.message || "Failed to create account", 500);
  }
});

export const login = catchAsync(async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Enhanced input validation
    if (!email || !password || !role) {
      throw new AppError("Please fill all required fields", 400);
    }

    if (!isValidEmail(email)) {
      throw new AppError("Invalid email format", 400);
    }

    // Find user and handle case sensitivity
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check role
    if (role !== user.role) {
      throw new AppError("Account doesn't exist with current role", 403);
    }

    // Create token
    const tokenData = {
      userId: user._id,
      role: user.role
    };
    
    const token = jwt.sign(
      tokenData, 
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: "1d" }
    );

    // Prepare user data without sensitive information
    const userData = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    // Set cookie with proper configuration
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
      path: "/",
      domain: process.env.COOKIE_DOMAIN || 'localhost'
    });

    return res.status(200).json({
      message: `Welcome back ${userData.fullname}`,
      user: userData,
      token,
      success: true,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Login Error:', error);
    throw new AppError(error.message || "Failed to login", 500);
  }
});

export const logout = catchAsync(async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Clear the token cookie with all necessary options
    res.cookie('token', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || 'localhost'
    });

    // Also clear it without domain/path to ensure it's removed
    res.clearCookie('token');

    return res.status(200).json({
      message: "Logged out successfully",
      success: true
    });
  } catch (error) {
    console.error('Logout Error:', error);
    throw new AppError("Failed to logout", 500);
  }
});

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    const file = req.file;
    // cloudinary ayega idhar
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
      upload_preset: "Test", // Uses your preset
      resource_type: "auto",
      access_mode: 'public'
    });

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id; // middleware authentication
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }
    // updating data
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    // resume comes later here...
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
      user.profile.resumeOriginalName = file.originalname; // Save the original file name
    }

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
