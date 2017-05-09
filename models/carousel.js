var mongoose = require('../models/db');

var carouselSchema = new mongoose.Schema({
    picture:String,
}, {
    collection: 'carousels'
});

var carouselModel = mongoose.model('Carousel', carouselSchema);

function Carousel(carousel) {
    this.picture = carousel.picture
}

Carousel.prototype.save = function (cb) {
    var carousel = {
        picture:this.picture
    };

    var newCarousel = new carouselModel(carousel);

    newCarousel.save(function (err, doc) {
        if (err) {
            return cb(err);
        }
        cb(null, doc);
    });
};

Carousel.getAll = function (cb) {
    var query = {};
    carouselModel.find(query, function (err, doc) {
        if (err) {
            return cb(err);
        }
        cb(null, doc);
    });
};

module.exports = Carousel;



