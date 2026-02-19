const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isStrongPassword } = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: (value) => {
        if (!isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate: (value) => {
        if (!isStrongPassword(value)) {
          throw new Error(
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol"
          );
        }
      },
    },
    age: {
      type: Number,
    },
    skills: {
      type: [String],
    },
    photoURL: {
      type: String,
    },
    gender: {
      type: String,
      validate: (value) => {
        if (!["male", "female"].includes(value)) {
          throw new Error("Gender is not valid");
        }
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWTToken = function (userId) {
  var token = jwt.sign({ userId: userId }, "SAYAR@123", {
    algorithm: "HS256",
    expiresIn: "7d",
  });
  if (!token) {
    throw new Error("Error generating token");
  }

  return token;
};

userSchema.methods.validatePassword = async function (password) {
  const match = await bcrypt.compare(password, this.password);

  return match;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
