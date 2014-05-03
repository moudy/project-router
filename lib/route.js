var RSVP = require('rsvp');

function Route () { }

function noop() {}

module.exports = Route;

var p = Route.prototype;

p.enter = noop;

p.beforeModel = noop;

p.model = noop;

p.error = function (reason) {
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
  this.response.send(code, error);
};

p.handle = function (req, res, done) {
  this.request = req;
  this.response = res;

  this.enter();

  var error = this.error.bind(this);
  var beforeModel = this.beforeModel.bind(this);
  var model = this.model.bind(this);
  var responseData = this.responseData.bind(this);
  var respond = this.respond.bind(this);

  RSVP.Promise.resolve(undefined)
    .then(beforeModel, error)
    .then(model, error)
    .then(responseData)
    .then(respond)
    .then(done)
    ;
};

