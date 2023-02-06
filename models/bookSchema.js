const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    required: [true, "Book Title is required"],
    type: String,
  },
  edition: {
    type: String,
    default: "First Edition",
  },
  author: {
    required: [true, "Author is required"],
    type: String,
  },
  lastOwnerName: {
    type: String,
  },
  lastOwnerRollNo: {
    type: String,
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
