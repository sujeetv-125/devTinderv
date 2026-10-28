const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/users");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("db connected");
    app.listen(7777, () => {
      console.log("server is successfully listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });

//order is imp

//ab?c means b is optional
//ab+c means you can include as much b as you want
//ab*cd means you can give anything in between ab and cd