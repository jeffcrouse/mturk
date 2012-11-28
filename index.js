module.exports = function(conf) {
  var EventEmitter         = require('events').EventEmitter
    , notificationReceptor = require('./notification_receptor')(conf)
    , HIT                  = require('./model/hit')(conf)
    , uri                  = require('./lib/uri')
    , ret;

  var POLLER_INTERVAL_MS = conf.poller && conf.poller.frequency_ms || 60000;
  
  uri.setBaseURI(conf.url ||  "http://mechanicalturk.amazonaws.com")

  var notification = new EventEmitter();

  ret = notification;
  var started = false;
  var recentlyReviewed = {};
  var clearTimeouts = [];

  function emitHitReviewable(hitId, emitAny) {
    var emitted = false
      , timeout;
    if (! recentlyReviewed[hitId]) {
      recentlyReviewed[hitId] = true;
      if (emitAny) { notification.emit('any', {EventType: 'HITReviewable', HITId: hitId, eventType: 'hITReviewable'}); }
      notification.emit('HITReviewable', hitId);
      // eventually delete hitId from list so it doesn't grow too much
      timeout = setTimeout(function() {
        var pos = clearTimeouts.lastIndexOf(timeout);
        if (pos >= 0) { clearTimeouts.splice(pos, 1); }
        delete recentlyReviewed[hitId];
      }, POLLER_INTERVAL_MS * 10);
      clearTimeouts.push(timeout);
      emitted = true;
    }
    return emitted;
  }

  function startNotificationReceptor() {
    notificationReceptor.start();
    notificationReceptor.on('any', function(event) {
      if (event.EventType == 'HITReviewable') {
        emitHitReviewable(event.HITId, false);
      } else {
        notification.emit(event.eventType, event);
      }
    });
  }

  var pollerTimeout;

  function startPoller() {
    (function get(pageNumber) {
      if (! pageNumber) pageNumber = 1;
      HIT.getReviewable({pageSize: 20, pageNumber: pageNumber, status: 'Reviewable'}, function(err, numResults, totalNumResults, pageNumber, hits) {
        var reschedule = true;

        if (! err) {
          hits.forEach(function(hit) {
            emitHitReviewable(hit.id, true)
          });
          if (numResults > 0 && totalNumResults > numResults) {
            reschedule = false;
            get(pageNumber + 1);
          }
        }
        if (reschedule) pollerTimeout = setTimeout(get, POLLER_INTERVAL_MS);
      });
    })();
  }

  var oldNotificationOn = notification.on;
  notification.on = function(event, callback) {
    if (! started) {
      startNotificationReceptor();
      startPoller();
      started = true;
    }
    oldNotificationOn.call(notification, event, callback);
  };

  notification.stopListening = function() {
    notificationReceptor.stop();
    if (pollerTimeout) {
      clearTimeout(pollerTimeout);
    }
    clearTimeouts.forEach(function(timeout) {
      clearTimeout(timeout);
    });
  };

  ret.HIT          = HIT;
  ret.HITType      = require('./model/hit_type')(conf);
  ret.Price        = require('./model/price')(conf);
  ret.Notification = require('./model/notification')(conf);
  ret.Assignment   = require('./model/assignment')(conf);
  
  return ret;
};
