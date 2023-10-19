const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  /**
   * Tên
   */
  name: String,

  /**
   * Cau tra loi
   */
  answers: [
    {
      option: String, // Văn bản lựa chọn (ví dụ: A, B, C, D)
      isCorrect: Boolean, //  boolean để chỉ ra liệu nó có phải là câu trả lời đúng không
    },
  ],
    //Mức độ---- 0: Junior || 1: Senior || 2: Leader || 3: Mid-level Manager || 4: Senior Leader
  level: {
    type: Number,
    default: 0,
  },

  /**
   * Bo de
   */
  exam: {
    type: Schema.Types.ObjectId,
    ref: "exam",
  },

  point: String,

  correct: Number,
});

const QUESTION_MODEL = mongoose.model("question", QuestionSchema);
module.exports = QUESTION_MODEL;
