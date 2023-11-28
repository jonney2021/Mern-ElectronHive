import asyncHandler from "../middleware/asyncHandler.js";
import EmailVerificationToken from "../models/emailVerificationToken.js";
import PasswordResetToken from "../models/passwordResetToken.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { generateMailTransport, generateOTP } from "../utils/mail.js";
import bcrypt from "bcryptjs";

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc Register user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    isEmailVerified: false, // Add a field to track if the email is verified
  });

  if (user) {
    // Generate an OTP
    const OTP = generateOTP();

    // store otp inside our db
    const newEmailVerificationToken = new EmailVerificationToken({
      owner: user._id,
      token: OTP,
    });

    await newEmailVerificationToken.save();
    // send that otp to our user
    // copy from mailtrap.io
    var transport = generateMailTransport();

    transport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: user.email,
      subject: "Email Verification",
      html: `
    <p>Your verification OTP</p>
    <h1>${OTP}</h1>
    `,
    });

    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Verify otp
// @route POST /api/verify-otp
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, OTP } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found for email: ${email}`);
    res.status(404);
    throw new Error("User not found");
  }

  // Find the OTP record
  const otpRecord = await EmailVerificationToken.findOne({
    owner: user._id,
    // token: OTP,
  });
  // Compare the hashed token
  if (!otpRecord || !(await otpRecord.compareToken(OTP))) {
    res.status(400);
    throw new Error("OTP is incorrect or has expired");
  }

  // // Check if the OTP has expired
  // if (otpRecord && otpRecord.createAt.getTime() + 3600000 < Date.now()) {
  //   await EmailVerificationToken.deleteOne({ _id: otpRecord._id });
  //   res.status(400);
  //   throw new Error("OTP has expired");
  // }

  // If the OTP is correct and not expired, mark the email as verified
  user.isVerified = true;
  await user.save();

  // clean up the OTP record
  await EmailVerificationToken.deleteOne({ _id: otpRecord._id });

  // Send welcome email
  const welcomeEmailOptions = {
    from: process.env.EMAIL_SENDER,
    to: user.email,
    subject: "Welcome to Our Application!",
    html: `<h1>Welcome ${user.name}!</h1><p>Your email has been successfully verified.</p>`,
  };

  var transport = generateMailTransport();
  transport.sendMail(welcomeEmailOptions, (error, info) => {
    if (error) {
      console.error("Error sending welcome email:", error);
      // Handle the error according to your application needs
    } else {
      console.log("Welcome email sent:", info.response);
    }
  });

  // Respond to the front-end
  res.status(200).json({
    message: "Email verified successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});

// @desc Logout user / clear cookie
// @route POST /api/users/logout
// @access Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Logged out successfully!",
  });
});

// @desc Forgot password
// @route POST /api/users/forgot-password
// @access Public

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if there's already a password reset token for this user
  const alreadyHasToken = await PasswordResetToken.findOne({ user: user._id });

  if (alreadyHasToken) {
    res.status(404);
    throw new Error("Only after one hour you can request for another token!");
  }

  // Generate a random token
  const token = generateRandomToken();

  // Save the reset token to the PasswordResetToken model
  const passwordResetToken = new PasswordResetToken({
    user: user._id,
    token,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  await passwordResetToken.save();

  // Determine the reset link based on the environment (production or development)
  const resetLink =
    process.env.NODE_ENV === "production"
      ? `https://electronhive.onrender.com/reset-password/${token}`
      : `http://localhost:3000/reset-password/${token}`;

  // Send the reset email
  const resetEmailOptions = {
    from: process.env.EMAIL_SENDER,
    to: user.email,
    subject: "Password Reset",
    html: `
      <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
      <p>Please click on the following link or paste it into your browser to complete the process:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `,
  };

  const transport = generateMailTransport();
  transport.sendMail(resetEmailOptions, (error, info) => {
    if (error) {
      console.error("Error sending password reset email:", error);
      res.status(500).json({
        message: "Error sending password reset email",
        error: error.message, // Include the error message in the response
      });
    } else {
      console.log("Password reset email sent:", info.response);
      res.status(200).json({
        message: "Password reset email sent",
      });
    }
  });
});

function generateRandomToken() {
  return Math.random().toString(36).substring(2);
}

// @desc Reset password
// @route POST /api/users/reset-password/:resetToken
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.params.resetToken;
  // const { password } = req.body;
  const { password, confirmPassword } = req.body;

  // Find the password reset token
  const passwordResetToken = await PasswordResetToken.findOne({
    token: resetToken,
    expires: { $gt: Date.now() },
  }).populate("user");

  if (!passwordResetToken) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Check if the new password is different from the old one
  if (await passwordResetToken.user.matchPassword(password)) {
    res.status(400);
    throw new Error("New password must be different from the old one");
  }

  // Check if the new passwords match
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const cryptedPassword = await bcrypt.hash(password, 12);
  await User.updateOne(
    { _id: passwordResetToken.user._id },
    {
      $set: {
        password: cryptedPassword,
      },
    }
  );

  // Remove the password reset token from the database
  await PasswordResetToken.deleteOne({ _id: passwordResetToken._id });

  res.status(200).json({
    message: "Password reset successful",
  });
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Purivate
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updateUser = await user.save();
    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      isAdmin: updateUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Get users
// @route GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private/Admin
const getUserByID = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Delete users
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: "User deleted successfully" });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// @desc Update users
// @route PUT /api/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  verifyOtp,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserByID,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
};
