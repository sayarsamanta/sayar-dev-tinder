const express = require("express");
const jwt = require("jsonwebtoken");
const { userAuthentication } = require("../middleware/auth");
const Connection = require("../schemas/connectionSchema");
const getRequestRouter = express.Router();

getRequestRouter.get(
  "/requests/received",
  userAuthentication,
  async (req, res) => {
    try {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, "SAYAR@123");
      const { userId } = decoded;
      const connections = await Connection.find({
        toUserId: userId,
        status: "interested",
      }).populate("fromUserId", "firstName lastName skills about");
      if (connections.length === 0) {
        return res
          .status(200)
          .json({ message: "No connection requests received" });
      }
      res.status(200).json(connections);
    } catch (err) {
      res.status(400).send("Error fetching requests" + err.message);
    }
  }
);

getRequestRouter.get(
  "/request/connections",
  userAuthentication,
  async (req, res) => {
    try {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, "SAYAR@123");
      const { userId } = decoded;
      const connections = await Connection.find({
        $or: [{ fromUserId: userId }, { toUserId: userId }],
      })
        .populate("fromUserId", "firstName lastName skills about")
        .populate("toUserId", "firstName lastName skills about");
      if (connections.length === 0) {
        return res.status(200).json({ message: "No connections found" });
      }
      res.status(200).json(connections);
    } catch (err) {
      res.status(400).send("Error fetching connections" + err.message);
    }
  }
);

module.exports = getRequestRouter;
