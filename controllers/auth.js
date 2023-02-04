const NormalUser = require("../models/normalUserSchema");
const SocialUser = require("../models/socialUserSchema");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { UnauthenticatedError } = require("../errors");

const client = new OAuth2Client(process.env.OAuth_Client_ID);

const register = async (req, res) => {
  const user = await NormalUser.create(req.body);
  user.password = undefined;

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  res.status(201).json({
    user,
    token,
    msg: "Registered Successfully",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await NormalUser.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  user.password = undefined;

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  res.status(200).json({
    user,
    token,
    msg: "Logged In Successfully",
  });
};

const socialSignIn = async (req, res) => {
  const { socialToken } = req.body;

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: socialToken,
      audience: process.env.OAuth_Client_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const { email, name, picture } = payload;

  const user = await SocialUser.findOneAndUpdate(
    { email },
    { name, picture },
    {
      upsert: true,
      runValidators: true,
      new: true,
    }
  );

  console.log("user", user);

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  res.status(200).json({ user, token, msg: "Social Sign In Successfully" });
};

module.exports = {
  register,
  login,
  socialSignIn,
};
