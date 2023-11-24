var express = require("express");
var app = express();
var bodyParse = require("body-parser");
var cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const { hash, compare } = require("bcryptjs");

app.use(cors());
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
app.set("view engine", "ejs");
// app.set('views', './views');
app.use(express.static("./public"));
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "thitracnghiemOmatech",
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 10 * 60 * 1000 * 100,
    },
  })
);
//Kết nối cơ sở dư liêu vào
const uri = "mongodb://127.0.0.1/tracnghiemOmatech";

mongoose.connect(uri, { useNewUrlParser: true });
const USER_ROUTER = require("../nhom22_tracnghiemapi/routing/user.routing");
const EXAM_ROUTER = require("../nhom22_tracnghiemapi/routing/exam.routing");
const QUESTION_ROUTER = require("../nhom22_tracnghiemapi/routing/question.routing");
const RESULT_ROUTER = require("../nhom22_tracnghiemapi/routing/result.routing");
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", USER_ROUTER);
app.use("/exam", EXAM_ROUTER);
app.use("/question", QUESTION_ROUTER);
app.use("/result", RESULT_ROUTER);
async function hashPassword() {}
hashPassword();
const PORT = process.env.PORT || 8000;

mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
});
