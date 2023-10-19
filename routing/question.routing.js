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
    let { nameQuestion, answers, level } = req.body;
    let infoQuestion;
    infoQuestion = await QUESTION_MODEL.insert({
      nameQuestion,
      answers,
      level,
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
  if (user.data.role !== "SuperAdmin") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  try {
    let listQuestion = await QUESTION_MODEL.getList();
    return res.json(listQuestion);
  } catch (error) {
    res.json(error.message);
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

    let { nameQuestion, answers, level } = req.body;

    let resultUpdate = await QUESTION_MODEL.update({
      questionID,
      nameQuestion,
      answers,
      level,
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
