const jwt = require("jsonwebtoken");

// Token expiry time in seconds (7 days)
const TOKEN_EXPIRY = 7 * 24 * 60 * 60;

const genrateToken = (user) => {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY;

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      expiresAt, // Include expiry timestamp for frontend monitoring
    },
    process.env.JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRY,
    },
  );
};

const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("Token expired at:", err.expiredAt);
      return null;
    }
    console.error("Invalid token:", err.message);
    return null;
  }
};

/**
 * Verify token and return full decoded payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Token expired but we can still decode it for refresh
      const decoded = jwt.decode(token);
      return { valid: false, expired: true, decoded };
    }
    return { valid: false, expired: false, decoded: null };
  }
};

/**
 * Generate a new token from an existing valid or recently expired token
 * Allows refresh within a grace period of 24 hours after expiry
 */
const refreshToken = (oldToken) => {
  try {
    // Try to decode the token (even if expired)
    const decoded = jwt.decode(oldToken);

    if (!decoded || !decoded.id) {
      return { success: false, error: "Invalid token" };
    }

    // Check if token is within refresh grace period (24 hours after expiry)
    const now = Math.floor(Date.now() / 1000);
    const gracePeriod = 24 * 60 * 60; // 24 hours

    if (decoded.expiresAt && now > decoded.expiresAt + gracePeriod) {
      return { success: false, error: "Token too old to refresh" };
    }

    // Verify the token is not tampered (if not expired)
    try {
      jwt.verify(oldToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        return { success: false, error: "Invalid token signature" };
      }
      // TokenExpiredError is OK, we still allow refresh
    }

    // Generate new token
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY;
    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        expiresAt,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRY,
      },
    );

    return { success: true, token: newToken, expiresAt };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

function generateOtpToken(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
  return { otp, token };
}

module.exports = {
  genrateToken,
  decodeToken,
  generateOtpToken,
  verifyToken,
  refreshToken,
  TOKEN_EXPIRY,
};
