require("dotenv").config();
require("express-async-errors");
const express = require("express");
// const connectDB = require("./db/connect");
const mongoose = require("mongoose");
const cors = require("cors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

//Routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const bookRouter = require("./routes/book");
const orderRouter = require("./routes/order");

//Middleware
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();

app.use(cors());

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("YTU-Reuseable-Textbooks");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/order", orderRouter);

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

// const start = async () => {
//   try {
//     await connectDB(process.env.MONGO_URI);
//     app.listen(port, () =>
//       console.log(`Sever is listening at port ${port}....`)
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };
// start();

connectDB().then(() => {
  app.listen(port, () => {
    console.log("listening for requests");
  });
});

module.exports = app;
