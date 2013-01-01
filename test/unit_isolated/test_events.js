var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , mturk       = require('../../../mturk')(config)
  , nock        = require('nock')
  , filterBody  = require('../filterBody')
  , assert      = require('assert');

module.exports.testEvents = function(beforeExit) {
  var count = 0;
  var finished = false;
  
  expectedHits = {
      'GBHZVQX3EHXZ2AYDY2T0': true
    , '3EHXZ2AYDY2T0GBHZVQX': true
    , 'YDY2T0GBHZVQX3EHXZ2A': true
    , '2GBHZVQX3EHXZ2AYDY2T0': true
    , '23EHXZ2AYDY2T0GBHZVQX': true
    , '2YDY2T0GBHZVQX3EHXZ2A': true
    , '3GBHZVQX3EHXZ2AYDY2T0': true
    , '3EHXZ2AYDY2T0GBHZVQX': true
    , '3DY2T0GBHZVQX3EHXZ2A': true
    , '4GBHZVQX3EHXZ2AYDY2T0': true
  };
  
  var scope = nock('https://mechanicalturk.amazonaws.com')
                .filteringPath(filterBody)
                .filteringRequestBody(filterBody)
                
                .get('/?Status=Reviewable&PageSize=20&PageNumber=1&Service=AWSMechanicalTurkRequester&Operation=GetReviewableHITs')
                .replyWithFile(200, __dirname + '/../static/hit_getRevieweable_multiple_response.xml')
                
                .get('/?Status=Reviewable&PageSize=20&PageNumber=2&Service=AWSMechanicalTurkRequester&Operation=GetReviewableHITs')
                .replyWithFile(200, __dirname + '/../static/hit_getRevieweable_multiple_response_page2.xml')
                
                .get('/?Status=Reviewable&PageSize=20&PageNumber=3&Service=AWSMechanicalTurkRequester&Operation=GetReviewableHITs')
                .replyWithFile(200, __dirname + '/../static/hit_getRevieweable_multiple_response_page3.xml');
  
  mturk.on('HITReviewable', function(hitId) {
    assert.ok(!! expectedHits[hitId]);
    delete expectedHits[hitId];
    count ++;
    if (count === 3) finished = true;
  });
  
  setTimeout(function() {
    mturk.stopListening();
  }, 1000);
  
  beforeExit(function() {
    scope.done();
    assert.ok(finished);
    assert.ok(Object.keys(expectedHits).length === 0);
  });
};