var mongoose = require('../models/db');

var commentsSchema = new mongoose.Schema({
    mobilephone: String,
    content:String,
    orderId:String,
    createTime:String,
}, {
    collection: 'comments'
});

var commentsModel = mongoose.model('Comments', commentsSchema);

function Comments(comments) {
    this.mobilephone = comments.mobilephone;
    this.content = comments.content;
    this.orderId = comments.orderId;
    this.createTime = comments.createTime;
}

Comments.prototype.save = function(cb) {
    var comments = {
        mobilephone: this.mobilephone,
        content:this.content,
        orderId:this.orderId,
        createTime:this.createTime,
    };

    var newComments = new commentsModel(comments);

    newComments.save(function(err, comments) {
        if (err) {
            return cb(err);
        }
        cb(null, comments);
    });
};


Comments.getAll = function(query,cb) {
    commentsModel.find(query,function (err,comments) {
        if (err) {
            return cb(err);
        }
        cb(null, comments);
    });
};

module.exports = Comments;

