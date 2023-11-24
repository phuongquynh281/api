const route = require("express").Router();
const USER_MODEL = require("../models/users.model");
const EXAM_MODEL = require("../models/exam.model");
const RESULT_MODEL = require("../models/result");
const USER_COLL = require("../database/user-coll");
const { verify } = require("../utils/jwt");
const { updateInfoUserBasic } = require("../models/users.model");
const { ObjectID } = require("mongodb"); // Import ObjectID from mongodb

route.get("/me", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  const myProfile = await USER_MODEL.getInfo(user.data._id);
  return res.json(myProfile);
});

// Tạo tk cho ứng viên(role: default là interviewee)
route.post("/create", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let { username, fullName, gender } = req.body;
  try {
    let infoUser = await USER_MODEL.createUser(username, fullName, gender);
    if (infoUser.error) {
      return res.status(400).json(infoUser); // Trả về lỗi với mã trạng thái 400 Bad Request
    }
    return res.status(200).json(infoUser.data); // Trả về thành công với mã trạng thái 200 OK
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message }); // Xử lý lỗi nội bộ với mã trạng thái 500 Internal Server Error
  }
});

route.post("/employee/create", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let { username, fullName, gender, role } = req.body;
  try {
    let infoUser = await USER_MODEL.createEmployee(
      username,
      fullName,
      gender,
      role
    );
    if (infoUser.error) {
      return res.status(400).json(infoUser); // Trả về lỗi với mã trạng thái 400 Bad Request
    }
    return res.status(200).json(infoUser.data); // Trả về thành công với mã trạng thái 200 OK
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message }); // Xử lý lỗi nội bộ với mã trạng thái 500 Internal Server Error
  }
});

// Xem thông tin của user
route.get("/:userID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  const { userID } = req.params;

  if (
    user.data.role !== "SuperAdmin" &&
    user.data.role !== "Interviewer" &&
    user.data.role !== "HRM"
  ) {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  const infoUserDb = await USER_MODEL.getInfo(userID);
  if (!infoUserDb) {
    res.json({ success: false, message: "Không tìm thấy thông tin user" });
  }
  return res.json(infoUserDb);
});

route.get("/list/interviewee", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  const { userID } = req.params;

  if (
    user.data.role !== "SuperAdmin" &&
    user.data.role !== "Interviewer" &&
    user.data.role !== "HRM"
  ) {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  const infoUserDb = await USER_MODEL.getListInterviewee(userID);
  if (!infoUserDb) {
    res.json({ success: false, message: "Không tìm thấy danh sách ứng viên" });
  }
  return res.json(infoUserDb);
});

route.get("/list/info/employee", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  const { userID } = req.params;

  if (user.data.role !== "SuperAdmin") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  const infoUserDb = await USER_MODEL.getListEmployee(userID);
  if (!infoUserDb) {
    res.json({ success: false, message: "Không tìm thấy danh sách nhân viên" });
  }
  return res.json(infoUserDb);
});

// Cập nhật thông tin
route.patch("/:userID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  try {
    const { userID } = req.params;
    const { fullName, gender, birthDay, phone, address } = req.body;
    const result = await updateInfoUserBasic({
      userID,
      fullName,
      gender,
      birthDay,
      phone,
      address,
    });

    if (result.error) {
      return res.status(400).json({ error: true, message: result.message });
    }
    return res.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Có lỗi trong quá trình xử lý yêu cầu" });
  }
});
// Cập nhật thông tin nhân viên (Chỉ SuperAdmin mới đc quyền)
route.patch("/employee/:userID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin") {
    res.json({ success: false, message: "Không được phép" });
  }
  try {
    const { userID } = req.params;
    const { fullName, gender, birthDay, phone, address, role } = req.body;
    const result = await USER_MODEL.updateEmployee({
      userID,
      fullName,
      gender,
      birthDay,
      phone,
      address,
      role,
    });

    if (result.error) {
      return res.status(400).json({ error: true, message: result.message });
    }
    return res.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Có lỗi trong quá trình xử lý yêu cầu" });
  }
});

