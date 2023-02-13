const mongoose = require("mongoose");

const bookInOrderSchema = new mongoose.Schema({
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
  count: {
    type: Number,
    required: [true, "Count in order must be provided"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.ObjectId,
      required: ["Customer Id is required"],
    },
    customerName: {
      type: String,
      required: ["Customer Name is required"],
    },
    books: [bookInOrderSchema],
    status: {
      type: String,
      enum: {
        values: ["pending", "canceled", "completed"],
        message: `{VALUE} is not supported`,
      },
      default: "pending",
    },
    phone: String,
    telegram: String,
    viber: String,
    facebook: String,
    totalAmount: {
      required: [true, "Total Amount must be provided"],
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
