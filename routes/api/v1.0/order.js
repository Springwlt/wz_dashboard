var express = require('express');
var apiRoutes = express.Router();
var User = require('../../../models/user');
var ShoppingCart = require('../../../models/shoppingcart');
var Comments = require('../../../models/comments');
var Address = require('../../../models/address');
var jwt = require('jsonwebtoken');
var secret = require('../../../config/secret');
var crypto = require('crypto');
var tokenManager = require('../../../config/token_manager.js');
var Goods = require('../../../models/goods');
var Order = require('../../../models/order');
var redis = require("redis");
var client = redis.createClient();
var mutipart = require('connect-multiparty');
var mutipartMiddeware = mutipart();

module.exports = function (app) {

    app.use(mutipart({uploadDir: './public/imgs'}));
    app.use('/api/v1.0', apiRoutes);

    //添加商品
    apiRoutes.post('/order/shoppingcart_add', function (req, res) {
        console.log('-interface: /api/v1.0/order/shoppingcart_add');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        console.log(req.body);
        var token = req.body.token || '';
        var objectId = req.body.objectId || '';

        if (!token || !objectId) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }

        console.log('-token: ' + token);
        console.log('-objectId: ' + objectId);
        var user = jwt.decode(token);
        if (!user) {
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        console.log('-userId: ' + userIdString);
        var arg = {userId: userId, elementId: objectId};
        var conditions = {userId: userId};
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                ShoppingCart.getAlls(arg, function (err, shoppingCart) {
                    if (err) {
                        return res.json(err);
                    }
                    console.log(shoppingCart);
                    if (shoppingCart.length > 0) {
                        var count = shoppingCart[0].count;
                        var resultCount = count + 1;
                        ShoppingCart.shoppingCartUpdater(shoppingCart[0]._id, resultCount, function (err, shoppingCart) {
                            if (err) {
                                return res.json(err1);
                            }
                            console.log(shoppingCart);
                            getShoppingCartDate(conditions, res);

                        })
                    }
                    else if (shoppingCart.length == 0) {
                        Goods.getGoodsById(objectId, function (err1, goods) {
                            if (err1) {
                                return res.json(err1);
                            }
                            var newShoppingCart = new ShoppingCart({
                                userId: userIdString,
                                elementId: objectId,
                                count: '1',
                                category: goods.category,
                                caption: goods.caption,
                                description: goods.description,
                                endDate: goods.endDate,
                                vender: goods.vender,
                                authenticated: goods.authenticated,
                                price: goods.price,
                                region: goods.region,
                                pictureOne: goods.pictureOne,
                                pictureTwo: goods.pictureTwo,
                                pictureThree: goods.pictureThree,
                            });
                            newShoppingCart.save(function (err, shoppingCart) {
                                if (err) {
                                    return res.json(err);
                                }
                                getShoppingCartDate(conditions, res);
                            });
                        });
                    }
                })
            } else {
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //购物车商品列表
    apiRoutes.get('/order/shoppingcart_list', function (req, res) {
        console.log('-interface: /api/v1.0/order/shoppingcart_list');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var token = req.query.token || '';
        if (!token) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-token: ' + token);
        var user = jwt.decode(token);
        if (!user) {
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        console.log('-userId: ' + userIdString);
        var arg = {userId: userId};
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                console.log(reply);
                ShoppingCart.getAlls(arg, function (err, shoppingCart) {
                    if (err) {
                        req.json(err)
                    }
                    console.log('>success');
                    return res.json({
                        "errcode": 200,
                        "message": "获取购物车商品成功",
                        "data": shoppingCart,
                        "serverTime": getTimeStamp(),
                    });

                });

            } else {
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //修改商品数量
    apiRoutes.post('/order/shoppingcart_update', function (req, res) {
        console.log('-interface: /api/v1.0/order/shoppingcart_update');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        var objectId = req.body.objectId || '';
        var count = req.body.count || 0;
        var token = req.body.token || '';

        if (!objectId || !count || !token) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-token: ' + token);
        console.log('-objectId: ' + objectId);
        console.log('-count: ' + count);

        var user = jwt.decode(token);
        if (!user) {
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        console.log('-userId: ' + userIdString);
        var arg = {userId: userId};
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                ShoppingCart.shoppingCartUpdaterById(objectId, count, function (err1) {
                    if (err1) {
                        return res.json(err1);
                    }
                    ShoppingCart.getAlls(arg, function (err, shoppingCart) {
                        if (err) {
                            req.json(err)
                        }
                        console.log('>success');
                        return res.json({
                            "errcode": 200,
                            "message": "数量更新成功",
                            "data": shoppingCart,
                            "serverTime": getTimeStamp(),
                        });

                    });
                });

            } else {
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //删除商品
    apiRoutes.get('/order/shoppingcart_del', function (req, res) {
        console.log('-interface: /api/v1.0/order/shoppingcart_del');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var objectId = req.query.objectId || '';
        var token = req.query.token || '';
        if (!objectId || !token) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-token: ' + token);
        console.log('-objectId: ' + objectId);
        var user = jwt.decode(token);
        if (!user) {
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        console.log('-userId: ' + userIdString);
        var arg = {userId: userId};
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                ShoppingCart.delShoppingCartById(objectId, function (err1) {
                    if (err1) {
                        return res.json(err1);
                    }
                    ShoppingCart.getAll(arg, function (err, shoppingCart) {
                        if (err) {
                            req.json(err)
                        }
                        console.log('>success');
                        return res.json({
                            "errcode": 200,
                            "message": "删除成功",
                            "data": shoppingCart,
                            "serverTime": getTimeStamp(),
                        });

                    });
                })

            } else {
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //添加订单
    apiRoutes.post('/order/add', function (req, res) {
        console.log('-interface: /api/v1.0/order/add');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        var objectId = req.body.objectId || '';
        var token = req.body.token || '';
        var addressId = req.body.addressId || '';
        if (!token || !addressId || !objectId) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数1",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-token: ' + token);
        console.log('-objectId: ' + objectId);
        var user = jwt.decode(token);
        if (!user) {
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确2",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        var objectIdArray = [];
        console.log('-userId: ' + userIdString);
        var objectIds = objectId.indexOf(',');
        if (objectIds >= 0) {
            objectIdArray = objectId.split(",");
        }
        if (objectIds < 0) {
            objectIdArray.push(objectId);
        }
        var conditions = {'userId': userId};
        var arg = {'_id': {'$in': objectIdArray}};    //批量查询
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                var noRepeatUserOrder = [];
                ShoppingCart.getAlls(arg, function (err, doc) {
                    if (err) {
                        return res.json(err);
                    }
                    for (var i = 0; i < doc.length; i++) {
                        var totalprice = parseInt(doc[i].price) * parseInt(doc[i].count);
                        var time = new Date().format("yyyy-MM-dd hh:mm:ss");
                        var result = {
                            userId: userIdString,
                            objectId: doc[i].elementId,
                            category: doc[i].category,
                            caption: doc[i].caption,
                            description: doc[i].description,
                            endDate: doc[i].endDate,
                            vender: doc[i].vender,
                            authenticated: doc[i].authenticated,
                            totalprice: totalprice,
                            region: doc[i].region,
                            addressId: addressId,
                            state: 0,
                            createdDate: time,
                            pictureOne: doc[i].pictureOne,
                            pictureTwo: doc[i].pictureTwo,
                            pictureThree: doc[i].pictureThree,
                        };
                        noRepeatUserOrder.push(result);
                    }
                    Order.saveArray(noRepeatUserOrder, function (err1, order) {
                        if (err1) {
                            return res.json(err1);
                        }
                        var number = objectIdArray.length;
                        if (number == 1) {
                            ShoppingCart.delShoppingCartById(objectIdArray[0], function (err2, shoppingCart) {
                                if (err2) {
                                    return res.json(err2);
                                }
                                Order.getAlls(conditions, function (err3, data) {
                                    if (err3) {
                                        return res.json(err3);
                                    }
                                    console.log('>success');
                                    return res.json({
                                        "errcode": 200,
                                        "message": "订单添加成功",
                                        "data": data,
                                        "serverTime": getTimeStamp(),
                                    });
                                })
                            })
                        }
                        if(number > 1){
                            console.log('number'+ number);
                            for (var i = 0; i < objectIdArray.length; i++) {
                                ShoppingCart.delShoppingCartById(objectIdArray[i], function (err2, shoppingCart) {
                                    if (err2) {
                                        return res.json(err2);
                                    }
                                    number--;
                                    if (number == 0) {
                                        Order.getAlls(conditions, function (err3, data) {
                                            if (err3) {
                                                return res.json(err3);
                                            }
                                            console.log('>success');
                                            return res.json({
                                                "errcode": 200,
                                                "message": "订单添加成功",
                                                "data": data,
                                                "serverTime": getTimeStamp(),
                                            });
                                        })
                                    }
                                })
                            }
                        }
                    })
                });

            } else {
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确5",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //订单列表
    apiRoutes.get('/order/list', function (req, res) {
        console.log('-interface: /api/v1.0/order/list');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var token = req.query.token || '';
        if (!token) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-token: ' + token);
        var user = jwt.decode(token);
        if (!user) {
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        console.log('-userId: ' + userIdString);
        var arg = {userId: userId};
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                Order.getAll(arg, function (err, order) {
                    if (err) {
                        req.json(err)
                    }
                    return res.json({
                        "errcode": 200,
                        "data": order,
                        "message": "获取订单列表成功",
                        "serverTime": getTimeStamp(),
                    });
                })

            } else {
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //对商品进行评论
    apiRoutes.post('/order/estimate', function (req, res) {
        console.log('-interface: /api/v1.0/order/estimate');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        var objectId = req.body.objectId || '';           //商品Id
        var token = req.body.token || '';
        var content = req.body.content || '';
        var time = new Date().format("yyyy-MM-dd hh:mm:ss");
        if (!token || !objectId || !content) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-token: ' + token);
        console.log('-objectId: ' + objectId);
        console.log('-content: ' + content);

        var user = jwt.decode(token);
        if (!user) {
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        console.log('-userId: ' + userIdString);
        var arg = {orderId:objectId};
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                User.getUserById(userId, function (err, user) {
                    if (err) {
                        return res.json(err);
                    }
                    if (!user) {
                        return res.json({
                            "errcode": 404,
                            "message": "订单不存在",
                            "serverTime": getTimeStamp(),
                        });
                    }
                    var mobilephone = user.mobilephone;
                    var mtel = mobilephone.substr(0, 3) + '****' + mobilephone.substr(7);
                    var newComments = new Comments({
                        mobilephone: mtel,
                        content: content,
                        orderId: objectId,
                        createTime: time,
                    });
                    newComments.save(function (err, comments) {
                        if (err) {
                            return res.json(err);
                        }
                        Comments.getAll(arg, function (err, comments) {
                            if (err) {
                                return res.json(err);
                            }
                            return res.json({
                                "errcode": 200,
                                "message": "添加评论成功",
                                "data": comments,
                                "serverTime": getTimeStamp(),
                            });
                        });
                    });
                });

            } else {
                console.log('>input is wrong');
                return res.json({
                    "errcode": 404,
                    "message": "输入信息不正确",
                    "serverTime": getTimeStamp(),
                });
            }
        });
    });

    //获取商品的评论详情
    apiRoutes.get('/goods/comments', function (req, res) {
        console.log('-interface: /api/v1.0/goods/comments');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var objectId = req.query.objectId || '';
        if (!objectId) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-objectId: ' + objectId);
        var arg = {orderId:objectId};
        Comments.getAll(arg, function (err, comments) {
            if (err) {
                return res.json(err);
            }
            return res.json({
                "errcode": 200,
                "message": "获取评论列表成功",
                "data": comments,
                "serverTime": getTimeStamp(),
            });
        })
    });

    //订单支付接口
    apiRoutes.get('/order/pay', function (req, res) {
        console.log('-interface: /api/v1.0/order/pay');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var objectId = req.query.objectId || '';
        if (!objectId) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-objectId: ' + objectId);

        var number = objectId.indexOf(',');
        if (number < 0) {
            var state = 2;
            Order.changeState(objectId, state,function (err, doc) {
                if (err) {
                    return res.json(err);
                }
                return res.json({
                    "errcode": 200,
                    "message": "付款成功",
                    "data": 'successful',
                    "serverTime": getTimeStamp(),
                });
            });
        }
        if (number >= 0) {
            var objectIdArray = objectId.split(',');
            var number = objectIdArray.length;
            for (var i = 0; i < objectIdArray.length; i++) {
                if (objectIdArray[i]) {
                    var state = 2;
                    Order.changeState(objectIdArray[i],state,function (err, doc) {
                        if (err) {
                            return res.json(err);
                        }
                        number--;
                        if (number == 1) {
                            return res.json({
                                "errcode": 200,
                                "message": "付款成功",
                                "data": 'successful',
                                "serverTime": getTimeStamp(),
                            });
                        }
                    });
                }
            }
        }
    });

    //关闭交易
    apiRoutes.get('/order/cancel', function (req, res) {
        console.log('-interface: /api/v1.0/order/cancel');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var objectId = req.query.objectId || '';
        console.log(objectId);
        if (!objectId) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-objectId: ' + objectId);
        var state = 1;
        Order.changeState(objectId, state,function (err, doc) {
            if (err) {
                return res.json(err);
            }
            return res.json({
                "errcode": 200,
                "message": "交易关闭",
                "data": 'successful',
                "serverTime": getTimeStamp(),
            });
        });

    });
};

function getTimeStamp() {
    return new Date().getTime();
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

function getShoppingCartDate(arg, res) {
    ShoppingCart.getAlls(arg, function (err, shoppingCart) {
        if (err) {
            req.json(err)
        }
        console.log(shoppingCart);
        console.log('>success');
        return res.json({
            "errcode": 200,
            "message": "获取购物车商品成功",
            "data": shoppingCart,
            "serverTime": getTimeStamp(),
        });

    });
}