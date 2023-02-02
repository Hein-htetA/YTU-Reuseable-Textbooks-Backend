const NormalUser = require("../models/normalUserSchema");
const socialUser = require("../models/socialUserSchema");

const register = async (req, res) => {
  const { name, password, email, rollNo, socialToken } = req.body;
  res.send("register route");
};

const login = async (req, res) => {
  res.send("login route");
};

module.exports = {
  register,
  login,
};
