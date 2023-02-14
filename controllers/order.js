const Order = require("../models/orderSchema");
const Book = require("../models/bookSchema");
const BadRequestError = require("../errors/bad-request");

const addNewOrder = async (req, res) => {
  const { books } = req.body;
  const bookIdArray = books.map((book) => book._id);

  const booksInDatabase = await Book.find({
    $or: bookIdArray.map((id) => ({ _id: id })),
  });

  if (bookIdArray.length !== booksInDatabase.length) {
    throw new BadRequestError("");
  } //edge case when database clearing outofstock items

  let error = "";
  for (let book of books) {
    const index = booksInDatabase.findIndex(
      (singleBook) => singleBook._id.toString() === book._id
    );
    if (booksInDatabase[index].amountInStock < book.count) {
      if (book.count === 1) {
        error += booksInDatabase[index].title + "(Out Of Stock)" + ",";
      } else {
        error += booksInDatabase[index].title + ",";
      }
    } else {
      booksInDatabase[index]._doc.count = book.count;
    }
  }

  if (error) {
    throw new BadRequestError(error);
  }

  const bulkWriteArray = booksInDatabase.map((book) => {
    return {
      updateOne: {
        filter: { _id: book._id },
        update: { amountInStock: book._doc.amountInStock - book._doc.count },
      },
    };
  });

  await Book.bulkWrite(bulkWriteArray); //update amount in stock after successful order

  const order = await Order.create({ ...req.body, books: booksInDatabase });

  res.status(200).json({ order, msg: "Ordered Successfully" });
};

const getOrdersById = async (req, res) => {
  const { userId } = req.userId;
  const orders = await Order.find({ userId });
  res.status(200).json({
    orders,
    nbHits: orders.length,
    msg: "Fetched Orders Successfully",
  });
};

const getOrdersByQuery = async (req, res) => {
  const { start, end, status } = req.query;
  let filter = {};
  if (status) {
    filter = {
      createdAt: { $gt: start, $lt: end },
      status,
    };
  } else {
    filter = {
      createdAt: { $gt: start, $lt: end },
    };
  }
  const orders = await Order.find(filter);

  res.status(200).json({
    orders,
    nbHits: orders.length,
    msg: "Fetch Orders for this query successfully",
  });
};

const updateOrder = async (req, res) => {
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: req.body.orderId },
    { status: req.body.status },
    {
      new: true,
    }
  );
  res.status(200).json({ updatedOrder, msg: "Order Updated Successfully" });
};

module.exports = {
  addNewOrder,
  getOrdersById,
  getOrdersByQuery,
  updateOrder,
};
