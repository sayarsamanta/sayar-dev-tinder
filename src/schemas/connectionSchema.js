const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      refs: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "interested", "rejected", "accepted", "ignored"],
      default: "pending",
    },
  },
  { timestamps: true }
);

//need to add pre save hook to check if fromUserId and toUserId are same then we should not allow to create connection need to add all different validation in pre save hook instead of doing in route handler because if we do in route handler then we can bypass the validation by directly calling the save method on connection instance but if we do in pre save hook then we can ensure that validation is always executed before saving the connection instance
connectionSchema.pre("save", async function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("Cannot connect to self");
  }
});

const Connection = mongoose.model("Connection", connectionSchema);
module.exports = Connection;
