const ObjectID = require("mongoose").Types.ObjectId;
const USER = require("../database/user-coll");
const { hash, compare } = require("bcryptjs");
const { sign, verify } = require("../utils/jwt");

module.exports = class User {
  static createUser(username, password, fullName, gender, role) {
    return new Promise(async (resolve) => {
      try {
        if (password.length < 6)
          return resolve({
            error: true,
            message: "Password phải từ 6 kí tự trở lên",
          });
        if (username.includes(" ")) {
          return {
            error: true,
            message: "Tên đăng nhập phải viết liền không dấu",
          };
        }
        let checkExist = await USER.findOne({ username });
        if (checkExist)
          return resolve({
            error: true,
            message: "Tên đăng nhập đã tồn tại, vui lòng nhập username khác",
          });
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
          return {
            error: true,
            message: "Tên đăng nhập không hợp lệ",
          };
        }
        let hashPassword = await hash(password, 8);
        let newUser = new USER({
          fullName,
          username,
          password: hashPassword,
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

        let infoAfterUpdate = await USER.findByIdAndUpdate(
          userID,
          dataUpdate,
          { new: true }
        );

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

        const checkPass = await compare(password, infoUser.password);
        if (!checkPass)
          return resolve({ error: true, message: "Sai mật khẩu" });

        await delete infoUser.password;

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

  static getList() {
    return new Promise(async (resolve) => {
      try {
        let listUser = await USER.find();

        if (!listUser)
          return resolve({ error: true, message: "Không tìm thấy danh sách ứng viên" });

        return resolve(listUser);
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
          return resolve({ error: true, message: "Không tìm thấy thông tin ứng viên" });

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


};
