const ObjectID = require("mongoose").Types.ObjectId;
const USER = require("../database/user-coll");
const { hash, compare } = require("bcryptjs");
const { sign, verify } = require("../utils/jwt");

module.exports = class User {
  static remove({ userID }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(userID))
          return resolve({ error: true, message: "params_invalid" });

        let infoAfterRemove = await USER.findByIdAndDelete(userID);

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
  static createUser(username, fullName, gender) {
    return new Promise(async (resolve) => {
      try {
        // if (username.includes(" ")) {
        //   return {
        //     error: true,
        //     message: "Tên đăng nhập phải viết liền không dấu",
        //   };
        // }
        let checkExist = await USER.findOne({ username });
        if (checkExist)
          return resolve({
            error: true,
            message: "Tên đăng nhập đã tồn tại, vui lòng nhập username khác",
          });
        const usernameRegex =
          /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!usernameRegex.test(username)) {
          return {
            error: true,
            message: "Tên đăng nhập không hợp lệ",
          };
        }
        let newUser = new USER({
          fullName,
          username,
          password: this.generateRandomPassword(),
          gender,
          role: "Interviewee",
        });

        let infoUser = await newUser.save();
        if (!infoUser)
          return resolve({
            error: true,
            message: "Bị lỗi trong quá trình đăng ký",
          });
        resolve({ data: infoUser });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static createEmployee(username, fullName, gender, role) {
    return new Promise(async (resolve) => {
      try {
        let checkExist = await USER.findOne({ username });
        if (checkExist)
          return resolve({
            error: true,
            message: "Tên đăng nhập đã tồn tại, vui lòng nhập username khác",
          });
        const usernameRegex =
          /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!usernameRegex.test(username)) {
          return {
            error: true,
            message: "Tên đăng nhập không hợp lệ",
          };
        }
        let newUser = new USER({
          fullName,
          username,
          password: this.generateRandomPassword(),
          gender,
          role,
        });

        let infoUser = await newUser.save();
        if (!infoUser)
          return resolve({
            error: true,
            message: "Bị lỗi trong quá trình đăng ký",
          });
        resolve({ data: infoUser });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static updateInfoUserBasic({
    userID,
    fullName,
    gender,
    birthDay,
    phone,
    address,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(userID))
          return resolve({ error: true, message: "params_invalid" });

        let dataUpdate = {
          fullName,
          gender,
          birthDay,
          phone,
          address,
          updateAt: Date.now(),
        };

        let infoAfterUpdate = await USER.findByIdAndUpdate(userID, dataUpdate, {
          new: true,
        });

        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: "Lỗi trong quá trình cập nhật",
          });

        return resolve({
          data: infoAfterUpdate,
          message: "Cập nhật thành công",
        });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static updateEmployee({
    userID,
    fullName,
    gender,
    birthDay,
    phone,
    address,
    role,
  }) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(userID))
          return resolve({ error: true, message: "params_invalid" });

        let dataUpdate = {
          fullName,
          gender,
          birthDay,
          phone,
          address,
          role,
          updateAt: Date.now(),
        };

        let infoAfterUpdate = await USER.findByIdAndUpdate(userID, dataUpdate, {
          new: true,
        });

        if (!infoAfterUpdate)
          return resolve({
            error: true,
            message: "Lỗi trong quá trình cập nhật",
          });

        return resolve({
          data: infoAfterUpdate,
          message: "Cập nhật thành công",
        });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static signIn(username, password) {
    return new Promise(async (resolve) => {
      try {
        const infoUser = await USER.findOne({ username });
        if (!infoUser)
          return resolve({ error: true, message: "Tài khoản không tồn tại" });

        const checkPass = password === infoUser.password;

        if (!checkPass)
          return resolve({ error: true, message: "Sai mật khẩu" });

        // await delete infoUser.password;

        let token = await sign({
          data: {
            _id: infoUser._id,
            username: infoUser.username,
            role: infoUser.role,
          },
        });
        return resolve({ error: false, data: { infoUser, token } });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static getListEmployee(page, pageSize) {
    return new Promise(async (resolve) => {
      try {
        const skip = (page - 1) * pageSize;

        let listUser = await USER.find({
          role: { $in: ["Interviewer", "HRM"] }
        }).skip(skip).limit(pageSize);

        const totalItems = await USER.countDocuments({ role: { $in: ["Interviewer", "HRM"] } });
        const totalPages = Math.ceil(totalItems / pageSize);

        if (!listUser || listUser.length === 0) {
          return resolve({
            error: true,
            message: "Không tìm thấy danh sách nhân viên",
          });
        }

        return resolve({
          error: false,
          data: listUser,
          pagination: {
            totalItems,
            itemsPerPage: parseInt(pageSize),
            totalPages,
            currentPage: parseInt(page),
          },
        });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }
  static getListInterviewee(page, pageSize) {
    return new Promise(async (resolve) => {
      try {
        const skip = (page - 1) * pageSize;
        let listUser = await USER.find({ role: "Interviewee" })
          .skip(skip)
          .limit(pageSize);

        const totalItems = await USER.countDocuments({ role: "Interviewee" });
        const totalPages = Math.ceil(totalItems / pageSize);

        if (!listUser || listUser.length === 0) {
          return resolve({
            error: true,
            message: "Không tìm thấy danh sách ứng viên",
          });
        }

        return resolve({
          error: false,
          data: listUser,
          pagination: {
            totalItems,
            itemsPerPage: parseInt(pageSize),
            totalPages,
            currentPage: parseInt(page),
          },
        });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static getInfo(userID) {
    return new Promise(async (resolve) => {
      try {
        let infoUser = await USER.findById(userID);

        if (!infoUser)
          return resolve({
            error: true,
            message: "Không tìm thấy thông tin ứng viên",
          });

        return resolve(infoUser);
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static changePassword({ userID, passwordOld, passwordNew }) {
    return new Promise(async (resolve) => {
      try {
        console.log({ userID, passwordOld, passwordNew });

        if (!ObjectID.isValid(userID))
          return resolve({ error: true, message: "params_invalid" });

        let infoUser = await USER.findById(userID);

        if (!infoUser)
          return resolve({ error: true, message: "email_not_exist" });

        let hashPassword = await hash(passwordNew, 8);

        let dataUpdate = {
          password: hashPassword,
        };

        const checkPass = await compare(passwordOld, infoUser.password);

        if (!checkPass)
          return resolve({ error: true, message: "password_not_true" });
        else {
          let infoAfterUpdate = await USER.findByIdAndUpdate(
            userID,
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
        }
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }
  static generateRandomPassword() {
    const length = 6;
    const charset = "0123456789"; // Chuỗi ký tự chứa các số từ 0 đến 9
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
  static userById(userId) {
    return new Promise(async (resolve) => {
      try {
        if (!ObjectID.isValid(userId))
          return resolve({ error: true, message: "params_invalid" });

        let user = await USER.findById(userId);
        // console.log(user.exam);

        if (!user)
          return resolve({
            error: true,
            message: "Không tìm thấy thông tin người dùng",
          });

        // // Sử dụng .populate("exam") để populate thuộc tính "exam" của đối tượng user
        // await user.populate("exam").execPopulate();
        // console.log(user.exam);
        await user.populate("exam").execPopulate();

        return resolve({ error: false, data: user });
      } catch (error) {
        return resolve({ error: true, message: error.message });
      }
    });
  }

  static getCount() {
    return new Promise(async (resolve) => {
      try {
        const count = await USER.countDocuments();
        resolve(count);
      } catch (error) {
        resolve(0);
      }
    });
  }
};
