var EventEmitter = require('events').EventEmitter
  , fs      = require('fs');

var mocks = {};
var statuses = {};


function strip(str) {
  // Remove AWS account and time-specific arguments from the URL. Just match the rest.
  str = str.replace(/(&|\?)AWSAccessKeyId=[^&]*/, '')
    .replace(/(&|\?)Timestamp=[^&]*/, '')
    .replace(/(&|\?)Signature=[^&]*/, '')
    .replace(/(&|\?)Version=[^&]*/, '')
    .replace(/(&|\?)Question=[^&]*/, '')
    .replace(/(https?:\/\/[^\/]+\/)(\?)/, "$1&");
  return str;
}

module.exports = function(url, file, status) {
  mocks[url] = file;
  if (status) statuses[url] = status;
};

var http = require('http');
http.request = function(options, callback) {
  var req = new EventEmitter()
    , response = new EventEmitter()
    , encoding
    , uri = strip('http://' + options.host + options.path)
    , requestKey = uri
    , body = '';
    
  if (!callback) throw new Error('must provide a callback function');
   
  req.write = function(buffer) {
    if (buffer) body += buffer.toString(encoding);
  };
  
  req.end = function(buffer) {
    req.write(buffer);
    req.emit('end');
  };

  req.on('end', function() {
    
    if (options.method.toLowerCase() == 'post') {
      requestKey += '&' + strip(body);
    }

    response.statusCode = statuses[requestKey] || 200;
    if (statuses[requestKey]) delete statuses[requestKey];

    response.headers = {};
    response.setEncoding = function(enc) {
      encoding = enc;
    }

    req.end = function() {
      req.emit('end');
    };

    var responseFilePath = mocks[requestKey];
    if (! responseFilePath) {
      callback(new Error('Could not find response file path for url ' + requestKey));
      return;
    }
    delete mocks[requestKey];

    var rs = fs.createReadStream(responseFilePath);
    rs.on('data', function(data) { response.emit('data', data); })
    rs.on('end', function() {response.emit('end'); })
    rs.on('close', function() { response.emit('close'); })
    rs.on('error', function(error) { response.emit('error', error); })

    callback(response);
  });
  
  return req;
};
