var aws_creds = require('./aws_creds.js');

var config = {
    url: "http://mechanicalturk.sandbox.amazonaws.com"
    , receptor: {
          port: 8080
        , host: undefined
      }
    , accessKeyId: aws_creds.accessKeyId
    , secretAccessKey: aws_creds.secretAccessKey
}
  , assert   = require('assert')
  , uri      = require('../../lib/uri')
  , HITType  = require('../../model/hit_type')(config)
  , HIT      = require('../../model/hit')(config)
  , Price    = require('../../model/price')(config)
  , Question = require('../../model/question')(config)

uri.setBaseURI(config.url);

exports.testCreateHITTypeAndSearchAndExpireAndDispose = function(beforeExit) {
  var finished = false;
  
  var reward = new Price(0.1, 'USD');

  HITType.create('Extract info from receipt', 'Fill a form with the data from a scanned paper receipt', reward, 3600, {keywords: 'receipt'}, function(err, hitType) {
    
    assert.isNull(err);
    assert.isNotNull(hitType);
    
    assert.isNotNull(hitType.id);
    
    var question   = new Question(__dirname + '/../../static/questionform.xml.jade', {
        receipt: {
            imageURL: 'http://tictactoe.amazon.com/game/01523/board.gif'
          , imageSubType: 'gif'
        }
    });
    
    HIT.create(hitType.id, question, 3600, undefined, function(err, hit) {
      assert.isNull(err);
      assert.isNotNull(hit);
      assert.isNotNull(hit.id);
      
      HIT.get(hit.id, function(err, gotHit) {
        assert.isNull(err);
        assert.isNotNull(gotHit);
        assert.isNotNull(gotHit.id);
        assert.eql(hit.id, gotHit.id);
        
        HIT.search(undefined, function(err, numResults, totalNumResults, pageNumber, hits) {
          assert.isNull(err);
          assert.isNotNull(numResults);
          assert.isNotNull(totalNumResults);
          assert.isNotNull(pageNumber);
          assert.isNotNull(hits);
          var found = false;
          hits.forEach(function(searcHit) {
            if (searcHit.id === hit.id) found = true;
          });
          
          assert.ok(found);
          
          HIT.expire(gotHit.id, function(err) {
            assert.isNull(err);
            HIT.dispose(gotHit.id, function(err) {
              assert.isNull(err);
              HIT.get(hit.id, function(err, disposedHit) {
                assert.isNull(err);
                assert.isNotNull(disposedHit);
                assert.eql('Disposed', disposedHit.hitStatus);
                finished = true;
              });
            })
          })          
        });        
      });
    });
  });

  beforeExit(function() {
    assert.ok(finished);
  }); 
};

exports.testGetReviewable = function(beforeExit) {
  var finished = false;
  
  HIT.getReviewable(undefined, function(err, hits) {
    finished = true;
    assert.isNull(err);
    assert.isNotNull(hits);
  });
 
  beforeExit(function() {
    assert.ok(finished);
  }); 
}