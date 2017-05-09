var mongoose = require('./db');

//用户
var TalentspieUser = mongoose.model('TalentspieUser', {
    nickname: {
        type: String,
        required: true
    },
    mobilephone: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        unique: true
    },
    avatarUrl: {
        type: String,
        default: '../../images/icon_default.png'
    },
    gender: {
        type: Number,
        default: 1
    },
    cardStyle: {
        type: Number,
        default: 1
    },
    email: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    job: {
        type: String,
        default: ''
    },
    summary: {
        type: String,
        default: ''
    }
})

//文件
var TalentspieUpload = mongoose.model('TalentspieUpload', {
    filepath: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        default: 0
    },
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'TalentspieUser'
    },
    created_time: {
        type: Date,
        default: Date.now()
    }
})

//印象
var TalentspieImpression = mongoose.model('TalentspieImpression', {
    impression: {
        type: String,
        requried: true
    },
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'TalentspieUser'
    },
    signature: String,
    accessedSignature: String,
    created_time: {
        type: Date,
        default: Date.now()
    }
})

//人气
var TalentspieView = mongoose.model('TalentspieView', {})

//点赞
var TalentspiePraise = mongoose.model('TalentspiePraise', {})

//收藏
var TalentspieCollect = mongoose.model('TalentspieCollect', {})

//认证
var TalentspieAuthenticate = mongoose.model('TalentspieAuthenticate', {})

function Talentspie() {}

Talentspie.uploadFile = function (filepath, type, signature, cb) {
    TalentspieUser.findOne({signature: signature}, function(err, doc) {
        if (!doc) {
            cb(err, {
                "errcode": 404,
                "message": "用户不存在",
                "serverTime": getTimeStamp(),
            });
        } else {
            var obj = new TalentspieUpload({
                filepath: filepath.substring(6).replace(/\\/g, '/'),
                type: type,
                creator: doc
            });
            obj.save(function (err) {
                cb(err, {
                    "errcode": 200,
                    "message": "上传成功",
                    "data": obj.filepath,
                    "serverTime": getTimeStamp(),
                });
            })
        }
    });
}

Talentspie.test = function (cb) {
    TalentspieUpload.findOne().populate('creator').exec(function(err, doc) {
        cb(err, {
            "errcode": 200,
            "message": "上传成功",
            "data": doc,
            "serverTime": getTimeStamp(),
        });
    });
}

Talentspie.insertUser = function (nickname, mobilephone, signature, avatarUrl, gender, cardStyle, email, company, job, summary, cb) {
    TalentspieUser.findOne({signature: signature}, function(err, doc) {
       if (doc) {
           cb(err, {
               "errcode": 404,
               "message": "用户已存在",
               "serverTime": getTimeStamp(),
           });
       } else {
           var obj = new TalentspieUser({
               nickname: nickname,
               mobilephone: mobilephone,
               signature: signature,
               avatarUrl: avatarUrl,
               gender: gender,
               cardStyle: cardStyle,
               email: email,
               company: company,
               job: job,
               summary: summary
           });

           obj.save(function(err, newUser) {
               cb(err,{
                   "errcode": 200,
                   "message": "插入成功",
                   "data": newUser,
                   "serverTime": getTimeStamp(),
               });
           });
       }
    });
}

Talentspie.selectUser = function (signature, cb) {
    TalentspieUser.findOne({signature: signature}, function(err, doc) {
        if (!doc) {
            cb(err, {
                "errcode": 404,
                "message": "用户不存在",
                "serverTime": getTimeStamp(),
            });
        } else {
            cb(err,{
                "errcode": 200,
                "message": "查询成功",
                "data": doc,
                "serverTime": getTimeStamp(),
            });
        }
    });
}

Talentspie.updateUser = function (nickname, signature, email, company, job, summary, cb) {
    TalentspieUser.findOne({signature: signature}, function(err, doc) {
        if (!doc) {
            cb(err, {
                "errcode": 404,
                "message": "用户不存在",
                "serverTime": getTimeStamp(),
            });
        } else {
            TalentspieUser.update({signature: signature}, {$set: {
                nickname: nickname,
                email: email,
                company: company,
                job: job,
                summary: summary
            }}, function(err, doc) {
                TalentspieUser.findOne({signature: signature}, function(err, doc) {
                    cb(err,{
                        "errcode": 200,
                        "message": "更新成功",
                        "data": doc,
                        "serverTime": getTimeStamp(),
                    });
                });
            });
        }
    });
}

Talentspie.updateUser_mobilephone = function (mobilephone, signature, cb) {
    TalentspieUser.findOne({signature: signature}, function(err, doc) {
        if (!doc) {
            cb(err, {
                "errcode": 404,
                "message": "用户不存在",
                "serverTime": getTimeStamp(),
            });
        } else {
            TalentspieUser.update({signature: signature}, {$set: {
                mobilephone: mobilephone
            }}, function(err, doc) {
                TalentspieUser.findOne({signature: signature}, function(err, doc) {
                    cb(err,{
                        "errcode": 200,
                        "message": "更新成功",
                        "data": doc,
                        "serverTime": getTimeStamp(),
                    });
                });
            });
        }
    });
}

