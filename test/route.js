var inherits = require('util').inherits;
var expect = require('chai').expect;
var sinon = require('sinon');

var Route = require('../lib/route');

var fakeRequest = {
  accepts: function () { return 'json'; }
};

var fakeResponse = {
  json: function () {}
};

describe('Route', function () {
  describe('lifecycle', function () {
    var methods = [
      'enter'
    , 'beforeModel'
    , 'model'
    , 'afterModel'
    , 'responseData'
    , 'respond'
    ];

    it('calls methods', function (done) {
      var route = new Route();
      var spies = methods.map(function (method) { return sinon.spy(route, method); });

      route.handle(fakeRequest, fakeResponse, function () {
        spies.forEach(function (spy) {
          expect(spy.calledOnce).to.be.true;
          spy.restore();
        });
        done();
      });
    });
  });

  context('resolvedModel', function () {
    function UserRoute () {}
    inherits(UserRoute, Route);
    var user = {name: 'foo'};
    UserRoute.prototype.model = function () { return user; };

    describe('afterModel', function () {
      var route = new UserRoute();

      it('recieves the resolvedModel as the first argument', function (done) {
        var spy =  sinon.spy(route, 'afterModel');
        route.handle(fakeRequest, fakeResponse, function () {
          expect(spy.firstCall.args[0]).to.deep.equal(user);
          spy.restore();
          done();
        });
      });

    });

    describe('responseData', function () {
      var route = new UserRoute();

      it('recieves the resolvedModel as the first argument', function (done) {
        var spy =  sinon.spy(route, 'responseData');
        route.handle(fakeRequest, fakeResponse, function () {
          expect(spy.firstCall.args[0]).to.deep.equal(user);
          spy.restore();
          done();
        });
      });

    });

  });

});
