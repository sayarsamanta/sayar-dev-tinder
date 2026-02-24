const express = require("express");
const User = require("../schemas/user");
const bcrypt = require("bcrypt");
const useValidation = require("../utils/validation");
const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  //login user
  const { email, password } = req.body;
  try {
    const users = await User.findOne({ email });
    if (!users) {
      return res.status(404).send("User not found");
    }
    const match = await users.validatePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    } else {
      const getJWTToken = users.getJWTToken(users._id);
      res.cookie("token", getJWTToken, { httpOnly: true });
      return res.status(200).json({ data: users, message: "Login successful" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/signup", async (req, res) => {
  //creating user
  const { firstName, lastName, email, password, age, gender } = req.body;

  try {
    useValidation(req);
    const userObj = {
      firstName,
      lastName,
      email,
      age,
      gender,
      password: await bcrypt.hash(password, 10),
    };
    const user = new User(userObj);
    const userDetails = await user.save();
    if (!userDetails) {
      return res.status(400).send("Error creating user");
    } else {
      const getJWTToken = user.getJWTToken(user._id);
      res.cookie("token", getJWTToken, { httpOnly: true });
      res.status(201).send("User created successfully");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).send("Logout successful");
});

module.exports = authRouter;
