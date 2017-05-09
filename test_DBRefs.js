var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test');

var User = mongoose.model('User', {
    username: String,
});

var News = mongoose.model('News', {
    title: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

var user = new User({
    username: 'Sid'
});

var news = new News({
    title: 'Congratulation!',
    author: user
});

user.save(function(err) {
    if (err) {
        return console.log(err);
    }

    news.save(function(err) {
        if (err) {
            return console.log(err);
        }

        News.findOne().populate('author').exec(function(err, doc) {
            console.log(doc);
        });
    });
});