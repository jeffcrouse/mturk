var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , assert  = require('assert')
  , nock = require('nock')
  , filterBody = require('../filterBody')
  , Assignment = require('../../model/assignment')(config);

exports.testApprove = function(beforeExit) {
  var calledback = false;
  
  var mturk = nock('http://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .post('/', 'assignmentId=abcdefghijklmnop123&RequesterFeedback=this%20is%20feedback%20from%20the%20requester&Service=AWSMechanicalTurkRequester&Operation=ApproveAssignment')
                .replyWithFile(200, __dirname + '/../static/assignment_approve_response.xml');

  Assignment.approve('abcdefghijklmnop123', 'this is feedback from the requester', function(err) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
  });
  
  beforeExit(function() {
    mturk.done();
    assert.ok(calledback);
  });
};


exports.testReject = function(beforeExit) {
  var calledback = false;

  var mturk = nock('http://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .post('/', 'assignmentId=abcdefghijklmnop123&RequesterFeedback=this%20is%20feedback%20from%20the%20requester&Service=AWSMechanicalTurkRequester&Operation=RejectAssignment')
                .replyWithFile(200, __dirname + '/../static/assignment_reject_response.xml');
  
  Assignment.reject('abcdefghijklmnop123', 'this is feedback from the requester', function(err) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
  });
  
  beforeExit(function() {
    mturk.done();
    assert.ok(calledback);
  });
};