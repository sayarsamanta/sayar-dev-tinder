require("dotenv").config();
const express = require("express");
var cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const main = require("./database/config");
app.use(express.json());
app.use(cookieParser());
// Adds headers: Access-Control-Allow-Origin: *
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(require("./route/auth"));
app.use(require("./route/user"));
app.use(require("./route/connection"));
app.use(require("./route/getRequests"));

main()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => console.log(err));
