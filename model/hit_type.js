module.exports = function(conf) {
  var request      = require('../lib/request')(conf)
    , inherits     = require('util').inherits
    , Base         = require('./base')
    , Notification = require('./notification')(conf)
    , Price        = require('./price')(conf)
    , ret = {};

  function HITType(title, description, reward, assignmentDurationInSeconds, keywords, autoApprovalDelayInSeconds, qualificationRequirement) {
    this.errors = [];
    if (title) this.title = title;
    if (description) this.description = description;
    if (reward) this.reward = reward;
    if (assignmentDurationInSeconds) this.assignmentDurationInSeconds = assignmentDurationInSeconds;
    if (keywords) this.keywords = keywords;
    if (autoApprovalDelayInSeconds) this.autoApprovalDelayInSeconds = autoApprovalDelayInSeconds;
    if (qualificationRequirement) this.qualificationRequirement = qualificationRequirement;
  }

  inherits(HITType, Base);

  HITType.prototype.errors = function() {
    return this.errors;
  };

  HITType.prototype.validate = function(v) {
    v.check(this.title, 'Please enter a valid title').notNull().len(0, 128);
    v.check(this.description, 'Please enter a valid description').notNull().len(0, 2000);
    if (this.reward.valid && ! this.reward.valid()) this.reward.errors.forEach(function(err) { v.error("Error in reward: " + err); });
    v.check(this.assignmentDurationInSeconds, 'Please enter an assignmentDurationInSeconds').notNull().isInt();
    if (this.keywords, 'Please enter valid keywords') v.check(this.keywords).len(0, 1000);
    if (this.autoApprovalDelayInSeconds) {
      v.check(this.autoApprovalDelayInSeconds, 'Please enter a valid autoApprovalDelayInSeconds').notNull().isInt();
      if (this.autoApprovalDelayInSeconds > 2592000) v.error('autoApprovalDelayInSeconds must be <= 2592000');
    }
  };

  HITType.prototype.populateFromResponse = function(response) {
    Base.prototype.populateFromResponse.call(this, response, {HITTypeId: 'hitTypeId'});
  }

  HITType.prototype.create = function(callback) {
    var self = this
      , options, remoteErrosr;

    if (! this.valid()) { callback(this.errors); return; }

    options = {
        Title: this.title
      , Description: this.description
      , Reward: this.reward
      , AssignmentDurationInSeconds: this.assignmentDurationInSeconds
    }
    if (this.keywords) options.Keywords = this.keywords;
    if (this.autoApprovalDelayInSeconds) options.autoApprovalDelayInSeconds = this.autoApprovalDelayInSeconds;

    request('AWSMechanicalTurkRequester', 'RegisterHITType', 'POST', options, function(err, response) {
      if (err) { callback([err]); return; }

      remoteErrors = self.remoteRequestValidationError(response.RegisterHITTypeResult);
      if (remoteErrors) { callback(new Error(remoteErrors.join(', '))); return; }
      delete response.RegisterHITTypeResult.Request;

      if (! self.nodeExists(['RegisterHITTypeResult', 'HITTypeId'], response)) { callback([new Error('No "RegisterHITTypeResult > HITTypeId" node on RegisterHITType response')]); return; }
      self.id = response.RegisterHITTypeResult.HITTypeId;

      if (err) { err = [err]; }
      callback(err);
    });
  };

  /*
  * create a HITType
  * FIXME: validate reward and qualificationRequirement structures
  *
  * @param {title} The title for HITs of this type
  * @param {description} A general description of HITs of this type
  * @param {reward} The reward. Should be of type model/Price
  * @param {assignmentDurationInSeconds} The amount of time a Worker has to complete a HIT of this type after accepting it. integer. in seconds. between 30 (30 seconds) and 3153600 (365 days)
  * @param {options.keywords} One or more words or phrases that describe a HIT of this type, separated by commas. string < 1000 chars. Optional.
  * @param {options.autoApprovalDelayInSeconds} An amount of time, in seconds, after an assignment for a HIT of this type has been submitted, that the assignment becomes Approved automatically, unless the Requester explicitly rejects it. integer. Optional. Default is 2592000 (30 days)
  * @param {callback} function with signature (Array errors || null, HITType hitType)
  * 
  */

  ret.create = function(title, description, reward, assignmentDurationInSeconds, options, callback) {
    if (! options) options = {};
    var keywords = options.keywords
      , autoApprovalDelayInSeconds = options.autoApprovalDelayInSeconds
      , qualificationRequirement = options.qualificationRequirement
      , hitType = new HITType(title, description, reward, assignmentDurationInSeconds, keywords, autoApprovalDelayInSeconds);

    hitType.create(function(err) {
      if (err) { callback(err); return; }
      callback(null, hitType);
    });
  };


  /*
   * Sets the notification for a HITType
   *
   * @param {hitTypeId} the HIT type id (string)
   * @param {notification} the notification structure
   * @param {active} (the lifetime, in seconds (int))bookean
   * @param {callback} function with signature (error)
   * 
   */
  ret.setNotification = function setNotification(hitTypeId, notification, active, callback) {
    var options = {
        HITTypeId: hitTypeId
      , Notification: notification
      , Active: active
    };

    if (! notification.valid()) { callback(new Error('invalid Notification: ' + notification.errors.join(', '))); return; }

    request('AWSMechanicalTurkRequester', 'SetHITTypeNotification', 'POST', options, function(err, response) {
      callback(err);
    });
  };

  /*
   * Sets the notification for this HITType
   *
   * @param {notification} the notification structure
   * @param {active} (the lifetime, in seconds (int))bookean
   * @param {callback} function with signature (error)
   * 
   */
  HITType.prototype.setNotification = function(notification, active, callback) {
    setNotification(this.id, notification, active, callback);
  };
  
  return ret;
};