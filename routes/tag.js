var express = require('express');
var Tag = require('../models/tag');

module.exports = function (app) {
    //标签页
    app.get('/tags', checkUserIsLogin);
    app.get('/tags', function (req, res) {
        Tag.getAll({}, function (err, tags) {
            if (err) {
                req.fresh('error', err);
                return res.redirect('/error'); //跳转至错误页面
            }
            res.render('./tags', {
                tags: tags,
                user: req.session.user,
            })
        });
    });
    //对标签内容进行保存
    app.get('/tag/save', checkUserIsLogin);
    app.post('/tag/save', function (req, res) {
        result = 'ok';
        status = 200;
        var newTag = new Tag({
            tagname: req.body.tagname,
            tagcontent: req.body.tagcontent,
            questionId:req.body.questionId,
        });
        newTag.save(function (err, tag) {
            if (err) {
                req.flash('error', err);
                return res.redirect('./error');
            }
            res.send({
                status: status,
                data: result,
                message: ''
            })
        });
    });
    //实现标签的删除功能
    app.get('/tag/delete', checkUserIsLogin);
    app.post('/tag/delete', function (req, res) {
        result = 'ok';
        status = 200;
        var tagId = req.body.tagId;
        Tag.delTagById(tagId, function (err, tagId) {
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
    //实现标签修改功能
    app.get('/tag/update', checkUserIsLogin);
    app.post('/tag/update', function (req, res) {
        result = 'ok';
        status = 200;
        var tagId = req.body.tagId;
        var tagcontent = req.body.tagcontent;
        var tagname = req.body.tagname;
        Tag.tagUpdater(tagId, tagname, tagcontent, function (err, tag) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.send({
                status: status,
                data: result,
                message: ''
            })
        })
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


