var RSVP = require('rsvp');
var extend = require('class-extend').extend;

function Route () { }

Route.extend = extend;

function noop() {}

module.exports = Route;

var p = Route.prototype;

p.enter = noop;

p.beforeModel = noop;

p.model = noop;

p.afterModel = noop;

p.error = function (reason) {
  console.log(reason);
  this.reject(reason);
};

p.responseData = function (model) {
  return model;
};

p.respond = function (data) {
  var requestType = this.requestType();
  this[requestType](data);
};

p.html = function (data) {
  this.response.render(this.templatePath, data);
};

p.json = function (data) {
  this.response.json(data);
};

p.params = function () {
  return this.request.params;
};

p.body = function () {
  return this.request.body;
};

p.param = function () {
  return this.request.param.apply(this.request, arguments);
};

p.query = function () {
  return this.request.query;
};

p.requestType = function () {
  return this.request.accepts('html', 'json');
};

p.redirect = function () {
  this.response.redirect.apply(this.response, arguments);
};

p.reject = function (code, error) {
  if (isNaN(code)) {
    error = code;
    code = 400;
  }
  this.response.status(code).send(error);
};

p.shouldContinue = function (payload) {
  var code = this.response.statusCode;
  if (code && /^(3|4|5)/.test(code)) return RSVP.Promise.reject(code);
  return RSVP.Promise.resolve(payload);
};

p.handle = function (req, res, done) {
  var self = this;
  var resolvedModel;

  this.request = req;
  this.response = res;

  this.enter();

  // Bind/wrap route lifecylce
  var shouldContinue = this.shouldContinue.bind(this);
  var error = this.error.bind(this);
  var beforeModel = this.beforeModel.bind(this);
  var model = this.model.bind(this);
  var afterModel = function afterModel (payload) {
    resolvedModel = payload;
    return self.afterModel(resolvedModel);
  };
  var responseData = function responseData () {
    return self.responseData(resolvedModel);
  };
  var respond = this.respond.bind(this);

  RSVP.Promise
    .resolve(undefined)
    .then(shouldContinue, null)
    .then(beforeModel, error)
    .then(shouldContinue, null)
    .then(model, error)
    .then(shouldContinue, null)
    .then(afterModel, error)
    .then(shouldContinue, null)
    .then(responseData)
    .then(shouldContinue, null)
    .then(respond)
    .then(done)
    ;
};

