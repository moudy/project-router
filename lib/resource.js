var isArray = require('util').isArray;
var resourceActions = require('./resource-actions');
var Action = require('./action');

function Resource (name, options) {
  options || (options = {});

  this.name = name;
  this.only = options.only;
  this.except = options.except;
  if (this.only && !isArray(this.only)) this.only = [this.only];
  if (this.except && !isArray(this.except)) this.except = [this.except];
}

module.exports = Resource;

var p = Resource.prototype;

p.actions = function () {
  var self = this;
  return this.actionNames().map(function (name) {
    return new Action({
      name: name
    , resource: self.resource
    , resourceName: self.name
    });
  });
};

p.actionNames = function () {
  var actions, only, except;
  if (!this._actionNames) {
    only = this.only;
    except = this.except;
    actions = [];
    Object.keys(resourceActions).forEach(function (action) {
      if (only && only.indexOf(action) === -1) return;
      if (except && except.indexOf(action) !== -1) return;
      actions.push(action);
    });
    this._actionNames = actions;
  }
  return this._actionNames;
};

  //var action, path;
  //for (var key in resourceActions) {
    //if(resourceActions.hasOwnProperty(key)) {

      //if (only && only.indexOf(key) === -1) continue;
      //if (except && except.indexOf(key) !== -1) continue;

      //action = resourceActions[key];
      //path = [name];
      //if (action.suffix) path.push(action.suffix);

    //}
