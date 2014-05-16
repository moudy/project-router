var inherits = require('util').inherits;
var Route = require('../../index').Route;

function RejectRoute () {}
inherits(RejectRoute, Route);

module.exports = RejectRoute;

RejectRoute.prototype.model = function () {
  this.reject(404);
};
