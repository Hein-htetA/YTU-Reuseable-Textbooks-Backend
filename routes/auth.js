const express = require("express");
const router = express.Router();
const { register, login, socialSignIn } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/socialSignIn", socialSignIn);

module.exports = router;
