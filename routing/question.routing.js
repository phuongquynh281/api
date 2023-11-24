const route = require("express").Router();
const QUESTION_MODEL = require("../models/question.model");
const { verify } = require("../utils/jwt");

route.post("/add-question", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  try {
    let { nameQuestion, answers, level, career } = req.body;
    let infoQuestion;
    infoQuestion = await QUESTION_MODEL.insert({
      nameQuestion,
      answers,
      level,
      career,
    });
    return res.json(infoQuestion);
  } catch (error) {
    res.json(error.message);
  }
});

route.get("/list-question", async (req, res) => {
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

    const totalItems = await QUESTION_MODEL.getCount();

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = parseInt(page);
    const itemCount =
      currentPage < totalPages
        ? parseInt(pageSize)
        : totalItems - parseInt(pageSize) * (totalPages - 1);

    // Lấy danh sách kết quả với phân trang
    const infoResultDb = await QUESTION_MODEL.getList({
      level,
      career,
      page,
      pageSize,
    });

    if (infoResultDb.error) {
      return res.json({ success: false, message: infoResultDb.message });
    }

    // Bao gồm thông tin phân trang trong kết quả trả về
    return res.json({
      success: true,
      data: infoResultDb.data,
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

route.get("/info-question/:questionID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  try {
    let { questionID } = req.params;

    let infoQuestion = await QUESTION_MODEL.getInfo({ questionID });

    return res.json(infoQuestion);
  } catch (error) {
    res.json(error.message);
  }
});

route.patch("/update-question/:questionID", async (req, res) => {
  try {
    let { questionID } = req.params;

    let { nameQuestion, answers, level, career } = req.body;

    let resultUpdate = await QUESTION_MODEL.update({
      questionID,
      nameQuestion,
      answers,
      level,
      career,
    });

    res.json(resultUpdate);
  } catch (error) {
    res.json(error.message);
  }
});

route.delete("/remove-question/:questionID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  try {
    let { questionID } = req.params;

    let resultRemove = await QUESTION_MODEL.remove({ questionID });
    res.json(resultRemove);
  } catch (error) {
    res.json(error.message);
  }
});

module.exports = route;
