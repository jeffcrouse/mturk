module.exports = function(conf) {
  var inherits  = require('util').inherits
    , Base      = require('./base')
    , ret;

  var SUPPORTED_EVENT_TYPES = [
      'AssignmentAccepted'
    , 'AssignmentAbandoned'
    , 'AssignmentReturned'
    , 'AssignmentSubmitted'
    , 'HITReviewable'
    , 'HITExpired'
  ];

  var Notification = ret = function(destination, transport, eventTypes) {
    this.destination = destination
    this.transport = transport;
    this.eventType = eventTypes;
    this.version = '2006-05-05';
  };

  inherits(Notification, Base);

  Notification.prototype.validate = function(v) {
    v.check(this.destination, 'Please provide a destination').notNull();
    v.check(this.transport, 'Please provide a valid transport').isIn(['Email', 'SOAP', 'REST']);
    v.check(this.eventType, 'Please provide the event types').notNull();
    if (! Array.isArray(this.eventType)) {
      v.error('eventTypes argument should be array');
    } else {
      if (this.eventType.length === 0) { v.error('event type array should have at least one element'); }
      else {
        this.eventType.forEach(function(eventType) {
          v.check(eventType, 'Event type is not in ' + JSON.stringify(SUPPORTED_EVENT_TYPES)).isIn(SUPPORTED_EVENT_TYPES);
        });
      }
    }
  };


  /*
   * Instantiates a new Notification
   *
   * @param {destination} The destination for notification messages (string)
   * @param {transport} The method Amazon Mechanical Turk uses to send the notification (string). Valid values are: Email | SOAP | REST
   * @param {eventTypes} The events that should cause notifications to be sent. Array
   * 
   * @return the new Notification instance
   */
  ret.build = function(destination, transport, eventTypes) {
    return new Notification(destination, transport, eventTypes);
  };
  
  return ret;
}