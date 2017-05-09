var boot = require('../app').boot,
    shutdown = require('../app').shutdown,
    port = require('../app').port,
    superagent = require('superagent'),
    expect = require('expect.js');

describe('Express server', function () {
    before(function () {
        boot();
    });

    describe('Index Page', function () {
        it('should respond to GET', function (done) {
            superagent
                .get('http://localhost:' + port)
                .end(function (err, res) {
                    expect(res.status).to.equal(200)
                    done()
                })
        });
    });

    after(function () {
        shutdown();
    });
});