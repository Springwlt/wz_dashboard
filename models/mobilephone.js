var mongoose = require('../models/db');

var mobilePhoneSchema = new mongoose.Schema({
    mobilephone: String,
    goodsId:String,
    createTime:String,
}, {
    collection: 'mobilePhones'
});

var mobilePhoneModel = mongoose.model('MobilePhone', mobilePhoneSchema);

function MobilePhone(mobilePhone) {
    this.mobilephone = mobilePhone.mobilephone;
    this.goodsId = mobilePhone.goodsId;
    this.createTime = mobilePhone.createTime;
}

MobilePhone.prototype.save = function(cb) {
    var mobilePhone = {
        mobilephone: this.mobilephone,
        goodsId:this.goodsId,
        createTime:this.createTime,
    };

    var newMobilePhone = new mobilePhoneModel(mobilePhone);

    newMobilePhone.save(function(err, mobilePhone) {
        if (err) {
            return cb(err);
        }
        cb(null, mobilePhone);
    });
};

module.exports = MobilePhone;

