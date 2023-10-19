const route = require("express").Router();
const USER_MODEL = require("../database/user-coll");
const EXAM_MODEL = require("../models/exam.model");
const { verify } = require("../utils/jwt");

// const USER_MODEL = require("../models/users.model");
// const fs = require("fs");
// const path = require("path");

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

route.delete("/remove-exam/:examID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let resultRemove = await EXAM_MODEL.remove({ examID });
  res.json(resultRemove);
});

route.post("/add-questions-to-exam/:examID", async (req, res) => {
  try {
    const { examID } = req.params; // Lấy examID từ URL
    const { questionIDs } = req.body; // Lấy danh sách questionIDs từ body

    // Gọi hàm để thêm danh sách câu hỏi vào bộ đề
    const result = await EXAM_MODEL.addQuestionsToExam(examID, questionIDs);

    res.json(result);
  } catch (error) {
    res.json(error.message);
  }
});

route.delete("/remove-questions/:examID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
    return;
  }

  try {
    const { examID } = req.params;
    const { questionIDs } = req.body; // Mảng questionIDs cần xóa

    const result = await EXAM_MODEL.removeQuestionsFromExam(examID, questionIDs);

    res.json(result);
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

module.exports = route;
