var crypto = require('crypto');

/*
 * Generate a Mechanical Turk signature
 *
 * @param {secretAccessKey} your secret access key to AWS
 * @param {service} the service (string)
 * @param {operation} the operation (string)
 * @param {timestamp} the timestamp to be sent with the mturk message (string)
 * 
 * @return the base64-encoded signature (string)
 */
module.exports = function(secretAccessKey, service, operation, timestamp) {
  var hmac = crypto.createHmac('sha1', secretAccessKey);
  hmac.update(service + operation + timestamp);
  return hmac.digest('base64');
};