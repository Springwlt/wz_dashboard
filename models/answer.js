var mongoose = require('../models/db');

var answerSchema = new mongoose.Schema({
    questionId: String,
    respondenContent: [],
    answerCreateDate: Date,
    answerUpdaterDate: Date,
}, {
    collection: 'answers'
});

var answerModel = mongoose.model('Answer', answerSchema);

function Answer(answer) {
    this.questionId = answer.questionId;
    this.respondenContent = answer.respondenContent;
    this.answerCreateDate = answer.answerCreateDate;
    this.answerUpdaterDate = answer.answerUpdaterDate;
}

Answer.prototype.save = function (cb) {
    var answer = {
        questionId: this.questionId,
        respondenContent: this.respondenContent,
        answerCreateDate: this.answerCreateDate,
        answerUpdaterDate: this.answerUpdaterDate
    };
    var newAnswer = new answerModel(answer);

    newAnswer.save(function (err, answer) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, answer);
    });
};
//查询某个用户下所有的问起
Answer.get = function (questionId, cb) {
    answerModel.findOne({
        questionId: questionId
    }, function (err, answer) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, answer);
    });
};
//查询所有的answer
Answer.getAll = function (query, cb) {
    var query = {};
    answerModel.find(query,function (err,answer) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, answer);
    });
};
//修改回复内容
Answer.answerUpdater = function (questionId, respondenContent, cb) {
    answerModel.update(
        {"questionId": questionId}, {$set: {'respondenContent': respondenContent}}
        , function (err, answer) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, answer);
        });
};
Answer.delAnswerById = function (questionId, cb) {
    answerModel.remove({
        "questionId": questionId
    }, function (err, questionId) {
        if (err) {
            return cb(err);
        }
        cb(null, questionId);
    });
};
module.exports = Answer;

