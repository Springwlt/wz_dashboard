var express = require('express');
var apiRoutes = express.Router();
var Alidayu = require('alidayujs');
var redis = require('redis');
var redisClient = redis.createClient();
var crypto = require('crypto');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var Talentspie = require('../../../models/talentspie.js');

module.exports = function (app) {

    app.use('/api/v1.0', apiRoutes);
    app.use(multipart({uploadDir: './public/imgs'}));

    //上传图片
    apiRoutes.post('/talentspie/uploadFile', multipartMiddleware, function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/uploadFile');
        console.log('-method: POST');
        var filepath = '';
        if (req.files && req.files != undefined &&
            req.files.image && req.files.image != undefined &&
            req.files.image.path && req.files.image.path != undefined) {
            filepath = req.files.image.path;
        }
        var signature = req.body.signature || '';
        var type = req.body.type || 0;
        if (!filepath || !signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-signature: ' + signature);
        console.log('-filepath: ' + filepath);
        console.log('-type: ' + type);

        //call interface
        Talentspie.uploadFile(filepath, type, signature, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });

    //测试
    apiRoutes.get('/talentspie/test', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/test');
        console.log('-method: GET');

        //call interface
        Talentspie.test(function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });

    //发送验证码
    apiRoutes.get('/talentspie/fetchcode', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/fetchcode');
        console.log('-method: GET');
        var mobilephone = req.query.mobilephone || '';
        var vercode = Math.random() * 900000 | 0 + 100000;
        if (!mobilephone || !vercode) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-mobilephone: ' + mobilephone);
        console.log('-vercode: ' + vercode);
        var config = {
            app_key: '23702706',
            secret: 'da32a2c5253c431c39d6098d7fd34a7b'
        };
        var alidayu = new Alidayu(config);
        var options = {
            sms_free_sign_name: '玩转文化传媒',
            sms_param: JSON.stringify({"code": vercode.toString(), "product": "。"}),
            rec_num: mobilephone,
            sms_template_code: 'SMS_56170302',
        };
        alidayu.sms(options, function (result) {
            var obj = JSON.parse(result);
            console.log(obj);
            if (obj.error_response) {
                return res.json({
                    "errcode": obj.error_response.code,
                    "message": obj.error_response.sub_msg,
                    "serverTime": getTimeStamp(),
                });
            }
            else if (obj.alibaba_aliqin_fc_sms_num_send_response.result.success) {
                console.log('>success sent sms message to client');
                res.json({
                    "errcode": 200,
                    "message": "验证码发送成功",
                    "serverTime": getTimeStamp(),
                });
                redisClient.on("error", function (err) {
                    console.log('>error:', err.toString());
                });
                redisClient.set(mobilephone, vercode, function (err, reply) {
                    if (reply.toString() == 'OK') {
                        redisClient.expire(mobilephone, 60);
                    } else {
                        console.log('>error:', reply.toString());
                    }
                });
            } else {
                console.log('>inside error');
                return res.json({
                    "errcode": 500,
                    "message": "服务器内部错误",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //插入用户
    apiRoutes.post('/talentspie/insertUser', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/insertUser');
        console.log('-method: POST');
        var nickname = req.body.nickname || '';
        var mobilephone = req.body.mobilephone || '';
        var vercode = req.body.vercode || '';
        var signature = req.body.signature || '';
        var avatarUrl = req.body.avatarUrl || '';
        var gender = req.body.gender || 1;
        var cardStyle = req.body.cardStyle || 1;
        var email = req.body.email || '';
        var company = req.body.company || '';
        var job = req.body.job || '';
        var summary = req.body.summary || '';
        if (!nickname || !mobilephone || !vercode || !signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-nickname: ' + nickname);
        console.log('-mobilephone: ' + mobilephone);
        console.log('-vercode: ' + vercode);
        console.log('-signature: ' + signature);
        console.log('-avatarUrl: ' + avatarUrl);
        console.log('-gender: ' + gender);
        console.log('-cardStyle: ' + cardStyle);
        console.log('-email: ' + email);
        console.log('-company: ' + company);
        console.log('-job: ' + job);
        console.log('-summary: ' + summary);

        redisClient.on("error", function (err) {
            console.log('>error:', err.toString());
        });

        redisClient.get(mobilephone, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            if (!doc || doc != vercode) {
                console.log('>wrong verify code');
                return res.json({
                    "errcode": 404,
                    "message": "验证码无效",
                    "serverTime": getTimeStamp(),
                });
            } else {
                //call interface
                Talentspie.insertUser(nickname, mobilephone, signature, avatarUrl, gender, cardStyle, email, company, job, summary, function(err, doc) {
                    if (err) {
                        console.log('>error:', err.toString());
                        return res.json({
                            "errcode": 404,
                            "message": err.toString(),
                            "serverTime": getTimeStamp(),
                        });
                    }
                    return res.json(doc);
                });
            }
        });
    });

    //查询用户
    apiRoutes.get('/talentspie/selectUser', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/selectUser');
        console.log('-method: GET');
        var signature = req.query.signature || '';
        if (!signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-signature: ' + signature);

        //call interface
        Talentspie.selectUser(signature, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });

    //更新用户
    apiRoutes.put('/talentspie/updateUser', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/updateUser');
        console.log('-method: PUT');
        var nickname = req.body.nickname || '';
        var signature = req.body.signature || '';
        var email = req.body.email || '';
        var company = req.body.company || '';
        var job = req.body.job || '';
        var summary = req.body.summary || '';
        if (!nickname || !signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-nickname: ' + nickname);
        console.log('-signature: ' + signature);
        console.log('-email: ' + email);
        console.log('-company: ' + company);
        console.log('-job: ' + job);
        console.log('-summary: ' + summary);

        //call interface
        Talentspie.updateUser(nickname, signature, email, company, job, summary, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });

    //更新用户-手机
    apiRoutes.put('/talentspie/updateUser_mobilephone', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/updateUser_mobilephone');
        console.log('-method: PUT');
        var mobilephone = req.body.mobilephone || '';
        var vercode = req.body.vercode || '';
        var signature = req.body.signature || '';
        if (!mobilephone || !vercode || !signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-mobilephone: ' + mobilephone);
        console.log('-vercode: ' + vercode);
        console.log('-signature: ' + signature);

        redisClient.on("error", function (err) {
            console.log('>error:', err.toString());
        });

        redisClient.get(mobilephone, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            if (!doc || doc != vercode) {
                console.log('>wrong verify code');
                return res.json({
                    "errcode": 404,
                    "message": "验证码无效",
                    "serverTime": getTimeStamp(),
                });
            } else {
                //call interface
                Talentspie.updateUser_mobilephone(mobilephone, signature, function(err, doc) {
                    if (err) {
                        console.log('>error:', err.toString());
                        return res.json({
                            "errcode": 404,
                            "message": err.toString(),
                            "serverTime": getTimeStamp(),
                        });
                    }
                    return res.json(doc);
                });
            }
        });
    });

    //更新用户-头像
    apiRoutes.put('/talentspie/updateUser_avatarUrl', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/updateUser_avatarUrl');
        console.log('-method: PUT');
        var avatarUrl = req.body.avatarUrl || '';
        var signature = req.body.signature || '';
        if (!avatarUrl || !signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-avatarUrl: ' + avatarUrl);
        console.log('-signature: ' + signature);

        //call interface
        Talentspie.updateUser_avatarUrl(avatarUrl, signature, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });

    //更新用户-样式
    apiRoutes.put('/talentspie/updateUser_cardStyle', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/updateUser_cardStyle');
        console.log('-method: PUT');
        var cardStyle = req.body.cardStyle || '';
        var signature = req.body.signature || '';
        if (!cardStyle || !signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-cardStyle: ' + cardStyle);
        console.log('-signature: ' + signature);

        //call interface
        Talentspie.updateUser_cardStyle(cardStyle, signature, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });

    //插入印象
    apiRoutes.post('/talentspie/insertImpression', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/insertImpression');
        console.log('-method: POST');
        var signature = req.body.signature || '';
        var accessedSignature = req.body.accessedSignature || '';
        var impression = req.body.impression || '';
        if (!impression || !accessedSignature || !signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-signature: ' + signature);
        console.log('-accessedSignature: ' + accessedSignature);
        console.log('-impression: ' + impression);

        //call interface
        Talentspie.insertImpression(impression, signature, accessedSignature, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });

    //查询印象
    apiRoutes.get('/talentspie/selectImpression', function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('//////////////////////////////////////////////////////////');
        console.log('-interface: /api/v1.0/talentspie/selectImpression');
        console.log('-method: GET');
        var signature = req.query.signature || '';
        if (!signature) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-signature: ' + signature);

        //call interface
        Talentspie.selectImpression(signature, function(err, doc) {
            if (err) {
                console.log('>error:', err.toString());
                return res.json({
                    "errcode": 404,
                    "message": err.toString(),
                    "serverTime": getTimeStamp(),
                });
            }
            return res.json(doc);
        });
    });
}

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
