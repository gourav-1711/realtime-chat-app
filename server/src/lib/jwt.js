const jwt = require("jsonwebtoken");
const genrateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
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

function generateOtpToken(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  const token = jwt.sign(
    { email, otp },
    process.env.JWT_SECRET,
    { expiresIn: "5m" } // OTP valid for 5 minutes
  );
  return { otp, token };
}

module.exports = { genrateToken, decodeToken, generateOtpToken };
