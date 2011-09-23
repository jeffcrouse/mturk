var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , assert  = require('assert')
  , nock        = require('nock')
  , filterBody  = require('../filterBody')
  , request = require('../../lib/request')(config);

var status;

exports.testSuccessfulRequest = function(beforeExit) {
  var calledback = false;
  encoding = undefined;

  var scope = nock('http://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .filteringPath(filterBody)
                .get('/?ParamA=ValueA&ParamB=ValueB&Service=ServiceA&Operation=GetHIT')
                .replyWithFile(200, __dirname + '/../static/test.xml');

  request('ServiceA', 'GetHIT', 'GET', { 'ParamA': 'ValueA', 'ParamB': 'ValueB'}, function(err, decodedBody) {
    if (calledback) { throw new Error('Called back more than once'); }
    assert.isNull(err);
    assert.eql(
        {"HIT":{
            "Request":{
              "IsValid":"true"
            }
          , "HITId":"123RVWYBAZW00EXAMPLE"
          , "CreationTime":"2005-10-10T23:59:59.99Z"
        }}
      , decodedBody
    );
    calledback = true;
  });

  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
};

exports.testStatusError = function(beforeExit) {
  var calledback = false;

  var scope = nock('http://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .filteringPath(filterBody)
                .get('/?ParamB=ValueB&ParamC=ValueC&Service=ServiceA&Operation=GetHIT')
                .replyWithFile(500, __dirname + '/../static/test.xml');

  request('ServiceA', 'GetHIT', 'GET', { 'ParamB': 'ValueB', 'ParamC': 'ValueC'}, function(err, decodedBody) {
    if (calledback) { throw new Error('Called back more than once'); }
    calledback = true;
    assert.isNotNull(err);
  });

  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
};

exports.testAppError = function(beforeExit) {
  var calledback = false;

  var scope = nock('http://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .filteringPath(filterBody)
                .get('/?ParamD=ValueD&ParamE=ValueE&Service=ServiceA&Operation=GetHIT')
                .replyWithFile(200, __dirname + '/../static/test_error.xml');

  request('ServiceA', 'GetHIT', 'GET', { 'ParamD': 'ValueD', 'ParamE': 'ValueE'}, function(err, decodedBody) {
    if (calledback) { throw new Error('Called back more than once'); }
    calledback = true;
    assert.eql('Error performing operation GetHIT: You\'re screwed!, Yes you are!, Oh but yes!', err.message);
  });

  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
}