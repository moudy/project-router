var expect = require('chai').expect;
var sinon = require('sinon');

var Route = require('../lib/route');

var noop = function () {};

var fakeRequest = {
  accepts: function () { return 'json'; }
};

var fakeResponse = {
  json: function () {}
};

describe('Route', function () {
  describe('lifecycle', function () {
    var methods = ['enter', 'beforeModel', 'model', 'responseData', 'respond'];

    it('calls methods', function (done) {
      var route = new Route();
      var spies = methods.map(function (method) {
        return sinon.spy(route, method);
      });

      route.handle(fakeRequest, fakeResponse, function () {
        spies.forEach(function (spy) {
          expect(spy.calledOnce).to.be.true;
          spy.restore();
        });
        done();
      });
    });
  });
});
