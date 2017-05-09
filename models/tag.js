var mongoose = require('../models/db');

var tagSchema = new mongoose.Schema({
    tagname: String,
    tagcontent:String,
    questionId:String,
}, {
    collection: 'tags'
});

var tagModel = mongoose.model('Tag', tagSchema);

function Tag(tag) {
    this.tagname = tag.tagname;
    this.tagcontent = tag.tagcontent;
    this.questionId = tag.questionId;
}

Tag.prototype.save = function(cb) {
    var tag = {
        tagname: this.tagname,
        tagcontent:this.tagcontent,
        questionId:this.questionId,
    };

    var newTag = new tagModel(tag);

    newTag.save(function(err, tag) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, tag);
    });
};

//获取所有的标签
Tag.getAll = function(query,cb) {
    var query = {};
    tagModel.find(query,function (err,tag) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, tag);
    });
};
//通过id获取单独一个标签
Tag.getTagById = function(tagId, cb) {
    tagModel.findOne({
        _id: tagId
    }, function(err, tag) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, tag);
    });
};
//通过Id删除指定的标签
Tag.delTagById = function (tagId,cb) {
    tagModel.remove({
        "_id": tagId
    }, function(err, tagId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, tagId);
    });
};
//修改指定标签的内容
Tag.tagUpdater = function (tagId,tagname,tagcontent,cb) {
    tagModel.update(
        {"_id": tagId},{$set:{'tagname':tagname,'tagcontent':tagcontent}}
        , function(err, tag) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, tag);
        });
};
module.exports = Tag;
