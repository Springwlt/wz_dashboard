var crypto = require('crypto');
var mongoose = require('../models/db');

var adminSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    active: Boolean,
    superadmin: Boolean,
    introduction: String,
    head: String
}, {
    collection: 'admin'
});

var adminModel = mongoose.model('Admin', adminSchema);

function Admin(admin) {
    this.username = admin.username;
    this.email = admin.email;
    this.password = admin.password;
    this.active = admin.active;
    this.superadmin = admin.superadmin;
    this.introduction = admin.introduction;
}

Admin.prototype.save = function (cb) {
    //生成MD5值
    var md5 = crypto.createHash('MD5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
    var head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';
    var admin = {
        username: this.username,
        email: this.email,
        password: this.password,
        active: this.active,
        superadmin: this.superadmin,
        introduction: this.introduction,
        head: head
    };

    var newAdmin = new adminModel(admin);

    newAdmin.save(function (err, admin) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, admin);
    });
}

Admin.get = function (username, cb) {
    adminModel.findOne({
        username: username
    }, function (err, admin) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, admin);
    });
};
//查询所有的专家
Admin.getAll = function (query, cb) {
    var query = {};
    adminModel.find(query, function (err, admin) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, admin);
    });
};
//删除某一个专家
Admin.delAdminByName = function (username, cb) {
    adminModel.remove({
        "username": username
    }, function (err, adminId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, adminId);
    });
};
//修改某一个专家的信息
Admin.adminUpdater = function (username, admin, cb) {
    adminModel.update(
        {"username": username}, {
            $set: {
                'email': admin.email,
                'password': admin.password,
                'active': admin.active,
                'superadmin': admin.superadmin,
                'introduction': admin.introduction,
            }
        }
        , function (err, admin) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, admin);
        });
};
module.exports = Admin;