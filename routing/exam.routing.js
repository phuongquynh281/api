const route = require("express").Router();
const USER_MODEL = require("../database/user-coll");
const EXAM_MODEL = require("../models/exam.model");
const { verify } = require("../utils/jwt");

// const USER_MODEL = require("../models/users.model");
// const fs = require("fs");
// const path = require("path");

// //Danh sách bộ đề
// route.get("/", async (req, res) => {
//   const authorizationHeader = req.headers["authorization"];
//   const token = authorizationHeader.substring(7);
//   const user = await verify(token);
//   if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
//     res.json({ success: false, message: "Không được phép" });
//   }
//   let { examID } = req.query;
//   let userID = req.session.user._id;
//   let infoExam = await EXAM_MODEL.getInfo({ examID, userID });
//   return res.json(infoExam);
// });

route.post("/add-exam", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let { name, description, levelDifficult, timeDoTest } = req.body;

  const resultInsert = await EXAM_MODEL.insert({
    name,
    description,
    levelDifficult,
    timeDoTest,
    createAt: Date.now(),
  });

  return res.json(resultInsert);
});

//Danh sách bộ đề
route.get("/list-exam", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let listExam = await EXAM_MODEL.getList();
  return res.json(listExam);
});

route.patch("/:examID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let { examID } = req.params;
  let { name, description, levelDifficult, timeDoTest } = req.body;

  const resultUpdate = await EXAM_MODEL.update({
    name,
    description,
    levelDifficult,
    timeDoTest,
    examID,
    createAt: Date.now(),
  });

  return res.json(resultUpdate);
});

route.get("/info/:examID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let { examID } = req.params;

  // Kiểm tra quyền/check về logic (nếu có)

  let infoExam = await EXAM_MODEL.getInfo({ examID });
  return res.json(infoExam);
});

// route.get("/remove-exam/:examID", ROLE_ADMIN, async (req, res) => {
//   let { examID } = req.params;
//   let resultRemove = await EXAM_MODEL.remove({ examID });

//   let pathOrigin = path.resolve(
//     __dirname,
//     `../../public/storage/images/${resultRemove.data.file}`
//   );

//   fs.unlink(pathOrigin, function (err) {
//     if (err) return console.log(err);
//     console.log("file deleted successfully");
//   });

//   res.json(resultRemove);
// });

// route.post("/save-exam", checkActive, async (req, res) => {
//   let { examID } = req.body;
//   let userID = req.session.user._id;

//   let examBySave = await EXAM_MODEL.saveExam({ examID, userID });
//   res.json(examBySave);
// });

// route.post("/cancle-save-exam", checkActive, async (req, res) => {
//   let { examID } = req.body;
//   let userID = req.session.user._id;
//   let cancelSaveExam = await EXAM_MODEL.cancelSaveExam({ examID, userID });
//   res.json(cancelSaveExam);
// });

module.exports = route;
