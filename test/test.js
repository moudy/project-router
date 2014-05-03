var app = require('../app').app;
var request = require('supertest');

function test (path, str) {
  return function (done) {
    request(app).get(path).end(function (req, res) {
      expect(res.text).to.include(str);
      done();
    });
  };
}

//it('works', test('/users', 'users'));
it('works', test('/posts', 'posts'));
//it('works', test('/posts/fff', 'posts show'));
//it('works', test('/posts/new', 'posts new'));
//it('works', test('/posts/fff/edit', 'posts edit'));
