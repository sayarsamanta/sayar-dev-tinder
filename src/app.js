const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const main = require("./database/config");
app.use(express.json());
app.use(cookieParser());

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
