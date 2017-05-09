var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');

var Book = mongoose.model('Book', {name: String});

var practicalNodeBook = new Book({name: 'Practical Node.js'});
practicalNodeBook.save(function(err, result) {
    if (err) {
        console.log(e);
    }
    process.exit(0);
})
