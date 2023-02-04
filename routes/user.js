const express = require("express");
const { updateUser } = require("../controllers/user");

const router = express.Router();

router.route("/").patch(updateUser);

module.exports = router;
