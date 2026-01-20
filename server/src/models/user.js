const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      match: /^.{3,}$/,
    },
    description: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: function () {
        // Password is required only for local auth users
        return this.authProvider === "local" || !this.authProvider;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
    },
    mobile: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "offline",
      enum: ["online", "offline"],
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
