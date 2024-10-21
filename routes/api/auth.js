const express = require("express");
const AuthController = require("../../controllers/authController.js");
const User = require("../../models/user.js");
const colors = require("colors");
const UserController = require("../../controllers/userController.js");
const router = express.Router();

function validateSignupPayload(data) {
  const { email, password } = data;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) {
    return "Email and password are required";
  }

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  return null;
}

function validateLoginPayload(data) {
  const { email, password } = data;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) {
    return "Email and password are required";
  }

  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
}

router.post("/signup", async (req, res) => {
  try {
    const validationError = validateSignupPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const newUser = await AuthController.signup(req.body);

    console.log(colors.bgYellow.italic.bold("--- Signup! ---"));

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    if (error.message === "Email in use") {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const validationError = validateLoginPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { token, user } = await AuthController.login(req.body);

    console.log(
      colors.bgYellow.italic.bold(`--- user ${user.email} Login! ---`)
    );

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.get("/logout", AuthController.validateAuth, async (req, res, next) => {
  try {
    const header = req.get("authorization");
    if (!header) {
      return res
        .status(401)
        .json({ message: "E nevoie de autentificare pentru aceasta ruta." });
    }

    const token = header.split(" ")[1];
    const payload = AuthController.getPayloadFromJWT(token);

    if (!payload) {
      console.log("Invalid token payload");
      return res.status(401).json({ message: "Invalid token." });
    }

    const filter = { _id: payload.userId };
    const user = await User.findOne(filter);

    if (!user) {
      console.log("User not found:", filter);
      return res.status(401).json({ message: "Not authorized" });
    }

    console.log(
      colors.bgYellow.italic.bold(`--- user ${user.email} Logout! ---`)
    );

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/current", AuthController.validateAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    console.log(colors.bgYellow.italic.bold("--- Current user data: ---"));
    console.log("email:", user.email);
    console.log("subscription:", user.subscription);
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:userId", AuthController.validateAuth, async (req, res) => {
  try {
    const userIdFromToken = req.user._id.toString();

    const userIdFromRequest = req.params.userId;

    if (userIdFromToken !== userIdFromRequest) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { subscription } = req.body;
    const validSubscriptions = ["starter", "pro", "business"];
    if (!validSubscriptions.includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    const updatedUser = await UserController.updateSubscription(
      userIdFromRequest,
      subscription
    );

    res.status(200).json({
      message: "Subscription updated successfully!",
      user: updatedUser,
    });
    console.log(
      colors.bgYellow.italic.bold(
        `--- Subscription ${subscription} updated successfully! ---`
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
