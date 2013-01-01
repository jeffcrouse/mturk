var config = {
    receptor: {
        port: 8080
      , host: undefined
    }
  , secretAccessKey: "fksdlfkjsdlkfjsdlfkjslkfjsdlkfjsdlkfjsdlfkj"
}
  , assert          = require('assert')
  , nock        = require('nock')
  , filterBody  = require('../filterBody')
  , HIT             = require('../../model/hit')(config)
  , Question        = require('../../model/question')(config);
  
exports.testCreate = function(beforeExit) {
  var calledback = false
    , question   = new Question(__dirname + '/../../static/questionform.xml.jade', {
        receipt: {
            imageURL: 'http://tictactoe.amazon.com/game/01523/board.gif'
          , imageSubType: 'gif'
        }
      });
      
  responseFilePath = 'static/hit_create_response.xml';
  
  var scope = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .post('/', 'HITTypeId=1&LifetimeInSeconds=1200&Service=AWSMechanicalTurkRequester&Operation=CreateHIT')
                .replyWithFile(200, __dirname + '/../static/hit_create_response.xml');
  
  HIT.create(1, question, 1200, undefined, function(err, hit) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
    delete hit.question;
    assert.eql({
        "errors":[]
      , "hitTypeId":1
      , "lifeTimeInSeconds":1200
      , "id":"123RVWYBAZW00EXAMPLE"
      , "creationTime":"2005-10-10T23:59:59.99Z"
    }, hit);
  });

  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
};

exports.testCreateWithErrors = function(beforeExit) {
  var calledback = false
  , question   = new Question(__dirname + '/../../static/questionform.xml.jade', {
      receipt: {
          imageURL: 'http://tictactoe.amazon.com/game/01523/board.gif'
        , imageSubType: 'gif'
      }
    });
  
  var scope = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .post('/', 'HITTypeId=1&LifetimeInSeconds=1300&Service=AWSMechanicalTurkRequester&Operation=CreateHIT')
                .replyWithFile(200, __dirname + '/../static/hit_create_response_error.xml');

  HIT.create(1, question, 1300, undefined, function(errors, hit) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNotNull(errors);
    assert.eql(1, errors.length);
    assert.eql('Error performing operation CreateHIT: One error', errors[0].message);
  });

  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
}

exports.testCreateInvalid = function(beforeExit) {
  var calledback = false
    , question   = new Question(__dirname + '/../../static/questionform.xml.jade', {
        receipt: {
            imageURL: 'http://tictactoe.amazon.com/game/01523/board.gif'
          , imageSubType: 'gif'
        }
      });

  var scope = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .post('/', 'HITTypeId=1&LifetimeInSeconds=1400&Service=AWSMechanicalTurkRequester&Operation=CreateHIT')
                .replyWithFile(200, __dirname + '/../static/hit_create_response_invalid.xml');

  HIT.create(1, question, 1400, undefined, function(errors, hit) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNotNull(errors);
    assert.eql(1, errors.length);
    assert.eql('Caneco Code: Caneco!', errors[0].message);
  });

  beforeExit(function() {
    assert.ok(calledback);
  });
};

