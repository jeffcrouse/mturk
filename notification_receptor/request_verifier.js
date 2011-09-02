module.exports = function(config) {
  var signature = require('../lib/signature')

  return function(req, res, next) {
    var awsSignature = req.params.Signature;
    var timestamp = req.params.Timestamp;

    if (awsSignature =! signature(config.secretAccessKey, "AWSMechanicalTurkRequesterNotification", "Notify", timestamp)) {
      next(new Error('Invalid signature'));
    } else {
      next();
    }
  };
};