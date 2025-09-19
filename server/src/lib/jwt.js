const jwt = require("jsonwebtoken");
const genrateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    }
  );
};

const decodeToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
};

module.exports = { genrateToken, decodeToken };
