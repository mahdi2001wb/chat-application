const jwt = require("jsonwebtoken");
const createError = require("http-errors");

// Auth guard to protect routes that require authentication
const checkLogin = (req, res, next) => {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    try {
      const token = cookies[process.env.COOKIE_NAME];

      if (!token) {
        throw createError(401, "Authentication token missing!");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Pass user info to response locals
      if (res.locals.html) {
        res.locals.loggedInUser = decoded;
      }

      next();
    } catch (err) {
      console.error("Auth Error:", err.message); // Debugging log
      if (res.locals.html) {
        res.redirect("/");
      } else {
        res.status(401).json({
          errors: {
            common: {
              msg: "Authentication failed! Invalid token.",
            },
          },
        });
      }
    }
  } else {
    if (res.locals.html) {
      res.redirect("/");
    } else {
      res.status(401).json({
        error: "Authentication required!",
      });
    }
  }
};

// Redirect already logged-in users to the inbox page
const redirectLoggedIn = (req, res, next) => {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (!cookies || !cookies[process.env.COOKIE_NAME]) {
    next();
  } else {
    res.redirect("/inbox");
  }
};

// Guard to protect routes that require role-based authorization
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      if (res.locals.html) {
        next(createError(403, "Access Denied! You are not authorized."));
      } else {
        res.status(403).json({
          errors: {
            common: {
              msg: "Access Denied! You do not have permission.",
            },
          },
        });
      }
    }
  };
}

module.exports = {
  checkLogin,
  redirectLoggedIn,
  requireRole,
};
