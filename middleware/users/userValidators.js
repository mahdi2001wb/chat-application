// External imports
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const path = require("path");
const { unlink } = require("fs");

// Internal imports
const User = require("../../models/People");

// Add user validators
const addUserValidators = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must only contain alphabets")
    .trim(),

  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject(createError("Email is already in use!"));
        }
      } catch (err) {
        return Promise.reject(createError(err.message));
      }
    }),

  check("mobile")
    .isMobilePhone("bn-BD", { strictMode: true })
    .withMessage("Mobile number must be a valid Bangladeshi number")
    .custom(async (value) => {
      try {
        const user = await User.findOne({ mobile: value });
        if (user) {
          return Promise.reject(createError("Mobile number is already in use!"));
        }
      } catch (err) {
        return Promise.reject(createError(err.message));
      }
    }),

  check("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long & include at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol"
    ),
];

// Add user validation handler
const addUserValidationHandler = (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // Remove uploaded files (if any)
    if (req.files?.length > 0) {
      req.files.forEach((file) => {
        const filePath = path.join(__dirname, "../../public/uploads/avatars", file.filename);
        unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }

    // Respond with validation errors
    res.status(400).json({
      errors: mappedErrors,
    });
  }
};

module.exports = {
  addUserValidators,
  addUserValidationHandler,
};
