var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , receptor = require('../../notification_receptor')(config)
  , assert   = require('assert')
  , uri      = require('../../lib/uri');


exports.testReceptor = function(beforeExit) {
  params = {
      'method': 'notify'
    , 'Signature': 'vH6ZbE0NhkF/hfNyxz2OgmzXYKs='
    , 'Timestamp': '2006-05-23T23:22:30Z'
    , 'Version': '2006-05-05'
    , 'Event.1.EventType': 'AssignmentAccepted'
    , 'Event.1.EventTime': '2006-04-21T18:55:23Z'
    , 'Event.1.HITTypeId': 'KDSFO4455LKDAF3'
    , 'Event.1.HITId': 'KDSFO4455LKDAF3'
    , 'Event.1.AssignmentId': 'KDSFO4455LKDAF3KDSFO4455LKDAF3'
    , 'Event.2.EventType': 'AssignmentReturned'
    , 'Event.2.EventTime': '2006-04-21T18:55:23Z'
    , 'Event.2.HITTypeId': 'KDSFO4455LKDAF3'
    , 'Event.2.HITId': 'KDSFO4455LKDAF3KDSFO4455LKDAF3'
    , 'Event.2.AssignmentId': 'KDSFO4455LKDAF3KDSFO4455LKDAF3'
  };
  
  var responded = false
    , assignmentAcceptedEventReceived = false
    , assignmentReturnedEventReceived = false
    , request = {
        url: '/?' + uri.encodeParamsRaw(params)
      , method: 'GET'
    };
  
  assert.response(receptor.server, request, function(res) {
    responded = true;
    assert.equal(200, res.statusCode, res.body);
    assert.eql('', res.body);
  });
  
  receptor.on('assignmentAccepted', function(event) {
    assignmentAcceptedEventReceived = true;
    assert.eql({
        EventType: 'AssignmentAccepted'
      , EventTime: '2006-04-21T18:55:23Z'
      , HITTypeId: 'KDSFO4455LKDAF3'
      , HITId: 'KDSFO4455LKDAF3'
      , AssignmentId: 'KDSFO4455LKDAF3KDSFO4455LKDAF3'
      , eventType: 'assignmentAccepted'
    }, event);
  });

  receptor.on('assignmentReturned', function(event) {
    assignmentReturnedEventReceived = true;
    assert.eql({
        EventType: 'AssignmentReturned'
      , EventTime: '2006-04-21T18:55:23Z'
      , HITTypeId: 'KDSFO4455LKDAF3'
      , HITId: 'KDSFO4455LKDAF3KDSFO4455LKDAF3'
      , AssignmentId: 'KDSFO4455LKDAF3KDSFO4455LKDAF3'
      , eventType: 'assignmentReturned'
    }, event);
  });
  
  beforeExit(function() {
    assert.ok(responded);
    assert.ok(assignmentAcceptedEventReceived);
    assert.ok(assignmentReturnedEventReceived);
  });
};