//TRANG ĐĂNG NHẬP
route.post("/login", async (req, res) => {
  //req.session.isLogin = true;
  let { username, password } = req.body;
  let infoUser = await USER_MODEL.signIn(username, password);

  if (!infoUser.error) {
    req.session.token = infoUser.data.token;
    req.session.username = req.body.username;
    req.session.user = infoUser.data.infoUser;
    req.user = infoUser.data.infoUser;
  }

  return res.json(infoUser);
  //renderToView(req, res, 'pages/dashboard-admin', { infoUser: infoUser.data })
});

//Đổi mat khau
route.post("/change-password", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (
    user.data.role !== "SuperAdmin" &&
    user.data.role !== "Interviewer" &&
    user.data.role !== "HRM"
  ) {
    res.json({ success: false, message: "Không được phép" });
  }
  let { passwordOld, passwordNew, userID } = req.body;
  let infoUser = await USER_MODEL.changePassword({
    userID,
    passwordOld,
    passwordNew,
  });

  if (infoUser.error) return res.json(infoUser);

  return res.json(infoUser);
});

//ĐĂNG XUẤT
route.get("/logout", async (req, res) => {
  req.session.token = undefined;
  return res.redirect("/");
});

route.get("/exam/:examID", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "Interviewee") {
    res.json({ success: false, message: "Không được phép" }); // Check quyền của người đang đăng nhập
    return;
  }

  try {
    const { examID } = req.params;

    // Tìm bài kiểm tra trong cơ sở dữ liệu
    const exam = await EXAM_MODEL.findById(examID);

    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài kiểm tra" });
    }

    // Kiểm tra xem bài kiểm tra đã được bắt đầu chưa
    if (exam.timeDoTest <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Thời gian kiểm tra không hợp lệ" });
    }

    // Đặt thời gian đếm ngược bằng thời gian thi
    exam.timeRemaining = exam.timeDoTest * 60; // chuyển đổi thành giây

    await exam.save();

    // Trả về kết quả thành công
    return res.json({
      success: true,
      message: "Bài kiểm tra đã bắt đầu",
      timeRemaining: exam.timeRemaining,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Xem kết quả thi
route.get("/exam/thi/thitn/result", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (
    user.data.role !== "SuperAdmin" &&
    user.data.role !== "Interviewer" &&
    user.data.role !== "HRM" &&
    user.data.role !== "Interviewee"
  ) {
    res.json({ success: false, message: "Không được phép" });
    return;
  }
  let { resultID } = req.query;
  let { examID } = req.query;
  let infoResult = await RESULT_MODEL.getInfo({ resultID });
  let infoExam = await EXAM_MODEL.getInfo({ examID });
  return res.json(infoResult.data);
  // return res.json(infoExam.data)
});

// Lấy kết quả
route.post("/exam/result", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "Interviewee") {
    res.json({ success: false, message: "Không được phép" });
    return;
  }
  const userID = user.data._id;

  let { point, falseArr, trueArr, examID, unfinishQuestion } = req.body;
  console.log(req.body);

  let resultInsert = await RESULT_MODEL.insert({
    point,
    falseArr,
    trueArr,
    examID,
    unfinishQuestion,
    createAt: Date.now(),
    userID,
  });
  return res.json(resultInsert);
});

route.get("/exam/of/me", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);

  if (user.data.role !== "Interviewee") {
    res.json({ success: false, message: "Không được phép" });
    return;
  }

  try {
    const userID = user.data._id;
    const userWithExam = await USER_COLL.findById(userID).populate({
      path: "exam",
      populate: { path: "questions" },
    });
    if (!userWithExam.exam) {
      return res
        .status(404)
        .json({ success: false, message: "No exam assigned to the candidate" });
    }

    return res.json({ success: true, assignedExam: userWithExam.exam });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = route;
