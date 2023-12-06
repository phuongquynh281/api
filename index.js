var express = require("express");
var app = express();
var bodyParse = require("body-parser");
var cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const { hash, compare } = require("bcryptjs");
const swaggerUi = require('swagger-ui-express');

var options = {
  swaggerOptions: {
    url: 'http://localhost:8000/exam'
  }
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, options));
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
const uri = "mongodb://127.0.0.1/tracnghiem";

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
const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Không được phép truy cập' });
  }

  try {
    const decoded = await jwtUtils.verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Cấm truy cập' });
  }
};

app.get('/accept-token', authenticateToken, (req, res) => {
  res.json({ message: 'Accept token', user: req.user });
});

mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`));
});