Talentspie.updateUser_avatarUrl = function (avatarUrl, signature, cb) {
    TalentspieUser.findOne({signature: signature}, function(err, doc) {
        if (!doc) {
            cb(err, {
                "errcode": 404,
                "message": "用户不存在",
                "serverTime": getTimeStamp(),
            });
        } else {
            TalentspieUser.update({signature: signature}, {$set: {
                avatarUrl: avatarUrl
            }}, function(err, doc) {
                TalentspieUser.findOne({signature: signature}, function(err, doc) {
                    cb(err,{
                        "errcode": 200,
                        "message": "更新成功",
                        "data": doc,
                        "serverTime": getTimeStamp(),
                    });
                });
            });
        }
    });
}

Talentspie.updateUser_cardStyle = function (cardStyle, signature, cb) {
    TalentspieUser.findOne({signature: signature}, function(err, doc) {
        if (!doc) {
            cb(err, {
                "errcode": 404,
                "message": "用户不存在",
                "serverTime": getTimeStamp(),
            });
        } else {
            TalentspieUser.update({signature: signature}, {$set: {
                cardStyle: cardStyle
            }}, function(err, doc) {
                TalentspieUser.findOne({signature: signature}, function(err, doc) {
                    cb(err,{
                        "errcode": 200,
                        "message": "更新成功",
                        "data": doc,
                        "serverTime": getTimeStamp(),
                    });
                });
            });
        }
    });
}

Talentspie.insertImpression = function (impression, signature, accessedSignature, cb) {

    var MAX_IMPRESSION_COUNT = 5;

    TalentspieImpression.find({signature: signature, accessedSignature: accessedSignature}, function(err, oldArr) {

        var newArr = [];

        if (impression.indexOf('$$$') < 0) {
            newArr.push(impression);
        } else {
            newArr = impression.split('$$$');
        }

        //去空
        for (var i = 0; i < newArr.length; i++) { if (newArr[i].length <= 0) { newArr.splice(i, 1); } }

        //去重
        for (var i = 0; i < newArr.length - 1; i++) { for (var j = i + 1; j < newArr.length;) { if (newArr[i] == newArr[j]) { newArr.splice(j, 1); } else { j++; } } }

        console.log('>[' + newArr + ']');

        //判断有效印象数量不超过上限
        if (oldArr.length + newArr.length > MAX_IMPRESSION_COUNT) {
            console.log('>too many impression tags');
            cb(null, {
                "errcode": 404,
                "message": "印象数量超过上限",
                "serverTime": getTimeStamp(),
            });
        } else {
            //判断是否存在已添加过的印象
            for (var i = 0; i < newArr.length; i++) { for (var j = 0; j < oldArr.length; j++) {
                if (newArr[i] == oldArr[j].impression) {
                        console.log('>impression is existed');
                        cb(null, {
                            "errcode": 404,
                            "message": "印象已添加过",
                            "serverTime": getTimeStamp(),
                        });
                    }
                }
            }

            TalentspieUser.findOne({signature: signature}, function(err, doc) {
                var objArr = [];
                for (var i = 0; i < newArr.length; i++) {
                    var obj = new TalentspieImpression({
                        impression: newArr[i],
                        creator: doc,
                        signature: signature,
                        accessedSignature: accessedSignature
                    });
                    objArr.push(obj);
                }

                //批量插入文档
                TalentspieImpression.collection.insert(objArr, function(err, arr) {
                   console.log(arr);
                    //call interface
                    Talentspie.selectImpression(accessedSignature, function(err, doc) {
                        //call cb function out
                        cb(err, doc);
                    });
                });
            });

        }
    });
}

Talentspie.selectImpression = function (accessedSignature, cb) {
    TalentspieImpression.find({accessedSignature: accessedSignature}).populate('creator').exec(function(err, docs) {
        // callback
        console.log(docs);
        var data = [];
        //合并同类项，并把对应的signature保存在一起
        for (var i = 0; i < docs.length; i++) {
            var obj = {};
            obj.title = docs[i].impression;
            obj.from = [];
            var user = {};
            if (docs[i].creator) {
                user.nickname = docs[i].creator.nickname;
                user.avatarUrl = docs[i].creator.avatarUrl;
            } else {
                user.nickname = '';
                user.avatarUrl = '';
            }
            obj.from.push(user);
            for (var j = i + 1; j < docs.length;) {
                if (docs[i].impression == docs[j].impression) {
                    var user = {};
                    if (docs[j].creator) {
                        user.nickname = docs[j].creator.nickname;
                        user.avatarUrl = docs[j].creator.avatarUrl;
                    } else {
                        user.nickname = '';
                        user.avatarUrl = '';
                    }
                    obj.from.push(user);
                    docs.splice(j, 1);
                } else {
                    j++;
                }
            }
            data.push(obj);
        }
        cb(err, {
            "errcode": 200,
            "message": "查询成功",
            "data": data,
            "serverTime": getTimeStamp(),
        });
    });
}

module.exports = Talentspie;

function getTimeStamp() {
    return new Date().getTime();
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                    //月份
        "d+": this.getDate(),                         //日
        "h+": this.getHours(),                        //小时
        "m+": this.getMinutes(),                      //分
        "s+": this.getSeconds(),                      //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()                   //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};