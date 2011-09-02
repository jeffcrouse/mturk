var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , assert  = require('assert')
  , mockHttpRequest = require('../mock_http_request')
  , request = require('../../lib/request')(config);

var status;

exports.testSuccessfulRequest = function(beforeExit) {
  var calledback = false;
  encoding = undefined;

  mockHttpRequest(
    'http://mechanicalturk.amazonaws.com/&ParamA=ValueA&ParamB=ValueB&Service=ServiceA&Operation=GetHIT',
    __dirname + '/../static/test.xml',
    200);

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
    assert.ok(calledback);
  });
};

exports.testStatusError = function(beforeExit) {
  var calledback = false;

  mockHttpRequest(
    'http://mechanicalturk.amazonaws.com/&ParamB=ValueB&ParamC=ValueC&Service=ServiceA&Operation=GetHIT',
    __dirname + '/../static/test.xml',
    500);

  request('ServiceA', 'GetHIT', 'GET', { 'ParamB': 'ValueB', 'ParamC': 'ValueC'}, function(err, decodedBody) {
    if (calledback) { throw new Error('Called back more than once'); }
    calledback = true;
    assert.isNotNull(err);
  });

  beforeExit(function() {
    assert.ok(calledback);
  });
};

exports.testAppError = function(beforeExit) {
  var calledback = false;

  mockHttpRequest(
    'http://mechanicalturk.amazonaws.com/&ParamD=ValueD&ParamE=ValueE&Service=ServiceA&Operation=GetHIT',
    __dirname + '/../static/test_error.xml');

  request('ServiceA', 'GetHIT', 'GET', { 'ParamD': 'ValueD', 'ParamE': 'ValueE'}, function(err, decodedBody) {
    if (calledback) { throw new Error('Called back more than once'); }
    calledback = true;
    assert.eql('Error performing operation GetHIT: You\'re screwed!, Yes you are!, Oh but yes!', err.message);
  });

  beforeExit(function() {
    assert.ok(calledback);
  });
}