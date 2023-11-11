const route = require("express").Router();
const { verify } = require("../utils/jwt");
const RESULT_MODEL = require("../models/result");

route.get("/list-result", async (req, res) => {
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
    const infoResultDb = await RESULT_MODEL.getList();
    if (!infoResultDb) {
      res.json({ success: false, message: "Không tìm thấy danh sách kết quả" });
    }
    return res.json(infoResultDb);
  });
module.exports = route;
