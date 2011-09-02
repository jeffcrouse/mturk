var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , assert  = require('assert')
  , mockHttpRequest = require('../mock_http_request')
  , Assignment = require('../../model/assignment')(config);

exports.testApprove = function(beforeExit) {
  var calledback = false;
  
  mockHttpRequest(
    'http://mechanicalturk.amazonaws.com/&assignmentId=abcdefghijklmnop123&RequesterFeedback=this%20is%20feedback%20from%20the%20requester&Service=AWSMechanicalTurkRequester&Operation=ApproveAssignment',
    __dirname + '/../static/assignment_approve_response.xml');

  Assignment.approve('abcdefghijklmnop123', 'this is feedback from the requester', function(err) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
  });
  
  beforeExit(function() {
    assert.ok(calledback);
  });
};


exports.testReject = function(beforeExit) {
  var calledback = false;
  
  mockHttpRequest(
    'http://mechanicalturk.amazonaws.com/&assignmentId=abcdefghijklmnop123&RequesterFeedback=this%20is%20feedback%20from%20the%20requester&Service=AWSMechanicalTurkRequester&Operation=RejectAssignment',
    __dirname + '/../static/assignment_reject_response.xml');

  Assignment.reject('abcdefghijklmnop123', 'this is feedback from the requester', function(err) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
  });
  
  beforeExit(function() {
    assert.ok(calledback);
  });
};