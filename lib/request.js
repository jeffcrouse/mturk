module.exports = function(config) {
  var request   = require('request')
    , winston   = require('winston')
    , uri       = require('./uri')
    , xml       = require('./xml-native')
    , signature = require('./signature')

  // setup logging

  var transports = [
       
  ];

  if (config.logfile !== false) {
    transports.push(
       new winston.transports.File({
              filename: config.logfile || __dirname + '/../log/mturk.log'
            , timestamp: true
            , colorize: true
            , level: config.log && config.log.level || 'info'
          })
      );
  }

  if (config.logger) {
      transports.push(config.logger);
  }

  var logger = transports.length && new winston.Logger({
    transports: transports
  });

  function loginfo(requestId, message, meta) {
    meta._request_id = requestId;
    logger && logger.info('[' + requestId + '] - ' + message, meta);
  }

  function logerror(requestId, message, meta) {
    meta._request_id = requestId;
    logger && logger.error('[' + requestId + '] - ' + message, meta);
  }

  function doRequest(service, operation, method, params, resultKey, callback) {

   

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

    function error(err, result) {
      if (err && ! calledback) {
        calledback = true;
        if (! (err instanceof Error)) {
            var message = err;
            if (result && result.Errors && result.Errors.length) {
               if (result.Errors[0].Code) {
                  message += " (" + result.Errors[0].Code + ") ";
               }
               message += result.Errors[0].Message
            }
            err = new Error(message);
        }
        err.Result = result;
        logerror(requestId, 'Error performing MTurk request', {error: err.message});
        callback(err);
      }
    }

    function getErrors(obj) {

      // is it valid?
      //
      var invalid = obj.IsValid && obj.IsValid.toLowerCase() != 'true';

      if (!invalid) {
        return null;
      }

      var errors = obj.Errors;
      if (obj.Errors) {
          // Error may be an array or a string, we have to generalize as an array
          if (! Array.isArray(errors)) { errors = [errors]; }

          errors = errors.map(function(err) {
            if (typeof(err) == 'string') {
              err = {Message: err}
            }
            return {
              Code: err.Error.Code,
              Message:err.Error.Message
            };
          });
      }
      else {
        errors = [{Message: "Response says request is invalid but no errors were given"}];
      }
      return errors;
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
      , params: params
      , requestArgs: requestArgs
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
        decodedResponseBody:decodedBody
      });

      var operationRequest;
      if (decodedBody) responseRoot = decodedBody[responseRootKey]
      if (! responseRoot) { 
        if (decodedBody.Response) {
            operationRequest = decodedBody.Response;
        }
        else {
          error('Response should contain root element named ' + responseRootKey,{}); return; 
        }
      }
      else {
        operationRequest = responseRoot.OperationRequest;
      }

      if (!responseRoot && ! operationRequest) { error('OperationRequest node not found on response root node'); return; }

      var res = {
        RequestId: operationRequest.RequestId
      }


      res.Errors = getErrors(operationRequest);
      if (res.Errors) {
        return error("Error calling " + operation, res);
      }

      // get the result.
      //
      var result = responseRoot[resultKey];

      if (!result) {
        throw new Error("Expected " + resultKey + " in operation " + operation);
      }

      res.Errors = getErrors(result.Request);

      if (res.Errors) {
         return error("Error calling " + operation, res);
      }
      res.Result = result;
      delete res.Result.Request;
      
      // Be sure we don't callback more than once
      if (! calledback) {
        calledback = true;
        callback(err, res); // reply with the response root instead of the absolute root. we don't need it.
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
  return function(service, operation, method, params, resultKey, callback) {
    var completeParams = {}
      , timestamp = new Date().toISOString();

    if (typeof(resultKey) == 'function') {
      callback = resultKey;
      resultKey = operation + 'Result';
    }

    Object.keys(params).forEach(function(key) { completeParams[key] = params[key]; })
    completeParams.AWSAccessKeyId = config.accessKeyId;
    completeParams.Timestamp = timestamp;
    completeParams.Signature = signature(config.secretAccessKey, service, operation, timestamp);
    // completeParams.ResponseGroup = ['Minimal', 'Request'];

    doRequest(service, operation, method, completeParams, resultKey, callback);
  }
};