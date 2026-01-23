const express = require("express");
const router = express.Router();
const passport = require("../lib/passport");
const { genrateToken } = require("../lib/jwt");

// Initiate Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed`,
  }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = genrateToken(req.user);

      // Redirect to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}/api/auth/google/callback?token=${token}`,
      );
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}?error=auth_failed`,
      );
    }
  },
);

module.exports = router;
