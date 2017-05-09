var mongoose = require('../models/db');

var orderSchema = new mongoose.Schema({
    userId: String,           //用户ID
    objectId: String,        //商品ID
    category: String,         //商品分类
    caption: String,          //商品名称
    description: String,      //商品详情
    endDate: String,          //结束日前
    vender: String,            //认证方式
    authenticated: Boolean,    //认证方式
    totalprice: Number,      //总价
    region: String,            //地区
    state: String,            // 1.代付款。2.交易关闭。3.交易成功
    addressId: String,         //地址
    createdDate: String,       //下单时间
    pictureOne: String,        //图片一
    pictureTwo: String,        //图片二
    pictureThree: String,      //图片三
}, {
    collection: 'orders'
});

var orderModel = mongoose.model('Order', orderSchema);

function Order(order) {
    this.userId = order.userId;
    this.objectId = order.objectId;
    this.category = order.category;
    this.caption = order.caption;
    this.description = order.description;
    this.endDate = order.endDate;
    this.vender = order.vender;
    this.authenticated = order.authenticated;
    this.totalprice = order.totalprice;
    this.region = order.region;
    this.state = order.state;
    this.addressId = order.addressId;
    this.createdDate = order.createdDate;
    this.pictureOne = order.pictureOne;
    this.pictureTwo = order.pictureTwo;
    this.pictureThree = order.pictureThree;

}

Order.prototype.save = function (cb) {
    var order = {
        userId: this.userId,
        objectId: this.objectId,
        category: this.category,
        caption: this.caption,
        description: this.description,
        endDate: this.endDate,
        vender: this.vender,
        authenticated: this.authenticated,
        totalprice: this.totalprice,
        region: this.region,
        state: this.state,
        addressId: this.addressId,
        createdDate: this.createdDate,
        pictureOne: this.pictureOne,
        pictureTwo: this.pictureTwo,
        pictureTwo: this.pictureThree,
    };

    var newOrder = new orderModel(order);

    newOrder.save(function (err, order) {
        if (err) {
            return cb(err);
        }
        cb(null, order);
    });
};

//获取所有订单
Order.getAll = function (query, cb) {
    var query = {};
    orderModel.find(query, function (err, order) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, order);
    });
};

Order.getAlls = function (query, cb) {
    orderModel.find(query, function (err, order) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, order);
    });
};

//获取某个订单
Order.getOrderById = function (orderId, cb) {
    orderModel.findOne({
        _id: orderId
    }, function (err, orderId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, orderId);
    });
};

//删除商品
Order.delOrderById = function (goodsId, cb) {
    orderModel.remove({
        "_id": goodsId
    }, function (err, goodsId) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, goodsId);
    });
};

//修改订单的付款状态
Order.changeState = function (orderId,state,cb) {
    orderModel.update(
        {"_id": orderId}, {
            $set: {
                'state': state
            }
        }
        , function (err, doc) {
            if (err) {
                return cb(err); //错误，返回错误信息
            }
            cb(null, doc);
        });
};


Order.saveArray = function (array, cb) {
    orderModel.collection.insert(array, function(err, arr) {
        if (err) {
            return cb(err); //错误，返回错误信息
        }
        cb(null, arr);
    });
};

module.exports = Order;
