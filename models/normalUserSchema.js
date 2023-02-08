const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const normalUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
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
  rollNo: { type: String, trim: true },
  signInType: {
    type: String,
    default: "normal",
  },
});

normalUserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

normalUserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("NormalUser", normalUserSchema, "users");
