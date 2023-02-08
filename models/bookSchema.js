const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    required: [true, "Book Title is required"],
    type: String,
    trim: true,
    lowercase: true,
  },
  edition: {
    type: String,
    default: "First Edition",
    trim: true,
    lowercase: true,
  },
  author: {
    required: [true, "Author is required"],
    type: String,
    trim: true,
    lowercase: true,
  },
  lastOwnerName: {
    type: String,
    default: "Unknown",
    trim: true,
    lowercase: true,
  },
  lastOwnerRollNo: {
    type: String,
    default: "Unknown",
    trim: true,
  },
  amountInStock: {
    type: Number,
    default: 1,
  },
  bookPhotoId: String,
  bookPhotoUrl: String,
  price: {
    type: Number,
    required: [true, "Price must be provided"],
  },
  availableChapters: {
    required: [true, "Available Chapters must be provided"],
    type: [Number],
  },
  departments: {
    required: [true, "Related departments must be provided"],
    type: [String],
  },
  year: {
    required: [true, "Years must be provided"],
    type: [Number],
  },
});

module.exports = mongoose.model("Book", bookSchema);
