var _ = require('underscore');
var expect = require('chai').expect;
var express = require('express');

var Mapper = require('../lib/mapper');

var usersResoureRoutes = {
  index: { path: '/users', type: 'get'}
, show: { path: '/users/:id', type: 'get'}
, new: { path: '/users/new', type: 'get'}
, edit: { path: '/users/:id/edit', type: 'get'}
, create: { path: '/users', type: 'post'}
, update: { path: '/users/:id', type: 'put'}
, destroy: { path: '/users/:id', type: 'delete'}
};

describe('Mapper', function () {
  function mapRoutes (fn) {
    var router = express.Router();
    var mapper = new Mapper(router, {routesPath: 'test/routes'});
    fn.call(mapper);

    return router;
  }

  describe('.VERB()', function () {
    var router = mapRoutes(function () {});
    var HTTP_VERBS = [ 'get', 'post', 'put', 'delete' ];

    it('has http verb convenience methods', function () {
      HTTP_VERBS.forEach(function (VERB) {
        expect(router[VERB]).to.be.a('function');
      });
    });
  });

  describe('.route()', function () {
    var router = mapRoutes(function () {
      this.route({method: 'get', routePath: '/users', filePath: 'users/index'});
    });

    it('creates routes', function () {
      var route = router.stack[0].route;
      expect(route.path).to.eq('/users');
      expect(route.methods.get).to.be.true;
    });

  });

  describe('.namespace()', function () {
    var router = mapRoutes(function () {
      this.namespace('api', function () { this.get('/users', 'users/index'); });
    });

    it('routes', function () {
      var route = router.stack[0].route;
      expect(route.path).to.eq('/api/users');
      expect(route.methods.get).to.be.true;
    });
  });

  context('.resource()', function () {

    function test (routes, stack, shouldExist)  {
      _.each(routes, function test (routeInfo) {
        var route = _.find(stack, function (s) {
          return s.route.path === routeInfo.path && s.route.methods[routeInfo.type];
        });

        if (shouldExist) {
          expect(route).to.exist;
        } else {
          expect(route).to.not.exist;
        }
      });
    }

    describe('(name)', function () {
      var router = mapRoutes(function () { this.resources('users'); });

      it('creates resources routes', function () {
        test(usersResoureRoutes, router.stack, true);
      });
    });

    describe('(name, {only: [...])', function () {
      var only = ['index', 'show'];
      var router = mapRoutes(function () { this.resources('users', {only: only}); });

      it('creates only index and show resources routes', function () {
        test(_.pick(usersResoureRoutes, only), router.stack, true);
        test(_.omit(usersResoureRoutes, only), router.stack, false);
      });
    });

    describe('(name, {except: [...])', function () {
      var except = ['destroy'];
      var router = mapRoutes(function () { this.resources('users', {except: except}); });

      it('creates all resources routes except delete', function () {
        test(_.omit(usersResoureRoutes, except), router.stack, true);
        test(_.pick(usersResoureRoutes, except), router.stack, false);
      });
    });

    describe('(name, fn)', function () {
      var router = mapRoutes(function () {
        this.resources('users', function () {
          this.resources('posts', function () {
            this.resources('comments');
          });
        });
      });

      it('creates nested resources', function () {
        var routes = router.stack.map(function (s) { return s.route.path; });
        expect(routes).to.include.members([
          '/users',
          '/users/new',
          '/users',
          '/users/:id',
          '/users/:id/edit',
          '/users/:id',
          '/users/:id',
          '/users/:userId/posts',
          '/users/:userId/posts/new',
          '/users/:userId/posts',
          '/users/:userId/posts/:id',
          '/users/:userId/posts/:id/edit',
          '/users/:userId/posts/:id',
          '/users/:userId/posts/:id',
          '/users/:userId/posts/:postId/comments',
          '/users/:userId/posts/:postId/comments/new',
          '/users/:userId/posts/:postId/comments',
          '/users/:userId/posts/:postId/comments/:id',
          '/users/:userId/posts/:postId/comments/:id/edit',
          '/users/:userId/posts/:postId/comments/:id'
         ]);
      });

    });
  });



});
