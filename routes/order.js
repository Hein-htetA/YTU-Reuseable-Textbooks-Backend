const express = require("express");
const {
  addNewOrder,
  getOrdersById,
  getOrdersByQuery,
  updateOrder,
} = require("../controllers/order");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");
const confirmAdminRole = require("../middleware/authenticateUserRoleMiddleware");

const router = express.Router();

router
  .route("/")
  .post(authenticationMiddleware, addNewOrder)
  .patch(authenticationMiddleware, confirmAdminRole, updateOrder);
router.route("/id/:userId").get(authenticationMiddleware, getOrdersById);
router
  .route("/admin")
  .get(authenticationMiddleware, confirmAdminRole, getOrdersByQuery);

module.exports = router;
