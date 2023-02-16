const Book = require("../models/bookSchema");
const s3Client = require("../db/awsClient");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");

const addNewBook = async (req, res) => {
  const filter = {
    title: req.body.title,
    author: req.body.author,
    edition: req.body.edition,
    price: req.body.price,
    availableChapters: {
      $size: `${req.body.availableChapters.length}`,
      $all: req.body.availableChapters,
    },
  };

  const options = {
    new: true,
  };

  const bookInDatabase = await Book.findOne(filter);

  let addedNewBook = {};
  let status = ""; //for frontend to distinguish new or update

  if (bookInDatabase) {
    addedNewBook = await Book.findOneAndUpdate(
      { _id: bookInDatabase._id },
      {
        $set: {
          amountInStock: req.body.amountInStock + bookInDatabase.amountInStock,
          departments: [...req.body.departments, ...bookInDatabase.departments],
        },
      },
      options
    );
    status = "update";
  } else {
    const { bookImage } = req.body;

    let bookPhotoId = "";
    let bookPhotoUrl = "";
    if (bookImage) {
      const format = bookImage.substring(
        bookImage.indexOf("data:") + 5,
        bookImage.indexOf(";base64")
      );
      const base64String = bookImage.replace(/^data:image\/\w+;base64,/, "");

      const buff = Buffer.from(base64String, "base64");

      bookPhotoId = randomUUID();
      bookPhotoUrl = `https://${process.env.AWS_BOOK_BUCKET}.s3.ap-southeast-1.amazonaws.com/${bookPhotoId}`;

      const params = {
        Bucket: process.env.AWS_BOOK_BUCKET, // The name of the bucket. For example, 'sample_bucket_101'.
        Key: bookPhotoId, // The name of the object. For example, 'sample_upload.txt'.
        Body: buff,
        ContentEncoding: "base64",
        ContentType: format,
      };

      const results = await s3Client.send(new PutObjectCommand(params));
    }

    addedNewBook = await Book.create({
      ...req.body,
      bookPhotoUrl,
      bookPhotoId,
    });
    status = "insert";
  }

  res
    .status(200)
    .json({ addedNewBook, msg: "Book Added Successfully", status });
};

const updateBook = async (req, res) => {
  const { _id, bookImage, bookPhotoId, bookPhotoUrl } = req.body;
  let updatedBook = {};

  if (bookImage) {
    const format = bookImage.substring(
      bookImage.indexOf("data:") + 5,
      bookImage.indexOf(";base64")
    );
    const base64String = bookImage.replace(/^data:image\/\w+;base64,/, "");

    const buff = Buffer.from(base64String, "base64");

    const newBookPhotoId = randomUUID();
    const newBookPhotoUrl = `https://${process.env.AWS_BOOK_BUCKET}.s3.ap-southeast-1.amazonaws.com/${newBookPhotoId}`;

    const params = {
      Bucket: process.env.AWS_BOOK_BUCKET, // The name of the bucket. For example, 'sample_bucket_101'.
      Key: newBookPhotoId, // The name of the object. For example, 'sample_upload.txt'.
      Body: buff,
      ContentEncoding: "base64",
      ContentType: format,
    };

    updatedBook = await Book.findOneAndUpdate(
      { _id },
      {
        ...req.body,
        bookPhotoId: newBookPhotoId,
        bookPhotoUrl: newBookPhotoUrl,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    const results = await s3Client.send(new PutObjectCommand(params));

    if (bookPhotoId) {
      const deleteObjectParams = {
        Bucket: process.env.AWS_BOOK_BUCKET, // The name of the bucket. For example, 'sample_bucket_101'.
        Key: bookPhotoId, // The name of the object. For example, 'sample_upload.txt'.,
      };

      const deleteResult = await s3Client.send(
        new DeleteObjectCommand(deleteObjectParams)
      );
    }
  } else if (!bookPhotoUrl && bookPhotoId) {
    updatedBook = await Book.findOneAndUpdate(
      { _id },
      { ...req.body, bookPhotoId: "", bookPhotoUrl: "" },
      { runValidators: true, returnDocument: "after" }
    );
    const deleteObjectParams = {
      Bucket: process.env.AWS_BOOK_BUCKET, // The name of the bucket. For example, 'sample_bucket_101'.
      Key: bookPhotoId, // The name of the object. For example, 'sample_upload.txt'.,
    };

    const deleteResult = await s3Client.send(
      new DeleteObjectCommand(deleteObjectParams)
    );
  } else {
    updatedBook = await Book.findOneAndUpdate({ _id }, req.body, {
      runValidators: true,
      returnDocument: "after",
    });
  }

  res.status(200).json({
    updatedBook,
    msg: "updated successfully",
  });
};

const searchBookByName = async (req, res) => {
  const { title } = req.params;

  const pipeline = [
    {
      $search: {
        index: "title",
        autocomplete: {
          query: title,
          path: "title",
        },
      },
    },
    {
      $match: {
        amountInStock: {
          $gt: 0,
        },
      },
    },
    {
      $project: {
        lastOwnerName: false,
        lastOwnerRollNo: false,
      },
    },
  ];
  const books = await Book.aggregate(pipeline).limit(10);
  res.send({ books, msg: "fetched successfully", nbHits: books.length });
};

const getBookByDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const booksByDepartment = await Book.find({
    departments: departmentId,
    amountInStock: { $gt: 0 },
  }).select(`
    -lastOwnerName
    -lastOwnerRollNo
    `);
  res.status(200).json({
    booksByDepartment,
    msg: "Fetch books by department successfully",
    nbHits: booksByDepartment.length,
  });
};

module.exports = {
  addNewBook,
  updateBook,
  searchBookByName,
  getBookByDepartment,
};
