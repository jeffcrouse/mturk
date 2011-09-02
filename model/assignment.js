module.exports = function(config) {
  var request    = require('../lib/request')(config)
    , inherits   = require('util').inherits
    , Base       = require('./base')
    , ret        = {};

  function Assignment() {
  }

  inherits(Assignment, Base);

  Assignment.prototype.populateFromResponse = function(response) {
    Base.prototype.populateFromResponse.call(this, response, {
        AssignmentId: 'id'
      , HITId: 'hitId'
    });
  };

  /*
   * Approves a Assignment
   *
   * @param {assignmentId} the Assignment id (string)
   * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional.
   * @param {callback} function with signature (error)
   * 
   */
  ret.approve = function approve(assignmentId, requesterFeedback, callback) {
    var options = {
        assignmentId: assignmentId
      , RequesterFeedback: requesterFeedback
    };
    request('AWSMechanicalTurkRequester', 'ApproveAssignment', 'POST', options, function(err, response) {
      callback(err);
    });
  }


  /*
   * Approves the Assignment
   *
   * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional
   * @param {callback} function with signature (error)
   * 
   */
  Assignment.prototype.approve = function(requesterFeedback, callback) {
    return approve(this.id, requesterFeedback, callback);
  };


  /*
   * Rejects a Assignment
   *
   * @param {assignmentId} the Assignment id (string)
   * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional.
   * @param {callback} function with signature (error)
   * 
   */
  ret.reject = function reject(assignmentId, requesterFeedback, callback) {
    var options = {
        assignmentId: assignmentId
      , RequesterFeedback: requesterFeedback
    };
    request('AWSMechanicalTurkRequester', 'RejectAssignment', 'POST', options, function(err, response) {
      callback(err);
    });
  }


  /*
   * Rejects the Assignment
   *
   * @param {requesterFeedback} A message for the Worker, which the Worker can see in the Status section of the web site. (string max 1024 characters). Optional
   * @param {callback} function with signature (error)
   * 
   */
  Assignment.prototype.reject = function(requesterFeedback, callback) {
    return reject(this.id, requesterFeedback, callback);
  };
  
  return ret;
  
};