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
  let { name, description, level, timeDoTest, career } = req.body;

  const resultInsert = await EXAM_MODEL.insert({
    name,
    description,
    level,
    career,
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
  try {
    const user = await verify(token);

    if (user.data.role !== "SuperAdmin") {
      return res.json({ success: false, message: "Không được phép" });
    }

    const { level, career, page, pageSize } = req.query;

    const totalItems = await EXAM_MODEL.getCount();

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = parseInt(page);
    const itemCount =
      currentPage < totalPages
        ? parseInt(pageSize)
        : totalItems - parseInt(pageSize) * (totalPages - 1);

    const examData = await EXAM_MODEL.getList({
      level,
      career,
      page,
      pageSize,
    });
    if (examData.error) {
      return res.json({ success: false, message: examData.message });
    }

    // Bao gồm thông tin phân trang trong kết quả trả về
    return res.json({
      success: true,
      data: examData,
      totalItems: totalItems,
      pagination: {
        totalItems,
        itemCount,
        itemsPerPage: parseInt(pageSize),
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
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
  let { name, description, level, timeDoTest, career } = req.body;

  const resultUpdate = await EXAM_MODEL.update({
    name,
    description,
    level,
    timeDoTest,
    examID,
    career,
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
  const { examID } = req.params
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
    const { questionIDs } = req.body; // Lấy danh sách questionIDs từ body
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
    const exam = await EXAM_MODEL.findById(examID).populate("questions"); // Thay thế ExamModel và populate bằng cách sử dụng mã 

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
    const { numberOfQuestions, level, career, name } = req.body; // Lấy số câu hỏi và mức độ từ body của yêu cầu

    // Tạo bộ đề mới
    const newExam = new EXAM_MODEL({
      level: level,
      career: career,
      name: name,
    });

    // Lấy danh sách câu hỏi từ ngân hàng câu hỏi theo mức độ
    const questions = await QUESTION_MODEL.find({
      level: level,
      // career: career,
    });

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

    // Tìm bộ đề trong cơ sở dữ liệu
    const exam = await EXAM_MODEL.findById(examID);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bộ đề" });
    }

    // Tìm ứng viên trong cơ sở dữ liệu
    const candidate = await USER_MODEL.findById(candidateID);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy ứng viên" });
    }

    // Gán bộ đề cho ứng viên
    candidate.exam = exam;

    // Lưu thông tin đã cập nhật của ứng viên
    await candidate.save();

    return res.json({
      success: true,
      message: "Bộ đề đã được gán cho ứng viên",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = route;
