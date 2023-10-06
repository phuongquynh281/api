const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const classSchema = new Schema({

    //Tên
    name: String,

    //Mức độ,
    level: Number,


    //Danh sách nhân viên
    users: [{
        type: Schema.Types.ObjectId,
        ref : "user"
    }],

    //Danh sách cán bộ 
    monitors: [{
        type: Schema.Types.ObjectId,
        ref : "user"
    }],

    //Giáo viên chủ nhiệm
    teacher: {
        type: Schema.Types.ObjectId,
        ref : "user"
    },
    
    //Ngày tạo
    createAt: {
        type: Date,
        default: Date.now()
    },

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

    //Thuộc về cty
    school: {
        type: Schema.Types.ObjectId,
        ref : "company"
    },
    
});

const CLASS_MODEL = mongoose.model('class', classSchema);
module.exports  = CLASS_MODEL;