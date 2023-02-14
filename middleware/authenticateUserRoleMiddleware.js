const { UnauthenticatedError } = require("../errors");

const confirmAdminRole = async (req, res, next) => {
  if (req.role !== "admin") {
    throw new UnauthenticatedError("Authentication invalid");
  }
  next();
};

module.exports = confirmAdminRole;
