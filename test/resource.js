var expect = require('chai').expect;
var Resource = require('../lib/resource');
var resourceActions = require('../lib/resource-actions');

describe('Recource', function () {

  describe('.actionNames()', function () {
    it('returns all actionNames', function () {
      var resource = new Resource();
      expect(resource.actionNames).to.eql(Object.keys(resourceActions));
    });

    it('returns some actionNames', function () {
      var only = ['index', 'show'];
      var resource = new Resource(null, {only: only});
      expect(resource.actionNames).to.eql(only);
    });

    it('excludes some actionNames', function () {
      var except = ['index', 'show'];
      var resource = new Resource(null, {except: except});
      expect(resource.actionNames).to.not.include.members(except);
    });
  });

});
