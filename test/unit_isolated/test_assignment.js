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
  
  var mturk = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .post('/', 'AssignmentId=abcdefghijklmnop123&RequesterFeedback=this%20is%20feedback%20from%20the%20requester&Service=AWSMechanicalTurkRequester&Operation=ApproveAssignment')
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

exports.populateWorksAsExpected = function() {
  var assignment = new Assignment();
  assignment.populateFromResponse({
      'AssignmentId': '123RVWYBAZW00EXAMPLE456RVWYBAZW00EXAMPLE'
    , 'WorkerId': 'AZ3456EXAMPLE'
    , 'HITId': '123RVWYBAZW00EXAMPLE'
    , 'AssignmentStatus': 'Submitted'
    , 'Deadline': '2005-12-01T23:59:59Z'
    , 'AcceptTime': '2005-12-01T12:00:00Z'
    , 'SubmitTime': '2005-12-07T23:59:59Z'
    , 'Answer': '<QuestionFormAnswers>\
        [XML-encoded Answer data]\
        </QuestionFormAnswers>'
  });
  assert.eql('AZ3456EXAMPLE', assignment.workerId);
  assert.eql('123RVWYBAZW00EXAMPLE', assignment.hitId);
  assert.eql('Submitted', assignment.assignmentStatus);
  assert.eql('2005-12-01T23:59:59Z', assignment.deadline);
  assert.eql('2005-12-01T12:00:00Z', assignment.acceptTime);
  assert.eql('2005-12-07T23:59:59Z', assignment.submitTime);
  assert.eql({"QuestionFormAnswers":"[XML-encoded Answer data]"}, assignment.answer);
};

exports.testReject = function(beforeExit) {
  var calledback = false;

  var mturk = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .post('/', 'AssignmentId=abcdefghijklmnop123&RequesterFeedback=this%20is%20feedback%20from%20the%20requester&Service=AWSMechanicalTurkRequester&Operation=RejectAssignment')
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