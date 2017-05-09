var mongoose = require('../models/db');

var questionSchema = new mongoose.Schema({
    questionCreator: String,
    questionContent:String,
    questionResponden:[],
    questionCreateDate:String,
    questionUpdaterDate: String,
    type:String,
    objectId:String
}, {
    collection: 'questions'
});

var questionModel = mongoose.model('Question', questionSchema);

function Question(question) {
    this.questionCreator = question.questionCreator;
    this.questionContent = question.questionContent;
    this.questionResponden = question.questionResponden;
    this.questionCreateDate = question.questionCreateDate;
    this.questionUpdaterDate = question.questionUpdaterDate;
    this.type = question.type;
    this.objectId = question.objectId;

}

Question.prototype.save = function(cb) {
    var question = {
        questionCreator: this.questionCreator,
        questionContent:this.questionContent,
        questionResponden: this.questionResponden,
        questionCreateDate:this.questionCreateDate,
        questionUpdaterDate:this.questionUpdaterDate,
        type:this.type,
        objectId:this.objectId,
    };
    var newQuestion = new questionModel(question);

    newQuestion.save(function(err, question) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, question);
    });
};
//查询某个用户下所有的问起
Question.get = function(questionCreator, cb) {
    questionModel.findOne({
        questionCreator: questionCreator
    }, function(err, questions) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, questions);
    });
};
//查询某一个问起
Question.getQuestionById = function(questionId, cb) {
    questionModel.findOne({
        _id: questionId
    }, function(err, question) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, question);
    });
};

//查询数据库中所有的问起
Question.getAll = function(query,cb) {
    var query = {};
    questionModel.find(query,function (err,question) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, question);
    });
};
Question.questionUpdater = function (questionId,question, cb) {
    questionModel.update(
        {_id: questionId}, {
            $set: {
                'questionContent': question.questionContent,
                'questionUpdaterDate':question.questionUpdaterDate,
                'questionResponden':question.questionResponden
            }
        }
        , function (err, question) {
            if (err) {
                return cb(err);
            }
            cb(null, question);
        });
};
//删除数据库中的某个问起
Question.delQuestionById = function (questionId, cb) {
    questionModel.remove({
        '_id': questionId
    }, function (err, questionId) {
        if (err) {
            return cb(err);
        }
        cb(null, questionId);
    });
};
module.exports = Question;
