const express = require("express");

const {
  addNewBook,
  getBookByDepartment,
  searchBookByName,
  updateBook,
} = require("../controllers/book");

const router = express.Router();

router.route("/").post(addNewBook).patch(updateBook);
router.route("/department/:departmentId").get(getBookByDepartment);
router.route("/title/:title").get(searchBookByName);

module.exports = router;
