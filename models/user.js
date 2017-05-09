var mongoose = require('../models/db');
var userSchema = new mongoose.Schema({
    mobilephone: String,
    nickname: String,
    sex: Number,
    head: String,
    salt: String,
    hash: String,
}, {
    collection: 'user'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
    this.mobilephone = user.mobilephone;
    this.nickname = user.nickname;
    this.sex = user.sex;
    this.head = user.head;
    this.salt = user.salt;
    this.hash = user.hash;
}

User.prototype.save = function (cb) {
    var user = {
        mobilephone: this.mobilephone,
        nickname: this.nickname,
        sex: this.sex,
        head: this.head,
        salt: this.salt,
        hash: this.hash,
    };
    var newUser = new userModel(user);

    newUser.save(function (err, user) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, user);
    });
};
User.get = function (mobilephone, cb) {
    userModel.findOne({
        mobilephone: mobilephone
    }, function (err, user) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, user);
    });
};

User.getUserById = function (userId, cb) {
    userModel.findOne({
        _id: userId
    }, function (err, user) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, user);
    });
};
//修改密码
User.userUpdater = function (userId, salt, hash, cb) {
    userModel.update(
        {_id: userId}, {
            $set: {'salt': salt, 'hash': hash}
        }
        , function (err, user) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, user);
        });
};

//修改用户信息
User.userUpdaterInfo = function (userId, nickname, sex,cb) {
    userModel.update(
        {_id: userId}, {
            $set: {'nickname': nickname, 'sex': sex}
        }
        , function (err, user) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, user);
        });
};
//用户更新个人图像
User.userUpdaterImage = function (userId, head, cb) {
    userModel.update(
        {_id: userId}, {
            $set: {'head': head}
        }
        , function (err, user) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, user);
        });
};

//返回所有用户
User.getAll = function (query, cb) {
    var query = {};
    userModel.find(query,function (err,user) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, user);
    });
};

module.exports = User;



