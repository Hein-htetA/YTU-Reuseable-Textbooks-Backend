const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, Try again later",
  };

  if (err.statusCode) {
    customError = {
      statusCode: err.statusCode,
      msg: err.message,
    };
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Account with this email address already exists`;
    customError.statusCode = 400;
  }
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
