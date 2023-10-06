const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const companySchema = new Schema({

    //Tên trường
    name: String,

    //Email
    email: { type: String, required: true, unique: true },

    //Địa chỉ
    address: String,

    //SĐT 
    phone: String,

    //Logo/Hình ảnh 
    image: String,

    //Thời gian hoạt động
    timeActive: Date,
    
    //Người tạo
    author: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },

    //Người cập nhật
    userUpdate: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },

    //Chủ tịch cty
    president: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    
});

const COMPANY_MODEL = mongoose.model('company', companySchema);
module.exports  = COMPANY_MODEL;