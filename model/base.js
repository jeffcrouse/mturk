require('underscore');
var Validator = require('validator').Validator;

var Base = module.exports = function() {};

Base.prototype.validate = function(validator) {};

Base.prototype.valid = function() {
  var self = this;
  
  this.errors = [];
  
  if (! (function validate() {
    var valid = true;
    var v = new Validator();
    v.error = function(msg) {
      self.errors.push(msg);
      valid = false;
    }
    
    self.validate(v);
    
    return valid;
  })()) { return false; }
  return true;
};

Base.responseKeyToObjectKey = function(responseKey) {
  return responseKey.charAt(0).toLowerCase() + responseKey.slice(1);
}

Base.objectKeyToResponseKey = function(responseKey) {
  return responseKey.charAt(0).toUpperCase() + responseKey.slice(1);
}

Base.prototype.populateFromResponse = function(response, hints) {
  var self = this;
  if (! hints) hints = {};
  
  Object.keys(response).forEach(function(key) {
    var newKey;
    if (hints[key]) {
      newKey = hints[key]
    } else {
      newKey = Base.responseKeyToObjectKey(key);
    }
    self[newKey] = response[key];
  });
};

Base.prototype.nodeExists = function(spec, node) {
  var specHead = spec.splice(0, 1)[0];

  if (node.hasOwnProperty(specHead)) {
    if (spec.length > 0) {
      return this.nodeExists(spec, node[specHead]);
    } else {
      return true;
    }
  } else {
    return false;
  }
};

Base.prototype.remoteRequestValidationError = function(resultNode) {
  
  if (! this.nodeExists(['Request', 'IsValid'], resultNode)) return 'No "Request > IsValid" node on response';
  
  if (resultNode.Request.IsValid.toLowerCase() != 'true') {
    var errors = resultNode.Request.Errors && resultNode.Request.Errors.Error;
    if (!errors) return "Response says request is invalid but no errors were given";
    if (! Array.isArray(errors)) errors = [errors];
    errors = errors.map(function(error) { return error.Code + ': ' + error.Message; });
    return errors;
  }
  
};