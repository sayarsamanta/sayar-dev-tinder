require("dotenv").config();
const express = require("express");
var cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const main = require("./database/config");
app.use(express.json());
app.use(cookieParser());
// Adds headers: Access-Control-Allow-Origin: *

const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, local dev)
      if (!origin) return callback(null, true);

      // Allow localhost ports automatically
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(require("./route/auth"));
app.use(require("./route/user"));
app.use(require("./route/connection"));
app.use(require("./route/getRequests"));

main()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  })
  .catch((err) => console.log(err));
