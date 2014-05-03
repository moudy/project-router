var express = require('express');
var Mapper = require('./lib/mapper');

var DEFAULT_ROUTES_PATH = 'app/routes';

exports.map = function (options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  options.routesPath || (options.routesPath = DEFAULT_ROUTES_PATH);

  var router = express.Router();
  var mapper = new Mapper(router, options);
  fn.call(mapper);

  return router;
};

exports.Route = require('./lib/route');
exports.DEFAULT_ROUTES_PATH = DEFAULT_ROUTES_PATH;
