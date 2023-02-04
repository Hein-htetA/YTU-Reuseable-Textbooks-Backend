const NormalUser = require("../models/normalUserSchema");

const updateUser = async (req, res) => {
  const userId = req.userId;
  const user = await NormalUser.findOneAndUpdate({ _id: userId }, req.body, {
    returnDocument: "after",
    runValidators: true,
  }).select({ password: 0 });
  res.status(200).json({ user, msg: "User updated successfully" });
};

module.exports = {
  updateUser,
};
