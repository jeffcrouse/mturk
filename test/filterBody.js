module.exports = function(body) {
  body = body.replace(/(&|\?)AWSAccessKeyId=[^&]*/, '')
    .replace(/(&|\?)Timestamp=[^&]*/, '')
    .replace(/(&|\?)Signature=[^&]*/, '')
    .replace(/(&|\?)Version=[^&]*/, '')
    .replace(/(&|\?)Question=[^&]*/, '')
  return body;
};