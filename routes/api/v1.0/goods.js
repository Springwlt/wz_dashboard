var express = require('express');
var apiRoutes = express.Router();
var Goods = require('../../../models/goods');
var MobilePhone = require('../../../models/mobilephone');
var Carousel = require('../../../models/carousel');

module.exports = function (app) {

    app.use('/api/v1.0', apiRoutes);

    //获取所有商品
    apiRoutes.get('/goods/list', function (req, res) {
        console.log('-interface: /api/v1.0/goods/list');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var arg = {};
        Goods.getAll(arg,function (err,goods) {
            if (err) {
               return req.json(err);
            }
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "获取商品成功",
                "data": goods,
                "serverTime": getTimeStamp(),
            });
        });
    });


    //商品详情
    apiRoutes.get('/goods/details', function (req, res) {
        console.log('-interface: /api/v1.0/goods/details');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');
        var goodsId = req.query.objectId || '';
        if(!goodsId){
            console.log('>lose necessary parameters');
            return  res.json({
                "errcode": 404,
                "message": "错误的商品Id",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-goodsId'+ goodsId);
        Goods.getGoodsById(goodsId,function (err,goods) {
            if (err) {
                return  res.json({
                    "errcode": 404,
                    "message": "该商品不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            if(!goods){
                return  res.json({
                    "errcode": 404,
                    "message": "该商品不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "获取商品成功",
                "data": goods,
                "serverTime": getTimeStamp(),
            });
        })
    });

    //存取电话号码
    apiRoutes.post('/goods/callme', function (req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('-interface: /api/v1.0/goods/callme');
        console.log('-method: POST');
        console.log(req.body);
        var mobilephone = req.body.mobilephone || '';
        var objectId = req.body.objectId || '';
        var time = new Date().format("yyyy-MM-dd hh:mm:ss");
        if(!mobilephone || !objectId || !time){
            console.log('>input is wrong');
            return res.json({
                "errcode": 404,
                "message": "输入信息不正确",
                "serverTime": getTimeStamp(),
            });
        }
        console.log('-mobilephone'+ mobilephone);
        console.log('-objectId'+ objectId);
        Goods.getGoodsById(objectId,function (err,goods) {
            if (err) {
                return  res.json({
                    "errcode": 404,
                    "message": "该商品不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            if(!goods){
                return  res.json({
                    "errcode": 404,
                    "message": "该商品不存在",
                    "serverTime": getTimeStamp(),
                });
            }
            var newMobilePhone = new MobilePhone({
                mobilephone:mobilephone,
                goodsId:objectId,
                createTime:time,
            });
            newMobilePhone.save(function (err, goods) {
                if (err) {
                    return req.json(err);
                }
                console.log('>success');
                return res.json({
                    "errcode": 200,
                    "message": "存入电话号码成功",
                    "data":"successful",
                    "serverTime": getTimeStamp(),
                });
            });
        })

    });

    //轮廓图
    apiRoutes.get('/home/carousel', function (req, res) {
        console.log('-interface:  /api/v1.0/home/carousel');
        console.log('-method: GET');
        res.header('Access-Control-Allow-Origin', '*');

        Carousel.getAll(function (err,doc) {
            if (err) {
                return  res.json({
                    "errcode": 500,
                    "message": "数据库异常",
                    "serverTime": getTimeStamp(),
                });
            }
            console.log('>success');
            return res.json({
                "errcode": 200,
                "message": "获取图片成功",
                "data":doc,
                "serverTime": getTimeStamp(),
            });
        })
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