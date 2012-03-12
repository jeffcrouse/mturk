var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , notification = require('../../model/notification')(config)
  , assert       = require('assert');

exports.testValidation = function() {
  assert.ok(  notification.build('http://test.com', 'REST', ['HITExpired', 'HITReviewable']).valid());
  assert.ok(! notification.build(null, 'REST', ['HITExpired', 'HITReviewable']).valid());
  assert.ok(! notification.build('http://test.com', null, ['HITExpired', 'HITReviewable']).valid());
  assert.ok(! notification.build('http://test.com', 'zREST', ['HITExpired', 'HITReviewable']).valid());
  assert.ok(! notification.build('http://test.com', 'REST', []).valid());
  assert.ok(! notification.build('http://test.com', 'REST', ['WRongGG']).valid());
  assert.ok(! notification.build('http://test.com', 'REST', ['HITExpired', 'WRongGG']).valid());
};