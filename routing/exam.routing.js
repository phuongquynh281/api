const route = require("express").Router();
const USER_MODEL = require("../database/user-coll");
const EXAM_MODEL = require("../models/exam.model");
const QUESTION_MODEL = require("../models/question.model");
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
  let { name, description, level, timeDoTest } = req.body;

  const resultInsert = await EXAM_MODEL.insert({
    name,
    description,
    level,
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
    return res.json({ success: false, message: "Không được phép" });
  }

  const level = req.query.level;

  try {
    let listExam;

    if (level) {
      listExam = await EXAM_MODEL.getList(level);
    } else {
      listExam = await EXAM_MODEL.getList();
    }

    return res.json(listExam);
  } catch (error) {
    return res.json(error.message);
  }
});

route.patch("/:examID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let { examID } = req.params;
  let { name, description, level, timeDoTest } = req.body;

  const resultUpdate = await EXAM_MODEL.update({
    name,
    description,
    level,
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
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  try {
    const { examID } = req.params; // Lấy examID từ URL

    // Lấy thông tin về bộ đề theo examID
    // const exam = await EXAM_MODEL.getExamById(examID);

    // if (!exam || !exam.data) {
    //   return res.json({ success: false, message: "Bộ đề không tồn tại" });
    // }

    // const { level } = exam.data;

    // // Lấy danh sách câu hỏi theo mức độ khó
    // const questions = await QUESTION_MODEL.getList(level);

    // if (!questions || !questions.data) {
    //   return res.json({
    //     success: false,
    //     message: "Không tìm thấy câu hỏi với mức độ khó này",
    //   });
    // }

    const { questionIDs } = req.body; // Lấy danh sách questionIDs từ body

    // Lọc danh sách câu hỏi dựa trên questionIDs và levelDifficulty của bộ đề
    // const filteredQuestionIDs = questionIDs.filter((id) =>
    //   questions.data.some((question) => question._id.toString() === id)
    // );

    // Gọi hàm để thêm danh sách câu hỏi vào bộ đề
    const result = await EXAM_MODEL.addQuestionsToExam(
      examID,
      questionIDs
    );

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

    const result = await EXAM_MODEL.removeQuestionsFromExam(
      examID,
      questionIDs
    );

    res.json(result);
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

route.post("/shuffle-questions/:examID", async (req, res) => {
  try {
    const { examID } = req.params; // Lấy examID từ URL

    // Lấy danh sách câu hỏi từ bộ đề (hoặc tùy theo cách bạn lưu trữ dữ liệu)
    const exam = await EXAM_MODEL.findById(examID).populate("questions"); // Thay thế ExamModel và populate bằng cách sử dụng mã của bạn

    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Bộ đề không tồn tại" });
    }

    // Lấy danh sách câu hỏi từ bộ đề
    const questions = exam.questions;

    // Xáo trộn thứ tự của danh sách câu hỏi
    questions.sort(() => Math.random() - 0.5);

    // Lưu danh sách câu hỏi đã được xáo trộn (hoặc cập nhật bộ đề với danh sách mới)
    exam.questions = questions;
    await exam.save(); // Lưu thay đổi

    return res.json({
      success: true,
      message: "Thứ tự câu hỏi đã được xáo trộn",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

route.post("/auto/create", async (req, res) => {
  try {
    const { numberOfQuestions, level } = req.body; // Lấy số câu hỏi và mức độ từ body của yêu cầu

    // Tạo bộ đề mới
    const newExam = new EXAM_MODEL({
      level: level,
      // Các trường khác của bộ đề
    });

    // Lấy danh sách câu hỏi từ ngân hàng câu hỏi theo mức độ
    const questions = await QUESTION_MODEL.find({ level: level });

    if (questions.length < numberOfQuestions) {
      return res
        .status(400)
        .json({ success: false, message: "Không đủ câu hỏi trong ngân hàng" });
    }

    // Xáo trộn thứ tự câu hỏi
    questions.sort(() => Math.random() - 0.5);

    // Lấy số lượng câu hỏi theo numberOfQuestions
    const selectedQuestions = questions.slice(0, numberOfQuestions);

    // Gán danh sách câu hỏi vào bộ đề
    newExam.questions = selectedQuestions;

    // Lưu bộ đề mới
    await newExam.save();

    return res.json({ success: true, message: "Bộ đề đã được tạo tự động" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

route.post("/assign-exam/:examID/:candidateID", async (req, res) => {
  try {
    const { examID, candidateID } = req.params;

    // Kiểm tra tính hợp lệ của examID và candidateID(ứng viên)
    // if (!ObjectID.isValid(examID) || !ObjectID.isValid(candidateID)) {
    //   return res.status(400).json({ success: false, message: 'bộ đề hoặc ứng viên không hợp lệ' });
    // }

    // Tìm bộ đề trong cơ sở dữ liệu
    const exam = await EXAM_MODEL.findById(examID);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ đề' });
    }

    // Tìm ứng viên trong cơ sở dữ liệu
    const candidate = await USER_MODEL.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ứng viên' });
    }

    // Gán bộ đề cho ứng viên
    candidate.exam = exam;

    // Lưu thông tin đã cập nhật của ứng viên
    await candidate.save();

    return res.json({ success: true, message: 'Bộ đề đã được gán cho ứng viên' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});



module.exports = route;
