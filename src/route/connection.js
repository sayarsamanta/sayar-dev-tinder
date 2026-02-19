const express = require("express");
const jwt = require("jsonwebtoken");
const { userAuthentication } = require("../middleware/auth");
const connectionRouter = express.Router();
const Connection = require("../schemas/connectionSchema");
const User = require("../schemas/user");
const { default: mongoose } = require("mongoose");
connectionRouter.post(
  "/connect/:status/:toUserId",
  userAuthentication,
  async (req, res) => {
    try {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, "SAYAR@123");
      const { userId } = decoded;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      //need to validate status and toUserId
      const allowedStatus = ["pending", "interested", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid status");
      }

      const user = await User.findById(toUserId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      const existingConnection = await mongoose.model("Connection").findOne({
        $or: [
          { fromUserId: this.fromUserId, toUserId: this.toUserId },
          { fromUserId: this.toUserId, toUserId: this.fromUserId },
        ],
      });

      if (existingConnection) {
        throw new Error("Connection already exists");
      }

      const connectionObj = {
        fromUserId: userId,
        toUserId,
        status,
      };
      const connectionInstance = new Connection(connectionObj);
      await connectionInstance.save();
      //need to send dynamic message based on status
      let message = "";
      if (status === "pending") {
        message = "Connection request sent successfully";
      } else if (status === "interested") {
        message = "You are now connected with the user";
      } else if (status === "rejected") {
        message = "Connection request rejected successfully";
      }
      res.status(200).send(message);
    } catch (err) {
      res.status(400).send("Error connecting users" + err.message);
    }
    //connect to user
  }
);

connectionRouter.post(
  "/request/review/:status/:connectionId",
  userAuthentication,
  async (req, res) => {
    try {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, "SAYAR@123");
      const { userId } = decoded;
      const connectionId = req.params.connectionId;
      const status = req.params.status;
      //need to validate status and connectionId
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid status");
      }
      const connection = await Connection.findOne({
        _id: connectionId,
        status: "interested",
        toUserId: userId,
      });
      if (!connection) {
        return res.status(404).send("Connection not found");
      }

      //only toUserId can review the connection request
      if (!connection.toUserId.equals(userId)) {
        return res
          .status(403)
          .send("You are not authorized to review this connection request");
      }

      //need to validate that connection request is in pending state only then we can review the request
      if (connection.status !== "pending") {
        return res
          .status(400)
          .send("Only pending connection requests can be reviewed");
      }

      connection.status = status;
      await connection.save();
      res.status(200).send("Connection request reviewed successfully");
    } catch (err) {
      res.status(400).send("Error reviewing connection" + err.message);
    }
  }
);

module.exports = connectionRouter;
