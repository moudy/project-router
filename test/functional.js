var path = require('path');
var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('express')();
var projectRouter = require('../index');

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
