// External imports
const express = require("express");
const { addUserValidators, addUserValidationHandler } = require("../middleware/users/userValidators");

// Internal imports
const { getUsers, addUser, removeUser } = require("../controller/usersController");
const decorateHtmlResponse = require("../middleware/common/decorateHtmlResponse");
const avatarUpload = require("../middleware/users/avatarUpload");
const { checkLogin, requireRole } = require("../middleware/common/checkLogin");

const router = express.Router();

// Users page
router.get(
  "/",
  checkLogin, // ✅ Middleware order fixed
  requireRole(["admin"]), 
  decorateHtmlResponse("Users"), 
  getUsers
);

// Add user
router.post(
  "/",
  checkLogin,
  requireRole(["admin"]),
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser
);

// Remove user
router.delete("/:id", checkLogin, requireRole(["admin"]), removeUser); // ✅ Secured delete route

module.exports = router;
