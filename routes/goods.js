var express = require('express');
var Goods = require('../models/goods');
var crypto = require('crypto');
var mutipart = require('connect-multiparty');
var mutipartMiddeware = mutipart();
var Carousel = require('../models/carousel');


module.exports = function (app) {

    app.use(mutipart({uploadDir: './public/imgs/goods'}));

    //新增商品
    app.get('/goods_new', function (req, res) {
        res.render('./goods_new', {
            user: req.session.user,
        });
    });

    //新增商品保存
    app.post('/goods/add', mutipartMiddeware, function (req, res) {
        console.log(req.body);
        var pictureOne = '';
        var pictureTwo = '';
        var pictureThree = '';
        var category = req.body.category || '';
        var type = req.body.type || '';
        var caption = req.body.caption || '';
        var description = req.body.description || '';
        var endDate = req.body.endDate || '';
        var price = req.body.price || 0;
        var region = req.body.region || '';
        var vender = req.body.vender || '';
        var authenticated = req.body.authenticated || false;
        var discount = req.body.discount || 0;
        if (req.files && req.files != undefined && req.files.pictureOne && req.files.pictureOne != undefined && req.files.pictureOne.path && req.files.pictureOne.path != undefined) {
            pictureOne = req.files.pictureOne.path;
        }

        if (req.files && req.files != undefined && req.files.pictureTwo && req.files.pictureTwo != undefined && req.files.pictureTwo.path && req.files.pictureTwo.path != undefined) {
            pictureTwo = req.files.pictureTwo.path;
        }

        if (req.files && req.files != undefined && req.files.pictureThree && req.files.pictureThree != undefined && req.files.pictureThree.path && req.files.pictureThree.path != undefined) {
            pictureThree = req.files.pictureThree.path;
        }
        if (!category || !caption || !description || !endDate || !price || !pictureOne || !pictureTwo || !pictureThree || !vender || !authenticated || !region || !discount || !type) {
            return res.redirect('./error');
        }
        var timestamp = Date.parse(new Date(endDate));
        timestamp = timestamp / 1000;
        var newGoods = new Goods({
            category: req.body.category,
            caption: req.body.caption,
            description:trim(req.body.description),
            endDate: timestamp,
            vender:req.body.vender,
            authenticated:req.body.authenticated,
            price: req.body.price,
            region:req.body.region,
            discount:req.body.discount,
            pictureOne: pictureOne.substring(6),
            pictureTwo: pictureTwo.substring(6),
            pictureThree: pictureThree.substring(6),
            type:req.body.type,
        });
        console.log('-newGoods' + newGoods);
        newGoods.save(function (err, goods) {
            if (err) {
                req.flash('error', err);
                return res.redirect('./error');
            }
            return res.redirect('./goods_all');
        });
    });

    //网站轮廓图
    app.get('/home_page', function (req, res) {
         res.render('./home_page', {
            user: req.session.user,
        });
    });

    //保存轮廓图
    app.post('/home/add', mutipartMiddeware, function (req, res) {
        console.log(req.body);
        var picture = '';

        if (req.files && req.files != undefined && req.files.picture && req.files.picture != undefined && req.files.picture.path && req.files.picture.path != undefined) {
            picture = req.files.picture.path;
        }

        if (!picture) {
            return res.redirect('./error');
        }
        console.log(picture);

        var newCarousel = new Carousel({
            picture: picture.substring(6),
        });
        newCarousel.save(function (err, doc) {
            if (err) {
                req.flash('error', err);
                return res.redirect('./error');
            }
            return res.redirect('./goods_all');
        });
    });

    //商品列表
    app.get('/goods_all', function (req, res) {
        var arg = {};
        Goods.getAll(arg, function (err, goodss) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            console.log(goodss);
            res.render('./goods_all', {
                goodss: goodss,
                user: req.session.user,
            });
        });
    });


};

function checkUserIsLogin(req, res, next) {
    if (req.session.user == null) {
        req.flash('error', '用户尚未登录!');
        res.redirect('/login'); //返回登录页面
    }
    next();
}
function checkUserIsNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '用户已经登录!');
        res.redirect('back'); //返回之前页面
    }
    next();
}
function trim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
}