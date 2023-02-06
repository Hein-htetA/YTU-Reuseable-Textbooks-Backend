const Book = require("../models/bookSchema");
const s3Client = require("../db/awsClient");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");

const addNewBook = async (req, res) => {
  const { bookImage } = req.body;
  let bookPhotoId = "";
  let bookPhotoUrl = "";
  if (bookImage) {
    const format = menuImage.substring(
      menuImage.indexOf("data:") + 5,
      menuImage.indexOf(";base64")
    );
    const base64String = menuImage.replace(/^data:image\/\w+;base64,/, "");

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

  const addedNewBook = await Book.create({
    ...req.body,
    bookPhotoUrl,
    bookPhotoId,
  });

  res.status(200).json({ addedNewBook, msg: "Book Added Successfully" });
};

const updateBook = async (req, res) => {
  res.send("update book");
};

const searchBookByName = async (req, res) => {
  res.send("Search Book");
};

const getBookByDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const booksByDepartment = await Book.find({
    departments: departmentId,
  }).select(`
    -lastOwnerName
    -lastOwnerRollNo
    -departments`);
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
