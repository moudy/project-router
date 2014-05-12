var Mapper = require('./lib/mapper');
var Route = require('./lib/route');

exports.Route = Route;
exports.Mapper = Mapper;
exports.map = Mapper.map;

exports.routeGenerator = function (fn) {
  Mapper.prototype.generateRoute = fn;
};

