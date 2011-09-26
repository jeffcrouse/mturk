module.exports = function(config) {
  var request   = require('request')
    , winston   = require('winston')
    , uri       = require('./uri')
    , xml       = require('./xml-native')
    , signature = require('./signature')

  // setup logging
  var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            filename: __dirname + '/../log/mturk.log'
          , timestamp: true
          , colorize: true
          , level: config.log && config.log.level || 'info'
        })
    ]
  });

  function loginfo(requestId, message, meta) {
    logger.info('[' + requestId + '] - ' + message, meta);
  }

  function logerror(requestId, message, meta) {
    logger.error('[' + requestId + '] - ' + message, meta);
  }

  function doRequest(service, operation, method, params, callback) {
    var requestId = Math.floor(Math.random() * 1000000000)
      , calledback = false
      , lcMethod = method.toLowerCase()
      , requestArgs = {
            method: method
          , encoding: 'utf8'
        }
      , rawBody;

    if (lcMethod == 'post') {
      requestArgs.body = uri.encodeParams(service, operation, params);
      requestArgs.uri = uri.postURI();
      requestArgs.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    } else if (lcMethod == 'get') {
      requestArgs.uri = uri(service, operation, params);
    } else {
      callback(new Error('Invalid method: ' + method));
      logerror('Invalid method: ' + method);
      return;
    }

    function error(err) {
      if (err && ! calledback) {
        calledback = true;
        if (! err instanceof Error) err = new Error(err);
        logerror(requestId, 'Error performing MTurk request', {error: err.message});
        callback(err);
      }
    }

    requestArgs.onResponse = function (err, response) {
      if (err) { error(err); return; }
      if (response.statusCode >= 300) {
        error("Request to " + requestArgs.uri + ' (' + requestArgs.method + ') failed with status code ' + response.statusCode);
      }
    };

    loginfo(requestId, 'Mturk <-', {
        service: service
      , operation: operation
      , params: JSON.stringify(params)
      , requestArgs: JSON.stringify(requestArgs)
    });

    var req = request(requestArgs);
    req.on('error', function(err) { error(err); });
    req.on('data', function(data) {
      loginfo(requestId, 'Mturk ->', {data: data.toString()});
    });

    xml.decodeReadStream(req, function(err, decodedBody) {
      var responseRootKey = operation + "Response"
        , responseRoot
        , errors;

      if (err) { error(err); return; }
      if (!err)  loginfo(requestId, 'Mturk ->', {
        decodedResponseBody: JSON.stringify(decodedBody)
      });

      if (decodedBody) responseRoot = decodedBody[responseRootKey]
      if (! responseRoot) { error('Response should contain root element named ' + responseRootKey); return; }

      var operationRequest = responseRoot.OperationRequest;
      if (! operationRequest) { error('OperationRequest node not found on response root node'); return; }

      if (operationRequest.Errors) {
        errors = operationRequest.Errors.Error;
        // Error may be an array or a string, we have to generalize as an array
        if (! Array.isArray(errors)) { errors = [errors]; }
        errors = errors.map(function(err) {
          if (typeof(err) !== 'string') {
            return JSON.stringify(err);
          }
          return err;
        });
        error(new Error("Error performing operation " + operation + ": " + errors.join(', ')));
        return;
      }

      // We don't need this part of the response from mturk if we don't have errors
      delete responseRoot.OperationRequest;

      // Be sure we don't callback more than once
      if (! calledback) {
        calledback = true;
        callback(err, responseRoot); // reply with the response root instead of the absolute root. we don't need it.
      }
    });
  }

  /*
   * Request an operation to Mechanical Turk using the AWS RESTful API
   *
   * @param {service} the service (string)
   * @param {operation} the operation (string)
   * @param {method} the HTTP method ("POST" or "GET")
   * @param {params} an object containing the operation arguments
   * @param {callback} a function with the signature (error, response)
   * 
   */
  return function(service, operation, method, params, callback) {
    var completeParams = {}
      , timestamp = new Date().toISOString();

    Object.keys(params).forEach(function(key) { completeParams[key] = params[key]; })
    completeParams.AWSAccessKeyId = config.accessKeyId;
    completeParams.Timestamp = timestamp;
    completeParams.Signature = signature(config.secretAccessKey, service, operation, timestamp);
    // completeParams.ResponseGroup = ['Minimal', 'Request'];

    doRequest(service, operation, method, completeParams, callback);
  }
};