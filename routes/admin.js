var express = require('express');
var crypto = require('crypto');
var Admin = require('../models/admin');

module.exports = function (app) {
    //主页
    app.get('/admin', checkUserIsLogin);
    app.get('/admin', function (req, res) {
        res.render('index', {
            title: '主页',
            success: req.flash('success').toString(),
            warning: req.flash('warning').toString(),
            error: req.flash('error').toString(),
            user: req.session.user,
        });
    });
    //注册
    app.get('/reg', checkUserIsNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '用户注册',
            success: req.flash('success').toString(),
            warning: req.flash('warning').toString(),
            error: req.flash('error').toString(),
        });
    });

    //注册
    app.post('/reg', checkUserIsNotLogin);
    app.post('/reg', function (req, res) {
        var username = req.body.username,
            password = req.body.password,
            password_repeat = req.body.password_repeat;
        //对用户名是否为空进行判断
        if (!username) {
            req.flash('warning', '请输入用户名!');
            return res.redirect('/reg'); //返回注册页面
        }
        //对邮箱格式进行检测
        var myReg = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/;
        var email = req.body.email;
        if (!myReg.test(email)) {
            req.flash('warning', '请检查你的邮箱格式!');
            return res.redirect('/reg'); //返回注册页面
        }
        //检测两次输入的密码是否相同
        if (password_repeat != password) {
            req.flash('warning', '两次输入的密码不一致!');
            return res.redirect('/reg'); //返回注册页面
        }
        //是否同意条款
        var rules = req.body.agree_rules;
        if (!rules) {
            req.flash('warning', '必须同意相关条款!');
            return res.redirect('/reg'); //返回注册页面
        }
        //生成MD5值
        var md5 = crypto.createHash('MD5');
        var password = md5.update(req.body.password).digest('hex');
        var newAdmin = new Admin({
            username: req.body.username,
            email: req.body.email,
            password: password,
            active: false,
            superadmin: false,
            introduction: '',
        });
        Admin.get(newAdmin.username, function (err, admin) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/admin');
            }
            if (admin) {
                req.flash('error', '用户名已经存在!');
                return res.redirect('/reg'); //返回注册页面
            }
            newAdmin.save(function (err, admin) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg'); //返回注册页面
                }
                return res.redirect('/login');
            });
        });
    });
    //登录
    app.get('/login', checkUserIsNotLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '用户登录',
            success: req.flash('success').toString(),
            warning: req.flash('warning').toString(),
            error: req.flash('error').toString(),
        });
    });
    //登录
    app.post('/login', checkUserIsNotLogin);
    app.post('/login', function (req, res) {
        var md5 = crypto.createHash('MD5');
        var password = md5.update(req.body.password).digest('hex');
        Admin.get(req.body.username, function (err, admin) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/admin');
            }
            if (!admin) {
                req.flash('error', '用户名或密码错误!');
                return res.redirect('/login'); //返回登录页面
            }
            //检查密码是否相同
            if (admin.password != password) {
                req.flash('error', '用户名或密码错误!');
                return res.redirect('/login'); //返回登录页面
            }
            if (!admin.active) {
                req.flash('error', '你的账号就没有激活好不好!');
                return res.redirect('/login'); //返回登录页面
            }
            if(admin.active){
                req.session.user = admin;
                req.flash('success', '登录成功!');
                res.render('index', {
                    title: '主页',
                    success: req.flash('success').toString(),
                    warning: req.flash('warning').toString(),
                    error: req.flash('error').toString(),
                    user: req.session.user,
                });
            }
        });
    });

    //注销用户
    app.get('/logout', function (req, res) {
        req.session.user = null;
        res.redirect('/login');
    });

    //获取用户所有数据
    app.get('/admin_all', function (req, res) {
        var agus = {};
        Admin.getAll(agus, function (err, admins) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/admin');
            }
            res.render('./admin_all', {
                admins: admins,
                user: req.session.user,
            });
        });
    });

    //删除一个用户
    app.post('/admin/delete', function (req, res) {
        var username = req.body.username;
        var arg = {};
        result = 'ok';
        status = 200;
        Admin.delAdminByName(username, function (err, adminId) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/admin');
            }
            res.send({
                status: status,
                data: result,
                message: ''
            })
        });
    });
    //管理员信息修改页
    app.get('/admin/:username/updater', function (req, res) {
        var username = req.params.username;
        Admin.get(username, function (err, admin) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/admin');
            }
            res.render('./admin_update', {
                admin: admin,
                user: req.session.user,
            });
        });
    });
    //实现用户信息修改保存功能
    app.post('/admin/updater', function (req, res) {
        var arg = {};
        var password = req.body.password;
        //对邮箱格式进行检测
        var myReg = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/;
        var email = req.body.email;
        if (!myReg.test(email)) {
            req.flash('warning', '请检查你的邮箱格式!');
            return res.redirect('/reg'); //返回注册页面
        }
        //生成MD5值
        var md5 = crypto.createHash('MD5');
        var password = md5.update(req.body.password).digest('hex');

        function trim(s) {
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }

        var introduction = trim(req.body.introduction);
        var newAdmin = new Admin({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            active: req.body.active,
            superadmin: req.body.superadmin,
            introduction: introduction,
        });
        Admin.adminUpdater(newAdmin.username, newAdmin, function (err, admin) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/admin');
            }
            Admin.getAll(arg, function (err1, admins) {
                if (err1) {
                    req.flash('error', err1);
                    return res.redirect('/admin');
                }
                res.render('./admin_all', {
                    admins: admins,
                    user: req.session.user,
                });
            });
        });
    });
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
