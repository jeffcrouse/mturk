module.exports = function(config) {
  var express         = require('express')
    , requestVerifier = require('./request_verifier')(config)
    , requestHandler  = require('./request_handler')
    , ret;

  var receptor = express();

  receptor.use(receptor.router);
  receptor.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  receptor.get('/', requestVerifier, requestHandler);

  ret = requestHandler.emitter;

  ret.start = function(callback) {
    receptor.listen(config.receptor.port, config.receptor.host, callback);
  };

  ret.stop = function() {
    receptor.close();
  };

  ret.server = receptor;
  
  return ret;
}
