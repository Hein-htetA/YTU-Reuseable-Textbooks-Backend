const express = require("express");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const authenticateUserRoleMiddleware = require("../middleware/authenticateUserRoleMiddleware");

const {
  addNewBook,
  getBookByDepartment,
  searchBookByName,
  updateBook,
} = require("../controllers/book");

const router = express.Router();

router
  .route("/")
  .post(authenticationMiddleware, authenticateUserRoleMiddleware, addNewBook)
  .patch(authenticationMiddleware, authenticateUserRoleMiddleware, updateBook);

router.route("/department/:departmentId").get(getBookByDepartment);
router.route("/title/:title").get(searchBookByName);

module.exports = router;
