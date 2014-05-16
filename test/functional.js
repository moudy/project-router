var path = require('path');
var sinon = require('sinon');
var expect = require('chai').expect;
var supertest = require('supertest');
var projectRouter = require('../index');

context('working', function () {
  var app = require('express')();

  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, 'views'));
  app.engine('html', require('ejs').renderFile);

  var router = projectRouter.map(function () {
    this.get('/users', 'users/index');
    this.post('/users', 'users/index');
    this.put('/users', 'users/index');
    this.delete('/users', 'users/index');

    this.namespace('dashboard', function () {
      this.get('/users', 'users/index');
      this.resource('comments', {only: 'index'});
    });
  });

  app.use(router);

  describe('request/response', function () {
    function test (verb, endpoint, expected) {
      return function (done) {
        supertest(app)[verb](endpoint).end(function (err, res) {
          expect(res.text).to.contain(expected);
          done();
        });
      };
    }

    it('renders users/index', test('get', '/users', 'users/index'));
    it('renders users/index', test('post', '/users', 'users/index'));
    it('renders users/index', test('put', '/users', 'users/index'));
    it('renders users/index', test('del', '/users', 'users/index'));
    it('renders dashboard/users/index', test('get', '/dashboard/users', 'dashboard/users/index'));
    it('renders dashboard/comments/index', test('get', '/dashboard/comments', 'dashboard/comments/index'));

  });
});

context('aborting', function () {
  var app = require('express')();

  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, 'views'));
  app.engine('html', require('ejs').renderFile);

  var router = projectRouter.map({routesPath: 'test/routes'}, function () {
    this.get('/reject', 'reject-route');
  });

  app.use(router);

  it('recieves the resolvedModel as the first argument', function (done) {
    var spy =  sinon.spy(projectRouter.Route.prototype, 'respond');
    supertest(app).get('/reject').end(function (err, res) {
      expect(spy.called).to.be.false;
      spy.restore();
      done();
    });
  });

});