exports.testGetValid = function(beforeExit) {
  var calledback = false;


  var scope = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .filteringPath(filterBody)
                .get('/?HITId=ZZRZPTY4ERDZWJ868JCZ&Service=AWSMechanicalTurkRequester&Operation=GetHIT')
                .replyWithFile(200, __dirname + '/../static/hit_get_response.xml');

  HIT.get('ZZRZPTY4ERDZWJ868JCZ', function(err, hit) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
    var should = {
        "errors":[]
      , "question":{
          "QuestionForm":{
              "Question":{
                  "QuestionIdentifier":"Question100"
                , "DisplayName":"My Question"
                , "IsRequired":"true"
                , "QuestionContent":{
                    "Binary":{
                        "MimeType":{
                          "Type":"image","SubType":"gif"
                        }
                  , "DataURL":"http://tictactoe.amazon.com/game/01523/board.gif"
                  ,"AltText":"The game board, with \"X\" to move."}
                }
              , "AnswerSpecification":{
                  "FreeTextAnswer":{}
              }
            }
          }
        }
      , "maxAssignments":"1"
      , "id":"ZZRZPTY4ERDZWJ868JCZ"
      , "hitTypeId":"NYVZTQ1QVKJZXCYZCZVZ"
      , "creationTime":"2009-07-07T00:56:40Z"
      , "title":"Location"
      , "description":"Select the image that best represents"
      , "hitStatus":"Assignable"
      , "reward":{
          "Amount":"5.00"
        , "CurrencyCode":"USD"
        , "FormattedPrice":"$5.00"
        }
      , "autoApprovalDelayInSeconds":"2592000"
      , "expiration":"2009-07-14T00:56:40Z"
      , "assignmentDurationInSeconds":"30"
      , "numberOfSimilarHITs":"1"
      , "hitReviewStatus":"NotReviewed"
      , "requesterAnnotation": {"path":"/r_pedro_2eteixeira_40gmail_2ecom/fbf83626c1e8e8ce7a27c943b30097a8"}
    };
    assert.eql(should, hit);
  });

  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
};

exports.testGetReviewableSingleResponse = function(beforeExit) {
  var calledback = false;

  var scope = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .filteringPath(filterBody)
                .get('/&Service=AWSMechanicalTurkRequester&Operation=GetReviewableHITs')
                .replyWithFile(200, __dirname + '/../static/hit_getRevieweable_single_response.xml');
  
  HIT.getReviewable(undefined, function(err, numResults, totalNumResults, pageNumber, hits) {
    calledback = true;
    assert.isNull(err);
    assert.eql(1, numResults);
    assert.eql(1, totalNumResults);
    assert.eql(1, pageNumber);
    assert.eql([{
        "errors":[]
      , "id":"GBHZVQX3EHXZ2AYDY2T0"
    }], hits);
  });
  
  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
};

exports.testGetReviewableMultipleResponse = function(beforeExit) {
  var calledback = false;
  
  var scope = nock('https://mechanicalturk.amazonaws.com')
                .filteringRequestBody(filterBody)
                .filteringPath(filterBody)
                .get('/?HitTypeId=ABCDEF&Service=AWSMechanicalTurkRequester&Operation=GetReviewableHITs')
                .replyWithFile(200, __dirname + '/../static/hit_getRevieweable_multiple_response.xml');

  HIT.getReviewable({hitTypeId: 'ABCDEF'}, function(err, numResults, totalNumResults, pageNumber, hits) {
    assert.ok(! calledback);
    calledback = true;
    assert.isNull(err);
    assert.eql(10, numResults);
    assert.eql(12, totalNumResults);
    assert.eql(1, pageNumber);
    assert.eql([
        {
            "errors":[]
          , "id":"GBHZVQX3EHXZ2AYDY2T0"
        }
      , {
            "errors":[]
          , "id":"3EHXZ2AYDY2T0GBHZVQX"
        }
      , {
            "errors":[]
          , "id":"YDY2T0GBHZVQX3EHXZ2A"
        }
      , {
            "errors":[]
          , "id":"2GBHZVQX3EHXZ2AYDY2T0"
        }
      , {
            "errors":[]
          , "id":"23EHXZ2AYDY2T0GBHZVQX"
        }
      , {
            "errors":[]
          , "id":"2YDY2T0GBHZVQX3EHXZ2A"
        }
      , {
            "errors":[]
          , "id":"3GBHZVQX3EHXZ2AYDY2T0"
        }
      , {
            "errors":[]
          , "id":"3EHXZ2AYDY2T0GBHZVQX"
        }
      , {
            "errors":[]
          , "id":"3DY2T0GBHZVQX3EHXZ2A"
        }
      , {
            "errors":[]
          , "id":"4GBHZVQX3EHXZ2AYDY2T0"
        }
      ], hits);
  });
  
  beforeExit(function() {
    scope.done();
    assert.ok(calledback);
  });
};

