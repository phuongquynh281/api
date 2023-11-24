const ObjectID = require("mongoose").Types.ObjectId;
const QUESTION_COLL = require("../database/question-coll");
const EXAM_COLL = require("../database/exam-coll");

module.exports = class Question extends QUESTION_COLL {
  static insert({ nameQuestion, answers, level, career }) {
    return new Promise(async (resolve) => {
      try {
        let dataInsert = {
          name: nameQuestion,
          answers,
          level,
          career,
        };
        let infoAfterInsert = new QUESTION_COLL(dataInsert);
        let saveDataInsert = await infoAfterInsert.save();
        if (!saveDataInsert)
          return resolve({ error: true, message: "cannot_insert_data" });
        resolve({ error: false, data: infoAfterInsert });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static getList({ level, career, page = 1, pageSize = 100 }) {
    return new Promise(async (resolve) => {
      try {
        let query = QUESTION_COLL.find();

        if (level) {
          query = query.where("level").equals(level);
        }

        if (career) {
          query = query.where("career").equals(career);
        }

        const skip = (page - 1) * pageSize;

        query = query.skip(skip).limit(pageSize);

        let listQuestion = await query.exec();

        if (!listQuestion || listQuestion.length === 0) {
          return resolve({
            error: true,
            message:
              "Không tìm thấy câu hỏi với mức độ khó hoặc vị trí công việc này",
          });
        }

        return resolve({ error: false, data: listQuestion });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static getInfo({ questionID }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(questionID))
          return resolve({ error: true, message: "params_invalid" });

        let infoQuestion = await QUESTION_COLL.findById(questionID);

        if (!infoQuestion)
          return resolve({ error: true, message: "cannot_get_info_data" });

        return resolve({ error: false, data: infoQuestion });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static remove({ questionID }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(questionID))
          return resolve({ error: true, message: "params_invalid" });
        let infoAfterRemove = await QUESTION_COLL.findByIdAndDelete(questionID);
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

  static update({ questionID, nameQuestion, answers, level,career }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(questionID))
          return resolve({ error: true, message: "params_invalid" });

        let dataUpdate = {
          nameQuestion,
          answers,
          level,
          career
        };

        let infoAfterUpdate = await QUESTION_COLL.findByIdAndUpdate(
          questionID,
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
  static getCount() {
    return new Promise(async (resolve) => {
      try {
        const count = await QUESTION_COLL.countDocuments();
        resolve(count);
      } catch (error) {
        resolve(0);
      }
    });
  }
};
