var resourceActions = require('./resource-actions');

function Action (options) {
  this.name = options.name;
  var meta = this.method = resourceActions[this.name];
  this.resourceName = options.resourceName;
  this.resource = options.resource;
  this.method = meta.type;

  var routePath = [this.resourceName];
  if (meta.suffix) routePath.push(meta.suffix);
  this.routePath = '/'+routePath.join('/');
  this.filePath = [this.resourceName, this.name].join('/');
}

module.exports = Action;

//var p = Action.prototype;

