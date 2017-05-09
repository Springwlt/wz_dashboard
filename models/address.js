var mongoose = require('../models/db');

var addressSchema = new mongoose.Schema({
    userId: String,
    realname: String,
    district: String,
    street: String,
    mobilephone: String,
    active:Boolean,
}, {
    collection: 'address'
});

var addressModel = mongoose.model('Address', addressSchema);

function Address(address) {
    this.userId = address.userId;
    this.realname = address.realname;
    this.district = address.district;
    this.street = address.street;
    this.mobilephone = address.mobilephone;
    this.active = address.active;
}

Address.prototype.save = function (cb) {
    var address = {
        userId: this.userId,
        realname: this.realname,
        district: this.district,
        street: this.street,
        mobilephone: this.mobilephone,
        active:this.active,
    };

    var newAddress = new addressModel(address);

    newAddress.save(function (err, address) {
        if (err) {
            return cb(err);
        }
        cb(null, address);
    });
};

Address.getAll = function (query, cb) {
    addressModel.find(query, function (err, address) {
        if (err) {
            return cb(err);
        }
        cb(null, address);
    });
};

Address.getAddressById = function (userId, cb) {
    addressModel.findOne({
        userId: userId
    }, function (err, address) {
        if (err) {
            return cb(err);
        }
        cb(null, address);
    });
};

//修改用户信息
Address.changeAddressInfo = function (addrId, realname, district, street, mobile, active, cb) {
    addressModel.update(
        {_id: addrId}, {
            $set: {'realname': realname, 'district': district, 'street': street, 'mobile': mobile, 'active': active}
        }
        , function (err, user) {
            if (err) {
                return cb(err);
            }
            cb(null, user);
        });
};

//修改默认地址
Address.changeAddress = function (addrId, active, cb) {
    addressModel.update(
        {_id: addrId}, {
            $set: {'active': active}
        }
        , function (err, user) {
            if (err) {
                return cb(err);
            }
            cb(null, user);
        });
};

//删除用户的地址
Address.delAddressById = function (addressId, cb) {
    addressModel.remove({
        "_id": addressId
    }, function (err, addressId) {
        if (err) {
            return cb(err);
        }
        cb(null, addressId);
    });
};

//用户的收货地址
Address.getOneAddressById = function (addressId, cb) {
    addressModel.findOne({
        _id: addressId
    }, function (err, address) {
        if (err) {
            return cb(err);
        }
        cb(null, address);
    });
};
module.exports = Address;

