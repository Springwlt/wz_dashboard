var mongoose = require('../models/db');

var supervisorSchema = new mongoose.Schema({
    objectId:String,
    userId:String,
    nickname: String,
    reward:String,
    brief:String,   //短简介
    tag:String,
    description:String,   //长简介
    answerNum: Number,
    createdAt: String,
    updatedAt: String,
}, {
    collection: 'supervisor'
});

var supervisorModel = mongoose.model('Supervisor', supervisorSchema);

function Supervisor(supervisor) {
    this.objectId = supervisor.objectId;
    this.userId = supervisor.userId;
    this.nickname = supervisor.nickname;
    this.reward = supervisor.reward;
    this.brief = supervisor.brief;
    this.tag = supervisor.tag;
    this.description = supervisor.description;
    this.answerNum = supervisor.answerNum;
    this.createdAt = supervisor.createdAt;
    this.updatedAt = supervisor.updatedAt;
}

Supervisor.prototype.save = function (cb) {
    var supervisor = {
        objectId:this.objectId,
        userId:this.userId,
        nickname:this.nickname ,
        reward:this.reward,
        brief:this.brief,
        tag:this.tag,
        description:this.description,
        answerNum:this.answerNum,
        createdAt:this.createdAt,
        updatedAt:this.updatedAt,
    };
    var newSupervisor = new supervisorModel(supervisor);

    newSupervisor.save(function (err, supervisor) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, supervisor);
    });
};

Supervisor.get = function (objectId, cb) {
    supervisorModel.findOne({
        objectId: objectId
    }, function (err, supervisor) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, supervisor);
    });
};
Supervisor.getAll = function (query, cb) {
    var query = {};
    supervisorModel.find(query,function (err,supervisor) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, supervisor);
    });
};

Supervisor.supervisorUpdater = function (objectId, supervisor, cb) {
    supervisorModel.update(
        {"objectId": objectId}, {
            $set: {
                'nickname': supervisor.nickname,
                'reward': supervisor.reward,
                'brief': supervisor.brief,
                'tag': supervisor.tag,
                'description': supervisor.description,
                'updatedAt':supervisor.updatedAt
            }
        }
        , function (err, supervisor) {
            if (err) {
                return cb(err);
            }
            cb(null, supervisor);
        });
};

Supervisor.delSupervisorById = function (objectId, cb) {
    supervisorModel.remove({
        "objectId": objectId
    }, function (err, supervisorId) {
        if (err) {
            return cb(err);
        }
        cb(null, supervisorId);
    });
};
module.exports = Supervisor;


