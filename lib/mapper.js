var express = require('express');
var path = require('path');
var lingo = require('lingo');
var Route = require('./route');
var resourceActions = require('./resource-actions');
var HTTP_VERBS = require('./http-verbs');

function Mapper (router, options) {
  options.routesPath || (options.routesPath = this.DEFAULT_ROUTES_PATH);
  this.router = router;
  this.cwd = process.cwd();
  this.routesPath = options.routesPath;
  this.routesPathNamespace = options.namespace;
  this.filePathNamespace = options.filePathNamespace;
}

Mapper.map = function (options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  var router = express.Router();
  var mapper = new Mapper(router, options);
  fn.call(mapper);

  return router;
};

var p = Mapper.prototype;

p.mapper = Mapper;

p.DEFAULT_ROUTES_PATH = 'app/routes';

p.namespace = function (namespace, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options || (options = {});
  var mapper = new this.mapper(this.router, {
    namespace: namespace
  , routesPath: this.routesPath
  , filePathNamespace: options.filePathNamespace
  });

  fn.call(mapper);
};

p.resources = function (name, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options || (options = {});

  var action, path;
  for (var key in resourceActions) {
    if(resourceActions.hasOwnProperty(key)) {

      if (options.only && options.only.indexOf(key) === -1) continue;
      if (options.except && options.except.indexOf(key) !== -1) continue;

      action = resourceActions[key];
      path = [name];
      if (action.suffix) path.push(action.suffix);

      options.action = key;
      options.name = name;
      options.method = action.type;
      options.routePath = '/'+path.join('/');
      options.filePath = [name, key].join('/');

      this.route(options);
    }
  }

  var namespace;
  if (fn) {
    namespace = name+'/:'+lingo.en.singularize(name)+'Id';
    if (this.routesPathNamespace) namespace = this.routesPathNamespace+'/'+namespace;
    this.namespace(namespace, {filePathNamespace: name}, fn);
  }

};

HTTP_VERBS.forEach(function (VERB) {
  p[VERB] = function (routePath, filePath, options) {
    options || (options = {});
    options.method = VERB;
    options.routePath = routePath;
    options.filePath = filePath;
    this.route(options);
  };
});

//p.route = function (method, routePath, filePath, options) {
p.route = function (options) {
  var namespace = this.routesPathNamespace;
  var filePathNamespace = this.filePathNamespace;
  if (namespace) {
    options.routePath = '/'+path.join(namespace, options.routePath);
  }

  if (filePathNamespace) {
    options.filePath = '/'+path.join(filePathNamespace, options.filePath);
  }

  var route = this.createRoute(options);

  this.router[route.method](route.path, function (req, res) {
    route.handle(req, res);
  });
};

//p.createRoute = function (method, routePath, filePath, options) {
p.createRoute = function (options) {
  var CurrentRoute, route;

  try {
    CurrentRoute = require(path.join(this.cwd, this.routesPath, options.filePath+''));
  } catch (e) {
    if ('MODULE_NOT_FOUND' === e.code) {
      CurrentRoute = this.generateRoute(options);
    }
  }

  route = new CurrentRoute();
  this.setupRoute(route, options);
  return route;
};

p.setupRoute = function (route, options) {
  route.method = options.method;
  route.path = options.routePath;

  if (options.name) {
    route.name = options.name;
  }

  if (!route.templatePath) {
    route.templatePath = options.filePath;
  }
};

p.generateRoute = function (options) {
  return Route;
};

module.exports = Mapper;
