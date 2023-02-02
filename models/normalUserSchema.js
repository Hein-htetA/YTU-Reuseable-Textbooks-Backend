const mongoose = require("mongoose");

const normalUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
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
  rollNo: String,
});

module.exports = mongoose.model("NormalUser", normalUserSchema, "users");
