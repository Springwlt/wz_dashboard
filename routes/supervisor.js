var express = require('express');
var Supervisor = require('../models/supervisor');

module.exports = function (app) {
    app.get('/supervisor_new', checkUserIsLogin);
    app.get('/supervisor_new', function (req, res) {
        res.render('./supervisor_new',{
            user: req.session.user
        });
    });

    app.get('/supervisor/add', checkUserIsLogin);
    app.post('/supervisor/add', function (req, res) {
        Date.prototype.format = function(fmt) {
            var o = {
                "M+" : this.getMonth()+1,                 //月份
                "d+" : this.getDate(),                    //日
                "h+" : this.getHours(),                   //小时
                "m+" : this.getMinutes(),                 //分
                "s+" : this.getSeconds(),                 //秒
                "q+" : Math.floor((this.getMonth()+3)/3), //季度
                "S"  : this.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
            return fmt;
        };
        function trim(s){
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }

        var brief = trim(req.body.brief);
        var description = trim(req.body.description);
        var time1 = new Date().format("yyyy-MM-dd hh:mm:ss");
        var newSupervisor = new Supervisor({
            objectId:req.body.objectId,
            nickname: req.body.nickname,
            reward:req.body.reward,
            brief:brief,
            tag:req.body.tag,
            description:description,
            answerNum: '',
            createdAt: time1,
            updatedAt: '',
        });
        Supervisor.get(newSupervisor.objectId, function (err, supervisor) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if (supervisor) {
                req.flash('error', '输入错误，此专家已经存在!');
                return res.redirect('./error'); //返回错误页面
            }
            newSupervisor.save(function (err1,supervisor1) {
                if (err1) {
                    req.flash('error', err1);
                    return res.redirect('/reg');
                }
                return res.redirect('/supervisor_all');
            });
        });
    });

    app.get('/supervisor_all', checkUserIsLogin);
    app.get('/supervisor_all', function (req, res) {
        var arg = {};
        Supervisor.getAll(arg, function (err, supervisors) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('./supervisor_all', {
                supervisors: supervisors,
                user: req.session.user,
            });
        });
    });

    app.get('/supervisor/:objectId/updater', checkUserIsLogin);
    app.get('/supervisor/:objectId/updater', function (req, res) {
        var objectId = req.params.objectId;
        Supervisor.get(objectId, function (err, supervisor) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('./supervisor_update', {
                supervisor: supervisor,
                user: req.session.user,
            });
        });
    });
    //专家信息修改功能
    app.get('/supervisor/updater', checkUserIsLogin);
    app.post('/supervisor/updater', function (req, res) {
        var arg = {};
        Date.prototype.format = function(fmt) {
            var o = {
                "M+" : this.getMonth()+1,                 //月份
                "d+" : this.getDate(),                    //日
                "h+" : this.getHours(),                   //小时
                "m+" : this.getMinutes(),                 //分
                "s+" : this.getSeconds(),                 //秒
                "q+" : Math.floor((this.getMonth()+3)/3), //季度
                "S"  : this.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
            return fmt;
        };
        function trim(s){
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }
        var brief = trim(req.body.brief);
        var description = trim(req.body.description);
        var time2 = new Date().format("yyyy-MM-dd hh:mm:ss");
        var newSupervisor = new Supervisor({
            objectId:req.body.objectId,
            nickname: req.body.nickname,
            reward:req.body.reward,
            brief:brief,
            tag:req.body.tag,
            description:description,
            updatedAt: time2,
        });
        Supervisor.supervisorUpdater(newSupervisor.objectId, newSupervisor, function (err, supervisor) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            Supervisor.getAll(arg, function (err1, supervisors) {
                if (err1) {
                    req.flash('error', err1);
                    return res.redirect('/');
                }
                res.render('./supervisor_all', {
                    supervisors: supervisors,
                    user: req.session.user,
                });
            });
        });
    });

    app.get('/supervisor/delete', checkUserIsLogin);
    app.post('/supervisor/delete', function (req, res) {
        var objectId = req.body.objectId;
        var arg = {};
        result = 'ok';
        status = 200;
        Supervisor.delSupervisorById(objectId, function (err, supervisorId) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.send({
                status: status,
                data: result,
                message: ''
            })
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

