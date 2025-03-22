// External Imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

// Internal Imports
const User = require("../models/People");

// Get login page
function getLogin(req, res, next) {
  res.render("index");
}

// Login Function
async function login(req, res, next) {
  try {
    // Find user by email or mobile
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }], // Typo fixed: `mibile` -> `mobile`
    });

    if (user && user._id) {
      // Validate password
      const isValidPassword = await bcrypt.compare(req.body.password, user.password);

      if (isValidPassword) {
        // Prepare user object for token
        const userObject = {
          userid: user._id,
          username: user.name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || "user",
        };

        // Generate JWT token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        // Set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: parseInt(process.env.JWT_EXPIRY), // Convert string to number
          httpOnly: true,
          signed: true,
        });

        // Set logged-in user local identifier
        res.locals.loggedInUser = userObject;

        res.redirect("/inbox");
      } else {
        throw createError(401, "Invalid password! Please try again.");
      }
    } else {
      throw createError(404, "User not found! Please check your credentials.");
    }
  } catch (err) {
    console.error("Login Error:", err.message); // Debugging
    res.render("index", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// Logout Function
function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.status(200).json({ success: true, message: "Logged out successfully!" });
}

module.exports = {
  getLogin,
  login,
  logout,
};
