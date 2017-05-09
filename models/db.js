var settings = require('../settings');
var db = require('mongoose');
db.connect('mongodb://'+settings.host+':'+settings.port+'/'+settings.db);

module.exports = db;

