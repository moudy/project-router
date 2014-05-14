var lingo = require('lingo');

function Action (options) {
  this.owner = options.owner;
  this.name = options.name;
  this.resourceName = this.owner.name;
  this.resource = this.owner.resource;
  this.method = options.method;

  var routePath = [this.resourceName];
  if (options.suffix) routePath.push(options.suffix);

  var filePath = [this.resourceName, this.name];

  var parent = this.owner.parent;
  while (parent) {
    routePath = [ parent.name, ':'+lingo.en.singularize(parent.name)+'Id' ].concat(routePath);

    filePath = [parent.name].concat(filePath);

    parent = parent.parent;
  }

  this.routePath = '/'+routePath.join('/');
  this.filePath = filePath.join('/');
}

module.exports = Action;

