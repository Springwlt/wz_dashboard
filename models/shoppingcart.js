var mongoose = require('../models/db');

var shoppingCartSchema = new mongoose.Schema({
    userId: String,
    elementId: String,
    count:Number,
    category: String,     //商品分类
    caption: String,      //商品名称
    description: String,       //商品详情
    endDate: String,      //结束日前
    vender:String,
    authenticated:Boolean,
    price: Number,
    region:String,       //地区
    pictureOne:String,
    pictureTwo:String,
    pictureThree:String,

}, {
    collection: 'shoppingcarts'
});

var shoppingCartModel = mongoose.model('ShoppingCart', shoppingCartSchema);

function ShoppingCart(shoppingCart) {
    this.userId = shoppingCart.userId;
    this.elementId = shoppingCart.elementId;
    this.count = shoppingCart.count;
    this.category = shoppingCart.category;
    this.caption = shoppingCart.caption;
    this.description = shoppingCart.description;
    this.endDate = shoppingCart.endDate;
    this.vender = shoppingCart.vender;
    this.authenticated = shoppingCart.authenticated;
    this.price = shoppingCart.price;
    this.region = shoppingCart.region;
    this.pictureOne = shoppingCart.pictureOne;
    this.pictureTwo = shoppingCart.pictureTwo;
    this.pictureThree = shoppingCart.pictureThree;

}

ShoppingCart.prototype.save = function (cb) {
    var shoppingCart = {
        userId: this.userId,
        elementId: this.elementId,
        count:this.count,
        category:this.category,
        caption:this.caption,
        description:this.description,
        endDate:this.endDate,
        vender:this.vender,
        authenticated:this.authenticated,
        price:this.price,
        region:this.region,
        pictureOne:this.pictureOne,
        pictureTwo:this.pictureTwo,
        pictureThree:this.pictureThree,
    };

    var newShoppingCart = new shoppingCartModel(shoppingCart);

    newShoppingCart.save(function (err, shoppingCart) {
        if (err) {
            return cb(err);
        }
        cb(null, shoppingCart);
    });
};

//获取购物车内所有商品
ShoppingCart.getAll = function (query, cb) {
    var query = {};
    shoppingCartModel.find(query, function (err, shoppingCart) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, shoppingCart);
    });
};

//获取购物车内所有商品
ShoppingCart.getAlls = function (query, cb) {
    shoppingCartModel.find(query, function (err, shoppingCart) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, shoppingCart);
    });
};


//通过id获取一个商品
ShoppingCart.getShoppingCartById = function (shoppingCartId, cb) {
    shoppingCartModel.findOne({
        elementId: shoppingCartId
    }, function (err, shoppingCart) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, shoppingCart);
    });
};

//通过ID获取某个商品
ShoppingCart.getItemById = function (itemId, cb) {
    shoppingCartModel.findOne({
        _id: itemId
    }, function (err, itme) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, itme);
    });
};


//通过Id删除指定的商品
ShoppingCart.delShoppingCartById = function (shoppingCartId, cb) {
    shoppingCartModel.remove({
        "_id": shoppingCartId
    }, function (err, shoppingCartId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, shoppingCartId);
    });
};

//通过Id删除指定的商品
ShoppingCart.delShoppingsCartById = function (query, cb) {
    shoppingCartModel.remove(query, function (err, shoppingCartId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, shoppingCartId);
    });
};

//修改特定购物车的内容
ShoppingCart.shoppingCartUpdater = function (Id, count, cb) {
    shoppingCartModel.update(
        {"_id": Id}, {$set: {'count': count}}
        , function (err, goods) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, goods);
        });
};

//修改特定购物车的内容
ShoppingCart.shoppingCartUpdaterById = function (goodsId, count, cb) {
    shoppingCartModel.update(
        {"_id": goodsId}, {$set: {'count': count}}
        , function (err, goods) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, goods);
        });
};

//删除商品
ShoppingCart.delShoppingCartById = function (goodsId,cb) {
    shoppingCartModel.remove({
        "_id": goodsId
    }, function(err, goodsId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, goodsId);
    });
};



module.exports = ShoppingCart;

