var express = require('express');
var Question = require('../models/question');
var Supervisor = require('../models/supervisor');
var Answer = require('../models/answer');
var Admin = require('../models/admin');

module.exports = function (app) {
    //创建新话题
    app.get('/question_new', checkUserIsLogin);
    app.get('/question_new', function (req, res) {
        var arg = {};
        Supervisor.getAll(arg, function (err, supervisors) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('./question_new', {
                supervisors: supervisors,
                user: req.session.user,
            });
        });
    });
    //保存普通提问
    app.get('/question/save/ordinary', checkUserIsLogin);
    app.post('/question/save/ordinary', function (req, res) {
        result = 'ok';
        status = 200;
        var time = new Date().format("yyyy-MM-dd hh:mm:ss");
        var newQuestion = new Question({
            questionCreator: '张志和',
            questionContent: req.body.questionContent,
            questionResponden: req.body.questionResponden,
            questionCreateDate: time,
            questionUpdaterDate: 'questionResponden',
            type: 'ordinal',
            objectId: req.body.objectId,
        });

        newQuestion.save(function (err1, question) {
            if (err1) {
                req.flash('error', err1);
                return res.redirect('./error');
            }
            res.send({
                status: status,
                data: result,
                message: ''
            })
        });
    });
    //保存快速提问
    app.get('/question/save/fast', checkUserIsLogin);
    app.post('/question/save/fast', function (req, res) {
        result = 'ok';
        status = 200;
        var time = new Date().format("yyyy-MM-dd hh:mm:ss");
        var newQuestion = new Question({
            questionCreator: '张小明',
            questionContent: req.body.questionContent,
            questionResponden: req.body.questionResponden,
            questionCreateDate: time,
            questionUpdaterDate: null,
            type: 'fast',
            objectId: req.body.objectId,
        });
        newQuestion.save(function (err1, question) {
            if (err1) {
                req.flash('error', err1);
                return res.redirect('./error');
            }
            res.send({
                status: status,
                data: result,
                message: ''
            })
        });
    });
    //所有问起
    app.get('/question_all', checkUserIsLogin);
    app.get('/question_all', function (req, res) {
        getData(req, res, function (datas) {
            res.render('./question_all', {
                datas: datas,
                user: req.session.user,
            });
        })
    });
    function getData(req, res, cb) {
        var datas = [];
        var arg = {};
        Question.getAll(arg, function (err, questions) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }

            Answer.getAll(arg, function (err, answer) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                for (var i = 0; i < questions.length; i++) {
                    datas.push({
                        question: questions[i],
                        answer: isExistAnswer(questions[i]._id, answer),
                    })

                }
                res.render('./question_all', {
                    datas: datas,
                    user: req.session.user,
                });
            });

        });
        function isExistAnswer(id, answer) {
            var result;
            for (var i = 0; i < answer.length; i++) {
                if (answer[i].questionId == id) {
                    result = answer[i];
                } else {
                    result;
                }
            }
            return result;
        }

        //对question添加评论
        app.get('/question/:questionId/edit', checkUserIsLogin);
        app.get('/question/:questionId/edit', function (req, res) {
            var questionId = req.params.questionId;
            Question.getQuestionById(questionId, function (err, question) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                Answer.get(questionId, function (err1, answers) {
                    if (err1) {
                        req.flash('error', err1);
                        return res.redirect('/');
                    }
                    res.render('./answer_new', {
                        question: question,
                        answers: answers
                    });

                });
            });
        });
        //对评论内容进行保存
        app.get('/answer/save', checkUserIsLogin);
        app.post('/answer/save', function (req, res) {
            result = 'ok';
            status = 200;
            var questionId = req.body.questionId;
            var time = new Date().format("yyyy-MM-dd hh:mm:ss");
            var responden = {
                supervisor: req.session.user.username,
                respondenContent: req.body.respondenContent,
                time:time
            };
            var newAnswer = new Answer({
                questionId: req.body.questionId,
                respondenContent: responden,
                answerCreateDate: new Date(),
                answerUpdaterDate: null,
            });
            Answer.get(questionId, function (err, answer) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                if (answer) {
                    var newRespondenContent = [];
                    newRespondenContent = answer.respondenContent;
                    newRespondenContent.push(responden);
                    Answer.answerUpdater(questionId, newRespondenContent, function (err, answer1) {
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
                } else {
                    newAnswer.save(function (err, answer2) {
                        if (err) {
                            req.flash('error', err);
                            return res.redirect('/reg'); //返回注册页面
                        }
                        res.send({
                            status: status,
                            data: result,
                            message: ''
                        })
                    });
                }
            });
        });
    }
    //需要修改的内容
    app.get('/question/:questionId/updater', checkUserIsLogin);
    app.get('/question/:questionId/updater', function (req, res) {
        var questionId = req.params.questionId;
        var arg = {};
        Question.getQuestionById(questionId, function (err, question) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            Supervisor.getAll(arg, function (err, supervisors) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('./question_update', {
                    question: question,
                    supervisors:supervisors,
                    user: req.session.user,
                });
            });
        });
    });
    //对修改内容进行保存
    app.get('/question/update', checkUserIsLogin);
    app.post('/question/update', function (req, res) {
        var arg = {};
        var time = new Date().format("yyyy-MM-dd hh:mm:ss");
        var questionContent = trim(req.body.questionContent);
        var questionId = req.body.questionId;
        var newQuestion = new Question({
            questionContent: questionContent,
            questionUpdaterDate: time,
            questionResponden:req.body.questionResponden,

        });
       Question.questionUpdater(questionId, newQuestion, function (err,question) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            getData(req, res, function (datas) {
                res.render('./question_all', {
                    datas: datas
                });
            })
        });
    });
    //删除某个问题
    app.get('/question/delete', checkUserIsLogin);
    app.post('/question/delete', function (req, res) {
        var questionId = req.body.questionId;
        var arg = {};
        result = 'ok';
        status = 200;
        Question.delQuestionById(questionId, function (err, questionId) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.send({
                status: status,
                data: result,
                message: ''
            });
        });
        Answer.delAnswerById(questionId, function (err, answerId) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
        });
    });

    function trim(s){
        return s.replace(/(^\s*)|(\s*$)/g, "");
    }
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
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

