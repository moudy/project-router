var path = require('path');
var Route = require('./route');

var resourceActions = {
  index: {type:'get'}
, new: {type:'get', suffix: 'new'}
, create: {type:'post'}
, show: {type:'get', suffix: ':id'}
, edit: {type:'get', suffix: ':id/edit'}
, update: {type:'put', suffix: ':id'}
, destroy: {type:'delete', suffix: ':id'}
};


var HTTP_VERBS = [
  'get'
, 'post'
, 'put'
, 'delete'
];

function Mapper (router, options) {
  this.router = router;
  this.routesPath = path.join(process.cwd(), options.routesPath);
}
module.exports = Mapper;

var p = Mapper.prototype;

p.resources = function (type, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options || (options = {});

  //var actions = (options.only || resourceActions.slice());

  //if (options.except) {
    //routes.forEach(function (r) {

    //});
  //}
  var action, path;
  for (var key in resourceActions) {
    if(resourceActions.hasOwnProperty(key)) {

      if (options.only && options.only.indexOf(key) === -1) continue;
      if (options.except && options.except.indexOf(key) !== -1) continue;

      action = resourceActions[key];
      path = [type];
      if (action.suffix) path.push(action.suffix);
      this.route(action.type, '/'+path.join('/'));

    }
  }

};

HTTP_VERBS.forEach(function (VERB) {
  p[VERB] = function (routePath, filePath) {
    this.route(VERB, routePath, filePath);
  };
});

p.route = function () {
  var route = this.createRoute.apply(this, arguments);

  this.router[route.method](route.path, function (req, res) {
    route.handle(req, res);
  });
};

p.createRoute = function (method, routePath, filePath) {
  var CurrentRoute, route;

  try {
    CurrentRoute = require(path.join(this.routesPath, filePath+''));
  } catch (e) {
    if ('MODULE_NOT_FOUND' === e.code) {
      CurrentRoute = this.generateRoute.apply(this, arguments);
    }
  }

  route = new CurrentRoute();
  route.method = method;
  route.path = routePath;

  if (!route.templatePath) {
    route.templatePath = filePath;
  }

  return route;
};

p.generateRoute = function () {
  return Route;
};

