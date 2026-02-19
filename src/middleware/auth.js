const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
const userAuthentication = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, "SAYAR@123");
    const { userId } = decoded;
    const users = await User.findById(userId);
    if (!users) {
      return res.status(404).send("User not found");
    }
    next();
  } catch (err) {
    res.status(401).send(err.message);
  }
};

module.exports = { userAuthentication };
