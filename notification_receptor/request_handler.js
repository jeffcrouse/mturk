var EventEmitter = require('events').EventEmitter;
  
function parseEventParam(paramParts, value, events) {
  var index = parseInt(paramParts[1], 10) - 1;
  var event = events[index] || {};
  event[paramParts[2]] = value;
  events[index] = event;
}

function parseEvents(params) {
  var events = [];
  Object.keys(params).forEach(function(param) {
    var parts = param.split('.');
    if (parts[0] == 'Event') {
      parseEventParam(parts, params[param], events);
    }
  });
  return events;
}

function lowerFirstChar(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

var emitter = new EventEmitter();

function handle(req, res) {
  var self = this
    , events;
    
  delete req.query.method;
  delete req.query.Signature;
  delete req.query.Timestamp;
  delete req.query.Version;

  events = parseEvents(req.query);
  events.forEach(function(event) {
    event.eventType = lowerFirstChar(event.EventType);
    emitter.emit('any', event);
    emitter.emit(event.eventType, event);
  });
  
  res.end();
  
};

module.exports = handle;
module.exports.emitter = emitter;