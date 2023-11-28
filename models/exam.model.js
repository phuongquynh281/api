const ObjectID = require("mongoose").Types.ObjectId;
const EXAM_COLL = require("../database/exam-coll");
const QUESTION_COLL = require("../database/question-coll");
const USER_COLL = require("../database/user-coll");
const { sign, verify } = require("../utils/jwt");

module.exports = class Exam extends EXAM_COLL {
  static insert({ name, description, level,career, timeDoTest, createAt }) {
    return new Promise(async (resolve) => {
      try {
        if (!name || isNaN(Number(level)))
          return resolve({ error: true, message: "Dữ liệu không hợp lệ" });

        let dataInsert = {
          name,
          description,
          timeDoTest,
          level,
          career,
          createAt,
        };

        console.log({ dataInsert });

        let infoAfterInsert = new EXAM_COLL(dataInsert);
        let saveDataInsert = await infoAfterInsert.save();

        if (!saveDataInsert)
          return resolve({ error: true, message: "cannot_insert_exam" });

        // let pushExamToSubjects = await SUBJECT_COLL.findByIdAndUpdate(subjectID, {
        //     $addToSet: { exams: infoAfterInsert._id }
        // }, {new: true})

        resolve({ error: false, data: infoAfterInsert });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }
  static getList({ level, career, page = 1, pageSize = 100 }) {
    return new Promise(async (resolve) => {
      try {
        let query = EXAM_COLL.find()
          .sort({ createAt: -1 })
          .populate("questions");

        if (level) {
          query = query.where("level").equals(level);
        }

        if (career) {
          query = query.where("career").equals(career);
        }
        const skip = (page - 1) * pageSize;

        query = query.skip(skip).limit(pageSize);

        let listExam = await query.exec();

        if (!listExam || listExam.length === 0) {
          return resolve({
            error: true,
            message:
              "Không tìm thấy bộ đề với mức độ khó hoặc vị trí công việc này",
          });
        }
        return resolve(listExam);
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }
  static update({ examID, name, description, timeDoTest, level,career, createAt }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(examID))
          return resolve({ error: true, message: "Dữ liệu không hợp lệ" });

        let dataUpdate = {
          name,
          description,
          level,
          timeDoTest,
          career,
          createAt,
        };

        let infoAfterUpdate = await EXAM_COLL.findByIdAndUpdate(
          examID,
          dataUpdate,
          { new: true }
        );

        if (!infoAfterUpdate)
          return resolve({ error: true, message: "cannot_update_data" });

        return resolve({
          error: false,
          data: infoAfterUpdate,
          message: "update_data_success",
        });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static getInfo({ examID, userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(examID, userID))
          return resolve({ error: true, message: "params_invalid" });

        let infoExam = await EXAM_COLL.findById(examID);
        // .populate(
        //   "subject question user"
        // );

        if (!infoExam)
          return resolve({ error: true, message: "cannot_get_info_data" });

        // let seenOfExam = await EXAM_COLL.findByIdAndUpdate(
        //   examID,
        //   {
        //     $push: { seen: userID },
        //   },
        //   { new: true }
        // );

        return resolve({ error: false, data: infoExam });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  //   //Danh sách bộ đề theo môn học
  //   static getListOfSubjects({ subjectID }) {
  //     return new Promise(async (resolve) => {
  //       try {
  //         let listExamOfSubject = await EXAM_COLL.find({
  //           subject: subjectID,
  //         }).populate("subject author");

  //         if (!listExamOfSubject)
  //           return resolve({ error: true, message: "cannot_get_list_data" });

  //         return resolve({ error: false, data: listExamOfSubject });
  //       } catch (error) {
  //         return resolve({ error: true, message: error.message });
  //       }
  //     });
  //   }

  //   //Danh sách bộ đề theo lớp
  //   static getListExamWithLevel({ subjectID, level }) {
  //     return new Promise(async (resolve) => {
  //       try {
  //         if (isNaN(Number(level)) || !ObjectID.isValid(subjectID))
  //           return resolve({ error: true, message: "params_invalid" });

  //         let listExamWithLevel = await EXAM_COLL.find({
  //           subject: subjectID,
  //           level,
  //         }).populate("subject author");

  //         if (!listExamWithLevel)
  //           return resolve({ error: true, message: "cannot_get_list_data" });
  //         return resolve({ error: false, data: listExamWithLevel });
  //       } catch (error) {
  //         return resolve({ error: true, message: error.message });
  //       }
  //     });
  //   }



  static remove({ examID }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(examID))
          return resolve({ error: true, message: "params_invalid" });

        let infoAfterRemove = await EXAM_COLL.findByIdAndDelete(examID);

        let infoQuestionRemove = await QUESTION_COLL.deleteMany({
          exam: examID,
        });

        let infoCommentRemove = await COMMENT_COLL.deleteMany({ exam: examID });

        if (!infoAfterRemove)
          return resolve({ error: true, message: "cannot_remove_data" });

        return resolve({
          error: false,
          data: infoAfterRemove,
          message: "remove_data_success",
        });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static addQuestionsToExam(examID, questionIDs) {
    return new Promise(async (resolve) => {
      try {
        const exam = await EXAM_COLL.findById(examID);

        if (!exam) {
          return resolve({ error: true, message: "Bộ đề không tồn tại." });
        }

        const addedQuestions = [];

        // Duyệt qua danh sách questionIDs và thêm từng câu hỏi vào bộ đề
        for (const questionID of questionIDs) {
          // Tìm câu hỏi theo questionID
          const question = await QUESTION_COLL.findById(questionID);
          if (!exam.questions) {
            exam.questions = []; // Khởi tạo exam.questions là một mảng rỗng nếu nó chưa tồn tại
          }
          if (question) {
            // Thêm questionID vào mảng câu hỏi của bộ đề
            exam.questions.push(questionID);
            addedQuestions.push(question);
          }
        }

        // Lưu thay đổi vào cơ sở dữ liệu
        const savedExam = await exam.save();
        (exam.question = addedQuestions),
          resolve({
            error: false,
            message: "Các câu hỏi đã được thêm vào bộ đề.",
            data: {
              exam: savedExam,
            },
          });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }
  static removeQuestionsFromExam(examID, questionIDs) {
    return new Promise(async (resolve) => {
      try {
        const exam = await EXAM_COLL.findById(examID);

        if (!exam) {
          return resolve({ error: true, message: "Bộ đề không tồn tại." });
        }

        const removedQuestions = [];

        // Duyệt qua danh sách questionIDs và xóa từng câu hỏi khỏi bộ đề
        for (const questionID of questionIDs) {
          // Kiểm tra xem questionID có tồn tại trong mảng câu hỏi của bộ đề hay không
          if (
            exam.questions &&
            Array.isArray(exam.questions) &&
            exam.questions.includes(questionID)
          ) {
            // Lọc ra các câu hỏi mà bạn muốn giữ lại trong bộ đề
            exam.questions = exam.questions.filter(
              (question) => question !== questionID
            );
            removedQuestions.push(questionID);
          }
        }

        // Lưu thay đổi vào cơ sở dữ liệu
        const savedExam = await exam.save();

        resolve({
          error: false,
          message: "Các câu hỏi đã được xóa khỏi bộ đề.",
          data: {
            exam: savedExam,
            removedQuestions: removedQuestions,
          },
        });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static getCount() {
    return new Promise(async (resolve) => {
      try {
        const count = await EXAM_COLL.countDocuments();
        resolve(count);
      } catch (error) {
        resolve(0);
      }
    });
  }
};
