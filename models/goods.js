var mongoose = require('../models/db');

var goodsSchema = new mongoose.Schema({
    category: String,     //商品分类
    caption: String,      //商品名称
    description: String,       //商品详情
    endDate: String,      //结束日前
    vender:String,
    authenticated:Boolean,
    price: Number,
    region:String,       //地区
    discount:String,
    pictureOne:String,
    pictureTwo:String,
    pictureThree:String,
    type:String,
}, {
    collection: 'goods'
});

var goodsModel = mongoose.model('Goods', goodsSchema);

function Goods(goods) {
    this.category = goods.category,
    this.caption = goods.caption,
    this.description = goods.description,
    this.endDate = goods.endDate,
    this.vender = goods.vender,
    this.authenticated = goods.authenticated;
    this.price = goods.price,
    this.region = goods.region,
    this.discount = goods.discount,
    this.pictureOne = goods.pictureOne,
    this.pictureTwo = goods.pictureTwo,
    this.pictureThree = goods.pictureThree,
    this.type = goods.type
}

Goods.prototype.save = function (cb) {
    var goods = {
        category: this.category,
        caption: this.caption,
        description: this.description,
        endDate: this.endDate,
        vender: this.vender,
        authenticated:this.authenticated,
        price: this.price,
        picture:this.picture,
        region:this.region,
        discount:this.discount,
        pictureOne:this.pictureOne,
        pictureTwo:this.pictureTwo,
        pictureThree:this.pictureThree,
        type:this.type
    };

    var newGoods = new goodsModel(goods);

    newGoods.save(function (err, goods) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, goods);
    });
};

//获取所有商品
Goods.getAll = function (query, cb) {
    var query = {};
    goodsModel.find(query, function (err, goods) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, goods);
    });
};

//商品某个商品
Goods.getGoodsById = function (goodsId, cb) {
    goodsModel.findOne({
        _id: goodsId
    }, function (err, goods) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, goods);
    });
};

//删除某个商品
Goods.delGoodsById = function (goodsId, cb) {
    goodsModel.remove({
        "_id": goodsId
    }, function (err, goodsId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, goodsId);
    });
};

//修改商品的信息
Goods.goodsUpdater = function (goodsId, category, caption, describe, endDate, prince, cb) {
    goodsModel.update(
        {"_id": goodsId}, {
            $set: {
                'category': category,
                'caption': caption,
                'describe': describe,
                'endDate': endDate,
                'prince': prince
            }
        }
        , function (err, goods) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, goods);
        });
};
module.exports = Goods;

