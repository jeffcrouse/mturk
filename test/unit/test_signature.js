var assert = require('assert');

exports.testSignature = function() {
  var signature = require('../../lib/signature');
  var producedSignature = signature('zzT2CTVVfFeXw/OrwezR8inI5WwiO/mlfGEXxvP1', 'ServiceA', 'OperationB', 'TimestampC');
  assert.equal('ahetR4WykYR8lA1oNA6G7oOn0Sg=', producedSignature);
};