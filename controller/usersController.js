// External imports
const bcrypt = require("bcryptjs");
const { unlink } = require("fs");
const path = require("path");

// Internal imports
const User = require("../models/People");

// Get users page
async function getUsers(req, res, next) {
  try {
    const users = await User.find({}, "-password"); // ❌ পাসওয়ার্ড exclude করা হয়েছে
    res.render("users", { users });
  } catch (err) {
    next(err);
  }
}

// Add user
async function addUser(req, res, next) {
  try {
    // Hash password securely
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Prepare user data
    const userData = {
      ...req.body,
      password: hashedPassword,
      avatar: req.files?.[0]?.filename || null, // Optional avatar support
    };

    // Save user
    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({ message: "User was added successfully!" });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: { msg: "Unknown error occurred!" },
      },
    });
  }
}

// Remove user
async function removeUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ errors: { common: { msg: "User not found!" } } });
    }

    // Remove user avatar if exists
    if (user.avatar) {
      const avatarPath = path.join(__dirname, "../public/uploads/avatars", user.avatar);
      unlink(avatarPath, (err) => {
        if (err) console.error("Error deleting avatar:", err);
      });
    }

    res.status(200).json({ message: "User was removed successfully!" });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: { msg: "Could not delete the user!" },
      },
    });
  }
}

module.exports = {
  getUsers,
  addUser,
  removeUser,
};
