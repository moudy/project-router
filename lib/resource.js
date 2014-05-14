var path = require('path');
var isArray = require('util').isArray;
var resourceActions = require('./resource-actions');
var HTTP_VERBS = require('../lib/http-verbs');
var Action = require('./action');

function Resource (name, options) {
  options || (options = {});

  this.name = name;
  this.only = options.only;
  this.except = options.except;
  this.resource = options.resource;
  this.parent = options.parent;
  if (this.only && !isArray(this.only)) this.only = [this.only];
  if (this.except && !isArray(this.except)) this.except = [this.except];

  this.actionNames = this.getActionNames();
  this.actions = this.getActions();
}

module.exports = Resource;

var p = Resource.prototype;

p.getActionNames = function () {
  var only = this.only;
  var except = this.except;
  var actionNames = [];
  [ 'index'
  , 'new'
  , 'create'
  , 'show'
  , 'edit'
  , 'update'
  , 'destroy' ].forEach(function (action) {
    if (only && only.indexOf(action) === -1) return;
    if (except && except.indexOf(action) !== -1) return;
    actionNames.push(action);
  });
  return actionNames;
};

p.getActions = function () {
  var self = this;

  return this.actionNames.map(function (name) {
    var meta = resourceActions[name];
    return new Action({
      name: name
    , owner: self
    , method: meta.type
    , suffix: meta.suffix
    });
  });
};

p.addAction = function (options) {
  this.actions.unshift(new Action({
      name: options.name
    , owner: this
    , suffix: options.suffix
    , method: options.method
  }));
};

p.routes = function () {
  var a = this.actions;
  var c = this.child;
  while(c) {
    a = a.concat(c.actions);
    c = c.child;
  }
  return a;
};

p.nest = function (fn) {
  var self = this;

  var member = {};
  var collection = {};

  var parent = this.parent;
  if (parent) {
    HTTP_VERBS.forEach(function (VERB) {
      member[VERB] = function (routePath, filePath) {
        var name = routePath.replace(/^\//, '');
        self.addAction({
          suffix: path.join(':id', name)
        , method: VERB
        , name: name
        });
      };
      collection[VERB] = function (routePath, filePath) {
        var name = routePath.replace(/^\//, '');
        self.addAction({
          suffix: name
        , method: VERB
        , name: name
        });
      };
    });
  }


  var nested = {
    resource: function (name, options, fn) {
      if (typeof options === 'function') {
        fn = options;
        options = {};
      }
      options || (options = {});

      options.parent = self;
      var resource = new Resource(name, options);
      self.child = resource;
      if (fn) resource.nest(fn);
    }

  , member: member
  , collection: collection
  };

  fn.call(nested);
};

