const route = require("express").Router();
const USER_MODEL = require("../models/users.model");
const { verify } = require("../utils/jwt");
const { updateInfoUserBasic } = require("../models/users.model");

route.get("/me", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  const myProfile = await USER_MODEL.getInfo(user.data._id);
  return res.json(myProfile);
});

route.post("/create", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.substring(7);
  const user = await verify(token);
  if (user.data.role !== "SuperAdmin" && user.data.role !== "Interviewer") {
    res.json({ success: false, message: "Không được phép" }); //Check quyền của người đang đăng nhập
  }
  let { username, password, fullName, gender, role } = req.body;
  let infoUser = await USER_MODEL.createUser(
    username,
    password,
    fullName,
    gender,
    role
  );
  res.json(infoUser);
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

route.get("/list/info", async (req, res) => {
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
  const infoUserDb = await USER_MODEL.getList(userID);
  if (!infoUserDb) {
    res.json({ success: false, message: "Không tìm thấy thông tin user" });
  }
  return res.json(infoUserDb);
});
// Cập nhật thông tin
route.patch("/:userID", async (req, res) => {
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

module.exports = route;
