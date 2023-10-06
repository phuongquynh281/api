const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: String,

  username: String,

  password: String,

  role: {
    type: String,
    enum: ["Interviewee", "Interviewer", "HRM", "SuperAdmin"],
    default: "Interviewee",
  },

  //Số điện thoại
  phone: String,

  //Ngày sinh
  birthDay: Date,

  //Địa chỉ
  address: String,

  /**
   * 0.Nam
   * 1.Nữ
   */
  //Giới tính
  gender: { type: Number, default: 0 },

  // Trạng thái 0: chưa thi/Không thi, 1: đã thi

  status: { type: Number, default: 0 },

  //Người tạo
  author: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  //Người cập nhật
  userUpdate: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  //Ngày tạo
  createAt: { type: Date, default: Date.now() },

  //Ngày cập nhật
  updateAt: { type: Date, default: Date.now() },

  // Ngày xóa
  deleteAt: { type: Date, default: Date.now() },
});

const USER_MODEL = mongoose.model("user", userSchema);
module.exports = USER_MODEL;
