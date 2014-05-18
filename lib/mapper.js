var express = require('express');
var path = require('path');
var lingo = require('lingo');
var Route = require('./route');
var HTTP_VERBS = require('./http-verbs');
var Resource = require('./resource');

function Mapper (router, options) {
  options.routesPath || (options.routesPath = this.DEFAULT_ROUTES_PATH);
  this.router = router;
  this.cwd = process.cwd();
  this.routesPath = options.routesPath;
  this.routesPathNamespace = options.namespace;
  this.filePathNamespace = options.filePathNamespace;
  this.parentBasePath = options.parentBasePath;

  var self = this;
  var member = {};
  var collection = {};

  var parent = options.parent;
  if (parent) {
    HTTP_VERBS.forEach(function (VERB) {
      member[VERB] = function (routePath, filePath) {
        self[VERB](routePath, filePath, {
          member: true
        , resourceName: parent.name
        , resource: parent.resource
        });
      };
      collection[VERB] = function (routePath, filePath) {
        self[VERB](routePath, filePath, {
          collection: true
        , resourceName: parent.name
        , resource: parent.resource
        });
      };
    });

    this.member = member;
    this.collection = collection;
  }
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
  var filePathNamespace = options.filePathNamespace || namespace;
  if (this.filePathNamespace) {
    filePathNamespace = path.join(this.filePathNamespace, filePathNamespace);
  }
  var mapper = new this.mapper(this.router, {
    namespace: namespace
  , routesPath: this.routesPath
  , filePathNamespace: filePathNamespace
  , parentBasePath: options.parentBasePath
  , parent: options.parent
  });

  fn.call(mapper);
};

p.resource = function (name, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  var resource = new Resource(name, options);
  if (fn) resource.nest(fn);

  var self = this;

  resource.routes().forEach(function (action) {
    self.route({
      action: action.name
    , resourceName: action.resourceName
    , resource: action.resource
    , method: action.method
    , routePath: action.routePath
    , filePath: action.filePath
    });
  });

};

HTTP_VERBS.forEach(function (VERB) {
  p[VERB] = function (routePath, filePath, options) {
    options || (options = {});
    options.method = VERB;
    options.routePath = routePath;
    options.filePath = filePath || routePath.replace('^\/', '');
    this.route(options);
  };
});

p.route = function (options) {
  var namespaceBase = this.parentBasePath;
  var namespace = this.routesPathNamespace;
  var filePathNamespace = this.filePathNamespace;

  if (options.member && namespaceBase) {
    options.routePath = '/'+path.join(namespaceBase, ':id', options.routePath);
  } else if (options.collection && namespaceBase) {
    options.routePath = '/'+path.join(namespaceBase, options.routePath);
  } else if (namespace) {
    options.routePath = '/'+path.join(namespace, options.routePath);
  }

  if (filePathNamespace) {
    options.filePath = path.join(filePathNamespace, options.filePath);
  }

  var route = this.createRoute(options);

  var handler = function (req, res) { route.handle(req, res); };
  handler.route = route;

  this.router[route.method](route.path, handler);
};

p.createRoute = function (options) {
  var CurrentRoute, route;

  try {
    CurrentRoute = require(path.join(this.cwd, this.routesPath, options.filePath+''));
  } catch (e) {
    if ('MODULE_NOT_FOUND' === e.code && e.message.match(new RegExp(options.filePath+'\'$'))) {
      CurrentRoute = this.generateRoute ? this.generateRoute(options) : Route;
    } else {
      throw e;
    }
  }

  route = new CurrentRoute();
  this.setupRoute(route, options);
  return route;
};

p.setupRoute = function (route, options) {
  route.method = options.method;
  route.path = options.routePath;

  if (options.resource && !route.resource) {
    route.resource = options.resource;
  }

  if (options.resourceName && !route.resourceName) {
    route.resourceName = options.resourceName;
  }

  if (!route.templatePath) {
    route.templatePath = options.filePath;
  }
};

module.exports = Mapper;
