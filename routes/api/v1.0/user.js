var express = require('express');
var apiRoutes = express.Router();
var User = require('../../../models/user');
var Address = require('../../../models/address');
var jwt = require('jsonwebtoken');
var secret = require('../../../config/secret');
var crypto = require('crypto');
var tokenManager = require('../../../config/token_manager.js');
var redis = require("redis");
var client = redis.createClient();
var mutipart = require('connect-multiparty');
var mutipartMiddeware = mutipart();

module.exports = function (app) {

    app.use(mutipart({uploadDir: './public/imgs'}));
    app.use('/api/v1.0', apiRoutes);

    //修改密码
    apiRoutes.post('/user/changepassword', function (req, res) {
        console.log('-interface: /api/v1.0/user/changepassword');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        var oldToken = req.body.token || '';
        var newpwd = req.body.newpwd || '';
        var pwd = req.body.pwd || '';
        console.log('-token: ' + oldToken);
        console.log('-newpwd: ' + newpwd);
        console.log('-pwd: ' + pwd);

        if (!oldToken || !newpwd || !pwd) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }

        var user = jwt.decode(oldToken);
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

        User.getUserById(userId,function (err,user) {
            if(err){
                return res.json({
                    "errcode": 404,
                    "message": "用户对象不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            if(!user){
                console.log('>user object is not exist');
                return res.json({
                    "errcode": 404,
                    "message": "用户对象不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            if(user.hash == pwd){
                crypto.randomBytes(128, function (err, salt) {
                    if (err) {
                        throw err;
                    }
                    salt = salt.toString('hex');
                    crypto.pbkdf2(newpwd, salt, 4096, 256, function (err, hash) {
                        if (err) {
                            throw err;
                        }
                        hash = hash.toString('hex');
                        client.on("error", function (err) {
                            console.log("Error " + err);
                        });
                        client.get(userIdString, function (err, reply) {
                            if (err) {
                                return res.json(err);
                            }
                            if (reply == oldToken) {
                                User.userUpdater(user.id, salt, hash, function (err, user) {
                                    if (err) {
                                        return res.json(err);
                                    }
                                    if (!user) {
                                        console.log('>user object is not exist');
                                        return res.json({
                                            "errcode": 404,
                                            "message": "用户对象不存在",
                                            "serverTime": getTimeStamp(),
                                        });
                                    }
                                    var newToken = jwt.sign({id: userIdString}, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION});
                                    client.on("error", function (err) {
                                        console.log("Error " + err);
                                    });
                                    client.set(userIdString, newToken, function (err, reply) {
                                        if (reply == 'OK') {
                                            client.expire(userIdString, 60 * 60 * 24);
                                            console.log('>success');
                                            return res.json({
                                                "errcode": 200,
                                                "message": "密码修改成功",
                                                "data": {
                                                    "token": newToken,
                                                },
                                                "serverTime": getTimeStamp(),
                                            });
                                        }
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
                });
            }else{
                console.log('>user object is not exist');
                return res.json({
                    "errcode": 404,
                    "message": "密码错误",
                    "serverTime": getTimeStamp(),
                });
            }
        })
    });

    //获取用户的个人信息
    apiRoutes.get('/user/userinfo', function (req, res) {
        console.log('-interface: /api/v1.0/user/userinfo');
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
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                User.getUserById(userIdString, function (err, user) {
                    if (err) {
                        return res.json(err);
                    }
                    console.log('>success');
                    if (!user) {
                        return res.json({
                            "errcode": 404,
                            "message": "用户信息不存在",
                            "serverTime": getTimeStamp(),
                        });
                    }
                    return res.json({
                        "errcode": 200,
                        "message": "获取用户信息成功",
                        "data": {
                            'username': user.mobilephone,
                            'nickname': user.nickname,
                            'sex': user.sex,
                            'head': user.head
                        },
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

    //图片上传
    apiRoutes.post('/user/uploadimage', mutipartMiddeware, function (req, res) {
        console.log('-interface: /api/v1.0/user/uploadimage');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        var image = "";
        if (req.files && req.files != undefined && req.files.image && req.files.image != undefined && req.files.image.path && req.files.image.path != undefined) {
            image = req.files.image.path;
        }
        var token = req.body.token || '';

        if (!token || !image) {
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
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                User.userUpdaterImage(user.id, image.substring(6), function (err, user) {
                    if (err) {
                        return res.json(err);
                    }
                    console.log('-image: ' + image);
                    console.log('>success');
                    return res.json({
                        "errcode": 200,
                        "message": "图片上传成功",
                        "data": image.substring(6),
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

    //更新用户的个人信息
    apiRoutes.post('/user/update', function (req, res) {
        console.log('-interface: /api/v1.0/user/update');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        console.log(req.body);
        var token = req.body.token || '';
        var nickname = req.body.nickname || '';
        var sex = req.body.sex || '';

        if (!token || !nickname || !sex ) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-nickname: ' + nickname);
        console.log('-sex: ' + sex);
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
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                User.userUpdaterInfo(user.id, nickname, sex, function (err, user) {
                    if (err) {
                        return res.json(err);
                    }
                    if (!user) {
                        console.log('>user object is not exist');
                        return res.json({
                            "errcode": 404,
                            "message": "用户对象不存在",
                            "serverTime": getTimeStamp(),
                        });
                    }
                    User.getUserById(userId, function (err, user) {
                        if (err) {
                            return res.json(err);
                        }
                        console.log('>success');
                        return res.json({
                            "errcode": 200,
                            "message": "更新成功",
                            "data": {
                                'username': user.mobilephone,
                                'nickname': user.nickname,
                                'sex': user.sex,
                                'head': user.head
                            },
                            "serverTime": getTimeStamp(),
                        });
                    })
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

    //用户的收货地址新增
    apiRoutes.post('/user/addresses_add', function (req, res) {
        console.log('-interface: /api/v1.0/user/addresses_add');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');

        var realname = req.body.realname || '';
        var district = req.body.district || '';
        var street = req.body.street || '';
        var mobilephone = req.body.mobilephone || '';
        var token = req.body.token || '';
        var active = req.body.active || false;

        if (!realname || !district || !street || !mobilephone || !token) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必要的参数",
                "serverTime": getTimeStamp(),
            });
        }

        var addresss = [];
        console.log('-token: ' + token);
        console.log('-realname: ' + realname);
        console.log('-district: ' + district);
        console.log('-street: ' + street);
        console.log('-mobilephone: ' + mobilephone);

        var user = jwt.decode(token);
        if (!user) {
            console.log('>user object is not exist');
            return res.json({
                "errcode": 404,
                "message": "用户不存在",
                "serverTime": getTimeStamp(),
            });
        }
        var userId = user.id;
        var userIdString = userId.toString();
        var arg = {userId:userId}
        console.log('-userId: ' + userIdString);
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                var newAddress = new Address({
                    userId: userId,
                    realname: req.body.realname,
                    district: req.body.district,
                    street: req.body.street,
                    mobilephone: req.body.mobilephone,
                    active: req.body.active,
                });

                Address.getAll(arg, function (err, address) {
                    if (err) {
                        req.json(err)
                    }
                    if (address.length == 0) {
                        addAddress(newAddress, userId, res,arg);
                    }
                    if (address.length > 0) {
                        if (active == 'true') {
                            var number = address.length;
                            for (var k = 0; k < address.length; k++) {
                                number--;
                                Address.changeAddress(address[k], false, function (err, address) {
                                    if (err) {
                                        return res.json(err);
                                    }
                                });
                                if (number == 0) {
                                    addAddress(newAddress, userId, res,arg);
                                }
                            }
                        }
                        if (active == 'false') {
                            addAddress(newAddress, userId, res,arg);
                        }
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

    //用户的收货地址列表
    apiRoutes.get('/user/addresses_list', function (req, res) {
        console.log('-interface: /api/v1.0/user/addresses_list');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');

        var token = req.query.token || '';
        if (!token) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必填的参数",
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

        var arg = {userId:userId};
        console.log('-userId: ' + userIdString);
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                Address.getAll(arg, function (err, address) {
                    if (err) {
                        req.json(err)
                    }
                    console.log('>success');
                    return res.json({
                        "errcode": 200,
                        "message": "用户地址获取成功",
                        "data": address,
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

    //用户的收货地址更新
    apiRoutes.post('/user/addresses_update', function (req, res) {
        console.log('-interface: /api/v1.0/user/addresses_update');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        var token  = req.body.token || '';
        var addrId = req.body.addrId || ''; //具体修改那一条
        var realname = req.body.realname || '';
        var district = req.body.district || '';
        var street = req.body.street || '';
        var mobilephone = req.body.mobilephone || '';
        var active = req.body.active || '';

        if (!token || !addrId || !realname || !district || !street || !mobilephone || !active) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必填参数",
                "serverTime": getTimeStamp(),
            });
        }

        console.log('-token: ' + token);
        console.log('-addrId: ' + addrId);
        console.log('-realname: ' + realname);
        console.log('-district: ' + district);
        console.log('-street: ' + street);
        console.log('-mobilephone: ' + mobilephone);
        console.log('-active: ' + active);
        var arg = {};
        var addresss = [];
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
        var arg = {userId:userId}
        console.log('-userId: ' + userIdString);
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                Address.getAll(arg, function (err, addresss) {
                    if (err) {
                        req.json(err)
                    }
                    if (addresss.length == 1) {

                    }
                    if (addresss.length > 0) {
                        if (active == 'true') {
                            var number = addresss.length;
                            for (var k = 0; k < addresss.length; k++) {
                                number--;
                                Address.changeAddress(addresss[k], false, function (err, address) {
                                    if (err) {
                                        return res.json(err);
                                    }
                                });
                                if (number == 0) {
                                    updateAddress(addrId, realname, district, street, mobilephone, active, userId, res,arg);
                                }
                            }
                        }
                        if (active == 'false') {
                            updateAddress(addrId, realname, district, street, mobilephone, active, userId, res,arg);
                        }
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

    //用户的收货地址删除
    apiRoutes.post('/user/addresses_del', function (req, res) {
        console.log('-interface: /api/v1.0/user/addresses_del');
        console.log('-method: POST');
        res.header('Access-Control-Allow-Origin', '*');
        var token = req.body.token || '';
        var addrId = req.body.addrId || '';

        if (!token || !addrId) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必填的参数",
                "serverTime": getTimeStamp(),
            });
        }

        console.log('-addrId: ' + addrId);
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
        var arg = {userId:userId}
        client.on("error", function (err) {
            console.log("Error " + err);
        });
        client.get(userIdString, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            if (reply == token) {
                Address.delAddressById(addrId, function (err, address) {
                    if (err) {
                        console.log('>addrId is wrong');
                        return res.json({
                            "errcode": 404,
                            "message": "无效的addrId",
                            "serverTime": getTimeStamp(),
                        });
                    }
                    Address.getAll(arg, function (err1, address) {
                        if (err1) {
                            return req.json(err1);
                        }
                        console.log('>success');
                        return res.json({
                            "errcode": 200,
                            "message": "用户地址删除成功",
                            "data": address,
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

    //查询用户的收货地址
    apiRoutes.get('/user/addresses_select', function (req, res) {
        console.log('-interface: /api/v1.0/user/addresses_select');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');

        var addressId = req.query.addressId || '';
        console.log('-addressId: ' + addressId);
        if (!addressId) {
            console.log('>lose necessary parameters');
            return res.json({
                "errcode": 404,
                "message": "缺少必填的参数",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-addressId: ' + addressId);
        Address.getOneAddressById(addressId,function (err,doc) {
            if (err) {
                return req.json(err);
            }
            if(!doc){
                console.log('>lose necessary parameters');
                return res.json({
                    "errcode": 404,
                    "message": "地址不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "获取地址成功",
                "data": doc,
                "serverTime": getTimeStamp(),
            });
        })
    });
};


function getTimeStamp() {
    return new Date().getTime();
}


function addAddress(newAddress, userId, res,arg) {
    newAddress.save(function (err, address) {
        if (err) {
            return req.json(err);
        }
        Address.getAll(arg, function (err1, address) {
            if (err1) {
                req.json(err1)
            }
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "用户地址添加成功",
                "data": address,
                "serverTime": getTimeStamp(),
            });
        });
    });
}

function updateAddress(addrId, realname, district, street, mobilephone, active, userId, res,arg) {
    var arg = {};
    var addresss = [];
    Address.changeAddressInfo(addrId, realname, district, street, mobilephone, active, function (err, address) {
        if (err) {
            console.log('>addrId is wrong');
            return res.json({
                "errcode": 404,
                "message": "无效的addrId",
                "serverTime": getTimeStamp(),
            });
        }
        if (!address) {
            console.log('>addrId is wrong');
            return res.json({
                "errcode": 404,
                "message": "无效的addrId",
                "serverTime": getTimeStamp(),
            });
        }
        Address.getAll(arg, function (err, address) {
            if (err) {
                req.json(err)
            }
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "用户地址修改成功",
                "data": address,
                "serverTime": getTimeStamp(),
            });
        })
    })
}