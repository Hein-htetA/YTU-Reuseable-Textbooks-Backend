const mongoose = require("mongoose");

const socialUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  role: {
    type: String,
    default: "user",
  },
  signInType: {
    type: String,
    default: "social",
  },
  picture: String,
  rollNo: String,
});

module.exports = mongoose.model("SocialUser", socialUserSchema, "users");
