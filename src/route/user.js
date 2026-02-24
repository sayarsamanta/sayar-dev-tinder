const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { isStrongPassword } = require("validator");
const userRouter = express.Router();
const userAuthentication = require("../middleware/auth").userAuthentication;
const User = require("../schemas/user");
const Connection = require("../schemas/connectionSchema");

//find all user
userRouter.get("/user/all", userAuthentication, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

//find specific user
userRouter.get("/user", userAuthentication, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, "SAYAR@123");
    const { userId } = decoded;
    const users = await User.findById(userId);
    res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).send("Error fetching user" + err.message);
  }
});

//updating a user
userRouter.patch("/user/edit/:id", userAuthentication, async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  try {
    const allowedField = [
      "firstName",
      "lastName",
      "skills",
      "about",
      "age",
      "photoURL",
      "gender",
    ];
    const isValidOperation = Object.keys(updateData).every((field) =>
      allowedField.includes(field)
    );
    if (!isValidOperation) {
      return res.status(400).send("Invalid updates");
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(400).send("Error updating user");
  }
});

//deleting user
userRouter.delete("/user", userAuthentication, async (req, res) => {
  try {
    const userId = req.body._id;

    const deleted = await User.findByIdAndDelete({ _id: userId });
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

userRouter.patch(
  "/user/updatePassword/:id",
  userAuthentication,
  async (req, res) => {
    try {
      const userId = req.params.id; // from auth middleware
      const { oldPassword, newPassword } = req.body;

      // 1️⃣ Basic validation
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "All fields required" });
      }

      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ message: "Weak password" });
      }

      if (oldPassword === newPassword) {
        return res
          .status(400)
          .json({ message: "New password must differ from old" });
      }

      // 2️⃣ Fetch user
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // 3️⃣ Verify old password
      const isMatch = await user.validatePassword(oldPassword);

      if (!isMatch) {
        return res.status(401).json({ message: "Old password incorrect" });
      }

      // 4️⃣ Hash new password
      const hashed = await bcrypt.hash(newPassword, 12);

      // 5️⃣ Save
      user.password = hashed;
      const getJWTToken = user.getJWTToken(user._id);
      res.cookie("token", getJWTToken, { httpOnly: true });
      await user.save();

      res.json({ message: "Password updated successfully", data: user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

userRouter.get("/user/feed", userAuthentication, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, "SAYAR@123");
    const { userId } = decoded;
    const { search = "" } = req.query;

    // Step 1: Find users already interacted with
    const connections = await Connection.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    }).select("fromUserId toUserId");
    const excludedIds = connections.map((c) =>
      c.fromUserId.equals(userId) ? c.toUserId : c.fromUserId
    );

    excludedIds.push(userId);

    // Step 2: Build search filter
    const searchFilter =
      search.trim() !== ""
        ? {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { skills: { $elemMatch: { $regex: search, $options: "i" } } },
              { about: { $regex: search, $options: "i" } },
            ],
          }
        : {};

    // Step 3: Fetch users
    const users = await User.find({
      _id: { $nin: excludedIds },
      ...searchFilter,
    }).limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feed" });
  }
});

module.exports = userRouter;
