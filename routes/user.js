var express = require('express');
var User = require('../models/user');
var crypto = require('crypto');
var mutipart = require('connect-multiparty');
var mutipartMiddeware = mutipart();

module.exports = function (app) {

    app.use(mutipart({uploadDir: './public/imgs'}));

    //用户主页
    app.get('/user_all', function (req, res) {

        var arg = {};
        User.getAll(arg, function (err, users) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('./user_all', {
                users: users,
                user: req.session.user,
            });
        });
    });

    //新增用户主页
    app.get('/user_new', function (req, res) {
        res.render('./user_new', {
            user: req.session.user,
        });
    });

    //实现新增用户功能
    app.post('/user/add', mutipartMiddeware, function (req, res) {
        console.log(req.body);
        var pwd = req.body.pwd;
        var mobilephone = req.body.mobilephone;
        var nickname = req.body.nickname;
        var sex = req.body.sex;
        var image = "";
        console.log(req.files);
        if (req.files && req.files != undefined && req.files.image && req.files.image != undefined && req.files.image.path && req.files.image.path != undefined) {
            image = req.files.image.path;
        }

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
                    nickname: req.body.nickname,
                    sex: req.body.sex,
                    head: image,
                    salt: salt,
                    hash: hash,
                });
                console.log("-newUser" + newUser);
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
            });

        });
    });

    //实现修改用户信息功能


};

function checkUserIsLogin(req, res, next) {
    if (req.session.user == null) {
        req.flash('error', '用户尚未登录!');
        res.redirect('/login'); //返回登录页面
    }
    next();
}
function checkUserIsNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '用户已经登录!');
        res.redirect('back'); //返回之前页面
    }
    next();
}
