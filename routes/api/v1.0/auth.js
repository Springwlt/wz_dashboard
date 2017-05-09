var express = require('express');
var apiRoutes = express.Router();
var User = require('../../../models/user');
var Alidayu = require('alidayujs');
var jwt = require('jsonwebtoken');
var secret = require('../../../config/secret');
var tokenManager = require('../../../config/token_manager.js');
var redis = require("redis");
var client = redis.createClient();
var crypto = require('crypto');


module.exports = function (app) {
    app.use('/api/v1.0', apiRoutes);

    //网站首页
    app.get('/', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.render('index1');

    });
    //测试接口
    apiRoutes.get('/', function (req, res) {

        res.render('index1')

    });

    //获取短信验证码
    apiRoutes.get('/auth/fetchcode', function (req, res) {
        console.log('-interface: /api/v1.0/auth/fetchcode');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        if (req.query.mobilephone == undefined) {
            console.log('>lose necessary parameters');
            return  res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        var mobilephone = req.query.mobilephone;
        console.log('-mobilephone: '+ mobilephone);
        var vercode = getVercode();
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
                client.on("error", function (err) {
                    console.log("Error " + err);
                });
                client.set(mobilephone, vercode, function (err, reply) {
                    if (reply.toString() == 'OK') {
                        client.expire(mobilephone, 60);
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

    //用户注册
    apiRoutes.post('/auth/register', function (req, res) {
        console.log('-interface: /api/v1.0/auth/register');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        if (req.body.mobilephone == undefined || req.body.vercode == undefined || req.body.pwd == undefined) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        var mobilephone = req.body.mobilephone;
        var vercode = req.body.vercode;
        var pwd = req.body.pwd;
        console.log('-mobilephone: ' + mobilephone);
        console.log('-vercode: ' + vercode);
        console.log('-pwd: ' + pwd);
        crypto.randomBytes(128, function (err, salt) {
            if (err) {
                throw err;
            }
            salt = salt.toString('hex');
            crypto.pbkdf2(pwd, salt, 4096, 256, function (err, hash) {
                if (err) {
                    throw err;
                }
                hash = hash.toString('hex');
                var newUser = new User({
                    mobilephone: req.body.mobilephone,
                    nickname:'',
                    sex: 2,
                    head: '/imgs/head.png',
                    salt: salt,
                    hash: hash,
                });
                client.on("error", function (err) {
                    console.log("Error " + err);
                });
                client.get(mobilephone, function (err, reply) {
                    if (err) {
                        return res.json(err);
                    }
                    if (reply) {
                        if (reply == parseInt(vercode)) {
                            User.get(newUser.mobilephone, function (err, user) {
                                if (err) {
                                    res.json(err);
                                }
                                if (user) {
                                    console.log('>mobile phone number is exist');
                                    return res.json({
                                        "errcode": 404,
                                        "message": "手机号码已经注册",
                                        "serverTime": getTimeStamp(),
                                    });
                                }
                                newUser.save(function (err1, user1) {
                                    if (err1) {
                                        res.json(err1);
                                    }
                                    console.log('>success');
                                    return res.json({
                                        "errcode": 200,
                                        "message": "注册成功",
                                        "serverTime": getTimeStamp(),
                                    });
                                });
                            });
                        }
                    } else {
                        console.log('>verify code is wrong');
                        return res.json({
                            "errcode": 404,
                            "message": "验证码不正确",
                            "serverTime": getTimeStamp(),
                        });
                    }
                });
            });
        });
    });

    //用于用户登录的时候配合MD5生成加盐的密码
    apiRoutes.get('/auth/salt', function (req, res) {
        console.log('-interface: /api/v1.0/auth/salt');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        if (req.query.mobilephone == undefined) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        var mobilephone = req.query.mobilephone;
        console.log('-mobilephone: ' + mobilephone);
        User.get(mobilephone, function (err, user) {
            if (err) {
                res.json(err);
            }
            if (!user) {
                console.log('>user object is not exist');
                return res.json({
                    "errcode": 404,
                    "message": "用户对象不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "获取盐成功",
                "data": user.salt,
                "serverTime": getTimeStamp(),
            });
        })
    });

    //用户登陆
    apiRoutes.post('/auth/login', function (req, res) {
        console.log('-interface: /api/v1.0/auth/login');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        if (req.body.mobilephone == undefined || req.body.pwd == undefined) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        var mobilephone = req.body.mobilephone;
        var pwd = req.body.pwd;
        console.log('-mobilephone: ' + mobilephone);
        console.log('-pwd: ' + pwd);
        User.get(req.body.mobilephone, function (err, user) {
            if (err) {
                res.json(err);
            }
            if (!user) {
                console.log('>user object is not exist');
                return res.json({
                    "errcode": 404,
                    "message": "用户对象不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            if (pwd != user.hash) {
                console.log('>password is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "密码错误",
                    "serverTime": getTimeStamp(),
                });
            }
            var userId = user._id;
            var token = jwt.sign({id: userId.toString()}, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION});
            client.on("error", function (err) {
                console.log("Error " + err);
            });
            client.set(userId.toString(), token, function (err, reply) {
                if (reply == 'OK') {
                    console.log('>success');
                    return res.json({
                        "errcode": 200,
                        "message": "登录成功",
                        "data": {
                            "token": token,
                        },
                        "serverTime": getTimeStamp(),
                    });
                }
            });
            client.expire(userId.toString(), 60 * 60 * 24);
        });
    });

    //用户注销
    apiRoutes.get('/auth/logout', function (req, res) {
        console.log('-interface: /api/v1.0/auth/logout');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        if (req.query.token == undefined) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        var token = req.query.token;
        console.log('-token: ' + token);
        var user = jwt.decode(token);
        console.log(user);
        if (!user) {
            console.log('>user object is not exist');
            return res.json({
                "errcode": 404,
                "message": "用户对象不存在",
                "serverTime": getTimeStamp(),
            });
        } else {
            client.expire(user.id, 1);
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "注销成功",
                "serverTime": getTimeStamp(),
            });
        }
    });

    //更新识别码
    apiRoutes.get('/auth/updatetoken', function (req, res) {
        console.log('-interface: /api/v1.0/auth/updatetoken');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        if (req.query.token == undefined) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        var token = req.query.token;
        console.log('-token: ' + token);
        var user = jwt.decode(token);
        if (!user) {
            console.log('>user object is not exist');
            return res.json({
                "errcode": 404,
                "message": "用户对象不存在",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            console.log(oldToken);
            console.log(reply);
            if (reply == token) {
                console.log('userIdString' + userIdString);
                var newToken = jwt.sign({id: userIdString}, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION});
                client.on("error", function (err) {
                    console.log("Error " + err);
                });
                client.set(userIdString, newToken, function (err, reply) {
                    if (reply == 'OK') {
                        console.log('>success');
                        return res.json({
                            "errcode": 200,
                            "message": "识别码更新成功",
                            "data": newToken,
                            "serverTime": getTimeStamp(),
                        });
                    }
                });
                client.expire(userId.toString(), 60 * 60 * 24);
            }else{
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确",
                    "serverTime": getTimeStamp(),
                });
            }
        });

    });
};


function getVercode() {
    var number = Math.random() * 900000 | 0 + 100000;
    return number;
}

function getTimeStamp() {
    return new Date().getTime();
}
