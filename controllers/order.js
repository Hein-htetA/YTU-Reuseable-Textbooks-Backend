const Order = require("../models/orderSchema");
const Book = require("../models/bookSchema");
const BadRequestError = require("../errors/bad-request");
const { getBookByDepartment } = require("./book");

const statusValue = {
  canceled: 0,
  pending: 1,
  completed: 1,
};

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
  const { orderId, status } = req.body;

  const order = await Order.findOne({ _id: orderId });

  const constant = statusValue[order.status] - statusValue[status];

  if (constant === 1) {
    //status changing
    const bulkWriteArray = order.books.map((book) => {
      return {
        updateOne: {
          filter: { _id: book._id },
          update: {
            $inc: { amountInStock: constant * book._doc.count },
          },
        },
      };
    });
    await Book.bulkWrite(bulkWriteArray); //update amount in stock
  } else if (constant === -1) {
    const booksIdFromOrder = order.books.map((book) => book._id.toString());
    //console.log("booksIdfromOder", booksIdFromOrder);
    const booksInDatabase = await Book.find({ _id: { $in: booksIdFromOrder } });
    //console.log("booksIndatabase", booksInDatabase);

    //check stock in amount is enough to accept order again
    for (let book of booksInDatabase) {
      const index = order.books.findIndex((book1) => {
        //console.log("book", book);
        //console.log("book1", book1);
        return book1._id.toString() === book._id.toString();
      });
      if (index !== -1) {
        //console.log("index found");
        if (book.amountInStock < order.books[index].count) {
          //console.log("count is less");
          throw new BadRequestError("Insufficient Stock");
        }
        //break;
      } else {
        //console.log("index not found");
        throw new Error();
      }
    }

    const bulkWriteArray = order.books.map((book) => {
      return {
        updateOne: {
          filter: { _id: book._id },
          update: {
            $inc: { amountInStock: constant * book._doc.count },
          },
        },
      };
    });
    await Book.bulkWrite(bulkWriteArray); //update amount in stock
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId },
    { status },
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
