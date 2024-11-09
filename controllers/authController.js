const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
require("dotenv").config();
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const sendWithSendGrid = require("../utils/sendEmail.js");

const AuthController = {
  signup,
  login,
  validateAuth,
  getPayloadFromJWT,
  getUserByValidationToken,
  updateToken,
};

const secretForToken = process.env.TOKEN_SECRET;

async function signup(data) {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email in use");
  }

  const userAvatar = gravatar.url(email);

  const token = uuidv4();

  const newUser = new User({
    email: email,
    subscription: "starter",
    token: null,
    avatarURL: userAvatar,

    verificationToken: token,
    verify: false,
  });

  sendWithSendGrid(email, token);

  newUser.setPassword(password);

  await newUser.save();

  return newUser;
}

async function login(data) {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email, verify: true });

  if (!user) {
    throw new Error("Email or password is wrong");
  }

  const passwordMatch = user.validPassword(password);
  if (!passwordMatch) {
    throw new Error("Email or password is wrong");
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    secretForToken,
    {
      expiresIn: "1h",
    }
  );

  user.token = token;
  await user.save();

  return { token, user };
}

function getPayloadFromJWT(token) {
  try {
    const payload = jwt.verify(token, secretForToken);

    return payload;
  } catch (err) {
    console.error(err);
  }
}

function validateAuth(req, res, next) {
  console.log("validateAuth middleware called");
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      console.log("Unauthorized request");
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    console.log("User authenticated:", user);
    req.user = user;
    next();
  })(req, res, next);
}

async function getUserByValidationToken(token) {
  const user = await User.findOne({
    verificationToken: token,
    verify: false,
  });

  if (user) {
    return true;
  }

  return false;
}

async function updateToken(email, token) {
  token = token || uuidv4();

  await User.findOneAndUpdate({ email: email }, { verificationToken: token });

  sendWithSendGrid(email, token);
}

module.exports = AuthController;
