const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ExamSchema = new Schema({
  name: String,

  description: String,

  //Người tạo
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  //Người cập nhật
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "question",
    },
  ],

  //Thời gian đếm ngược
  timeDoTest: Number,

  //Độ khó---- 0: Dễ || 1: Vừa || 2: Khó
  level: {
    type: Number,
    default: 0,
  },

  result: [
    {
      type: Schema.Types.ObjectId,
      ref: "result",
      default: [],
    },
  ],

  createAt: { type: Date, required: true, default: Date.now },
});

const EXAM_MODEL = mongoose.model("exam", ExamSchema);
module.exports = EXAM_MODEL;
