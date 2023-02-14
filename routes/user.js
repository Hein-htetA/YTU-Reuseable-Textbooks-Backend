const express = require("express");
const { updateUser } = require("../controllers/user");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

const router = express.Router();

router.route("/").patch(authenticationMiddleware, updateUser);

module.exports = router;
