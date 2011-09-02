var assert = require('assert');
var fs  = require('fs')
  , xml = require('../../lib/xml-native');

exports.testDecodeReadStream = function(beforeExit) {
  var rs  = fs.createReadStream(__dirname + '/../static/test.xml')
    , calledBack = false;

  xml.decodeReadStream(rs, function(err, decoded) {
    calledBack = true;
    assert.isNull(err);
    assert.eql(
        {"GetHITResponse":{
          "OperationRequest":{
              "RequestId":"XA5TETQ3G6QF7EXAMPLE"}
            , "HIT":{
                "Request":{
                  "IsValid":"true"
                }
              , "HITId":"123RVWYBAZW00EXAMPLE"
              , "CreationTime":"2005-10-10T23:59:59.99Z"
            }
          }
        }
      , decoded
    );
  });
  
  beforeExit(function() {
    assert.ok(calledBack);
  });
};

exports.testDecodeReadStreamWithErrors = function(beforeExit) {
  var rs       = fs.createReadStream(__dirname + '/../static/test_error.xml')
  , calledBack = false;

  xml.decodeReadStream(rs, function(err, decoded) {
    calledBack = true;
    assert.isNull(err);
    assert.eql(
        {"GetHITResponse":{
            "OperationRequest":{
                "RequestId":"XA5TETQ3G6QF7EXAMPLE"
              , "Errors":{
                  "Error": [
                      "You're screwed!"
                    , "Yes you are!"
                    , "Oh but yes!"
                  ]
              }
            }
          , "HIT":{
              "Request":{
                "IsValid":"true"
              }
            , "HITId":"123RVWYBAZW00EXAMPLE"
            ,"CreationTime":"2005-10-10T23:59:59.99Z"
          }
        }
      }
      , decoded
    );
  });
  
  beforeExit(function() {
    assert.ok(calledBack);
  });
};