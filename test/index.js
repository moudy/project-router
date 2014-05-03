var expect = require('chai').expect;
var sinon = require('sinon');
var express = require('express');

var ProjectRouter = require('../index');
var Mapper = require('../lib/mapper');

describe('index', function () {

  context('exports', function () {
    it('exports a map function', function () {
      expect(ProjectRouter.map).to.be.a('function');
    });

    it('exports a Route class', function () {
      expect(ProjectRouter.Route).to.be.a('function');
    });
  });

  context('.map()', function () {
    var DEFAULT_ROUTES_PATH = ProjectRouter.Mapper.prototype.DEFAULT_ROUTES_PATH;

    it('returns express router', function () {
      expect(ProjectRouter.map(function () {}).handle).to.be.a('function');
    });

    it('defaults to '+DEFAULT_ROUTES_PATH+' for routesPath', function () {
      var object = { mapFn: function () {} };
      var spy = sinon.spy(object, 'mapFn');
      ProjectRouter.map(object.mapFn);
      mapper = spy.thisValues[0];
      expect(mapper.routesPath).to.include(DEFAULT_ROUTES_PATH);
      spy.restore();
    });

    it('can customize routes path', function () {
      var CUSTOM_PATH = '/my/custsomPath';
      var object = { mapFn: function () {} };
      var spy = sinon.spy(object, 'mapFn');
      ProjectRouter.map({routesPath: CUSTOM_PATH}, object.mapFn);
      mapper = spy.thisValues[0];
      expect(mapper.routesPath).to.include(CUSTOM_PATH);
      spy.restore();
    });

  });

});
