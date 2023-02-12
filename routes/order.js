const express = require("express");
const { addNewOrder, getOrders } = require("../controllers/order");

const router = express.Router();

router.route("/").post(addNewOrder);
router.route("/:userId").get(getOrders);

module.exports = router;
