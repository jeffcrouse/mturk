var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , assert  = require('assert')
  , mockHttpRequest = require('../mock_http_request')
  , HITType = require('../../model/hit_type')(config)
  , Notification = require('../../model/notification')(config)
  , Price = require('../../model/price')(config);

exports.testCreate = function(beforeExit) {
  var calledback = false
    , reward;

  mockHttpRequest(
    'http://mechanicalturk.amazonaws.com/&Title=title&Description=description&Reward.1.Amount=0.1&Reward.1.CurrencyCode=USD&&AssignmentDurationInSeconds=3600&Keywords=keywords&Service=AWSMechanicalTurkRequester&Operation=RegisterHITType',
    __dirname + '/../static/hit_type_register_response.xml');
    
  reward = new Price(0.1, 'USD');
  
  HITType.create('title', 'description', reward, 3600, {keywords: 'keywords'}, function(err, hitType) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
    assert.eql({
        "errors":[]
      , "id":"KZ3GKTRXBWGYX8WXBW60"
      , "title":"title"
      , "description":"description"
      , "reward":{"amount":0.1,"currencyCode":"USD","errors":[]}
      , "assignmentDurationInSeconds":3600
      , "keywords":"keywords"
    }, hitType);
  });

  beforeExit(function() {
    assert.ok(calledback);
  });
};

exports.testSetNotification = function(beforeExit) {
  var calledback = false;
  var notification = Notification.build('http://test.com', 'REST', ['HITExpired', 'HITReviewable']);

  mockHttpRequest(
    'http://mechanicalturk.amazonaws.com/&HITTypeId=abcdefghijk123&Notification.1.Destination=http%3A%2F%2Ftest.com&Notification.1.Transport=REST&Notification.1.EventType.1=HITExpired,Notification.1.EventType.2=HITReviewable&Notification.1.Version=2006-05-05&&Active=true&Service=AWSMechanicalTurkRequester&Operation=SetHITTypeNotification',
    __dirname + '/../static/hit_type_set_notification_response.xml');
  
  HITType.setNotification('abcdefghijk123', notification, true, function(err, hitType) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
  });

  beforeExit(function() {
    assert.ok(calledback);
  });
};