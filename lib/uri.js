var baseURI = "https://mechanicalturk.amazonaws.com";

function uriFromPath(path) {
  var uri = baseURI;
  if (path) uri += '/?' + path;
  return uri;
}

function nameValue(name, value) {
  return encodeURIComponent(name) + "=" + encodeURIComponent(value);
}

function toURIComponent(key, o, first) {
  var paramKeys, params;

  if (typeof(o) == 'object') {
    if (first) key = key + '.1';
    return Object.keys(o).map(function(newKey) {
      var theKey = newKey;
      if (Array.isArray(o)) theKey = parseInt(newKey.toString(), 10) + 1;
      if (typeof theKey != 'number') theKey = theKey.charAt(0).toUpperCase() + theKey.slice(1);
      return toURIComponent(key + '.' + theKey, o[newKey]);
    });    
  } else {
    return (o == undefined ? null : nameValue(key, o));
  }
};

function flatten(arr, output) {
  arr.forEach(function(elt) {
    if (Array.isArray(elt)) {
      flatten(elt, output);
    } else {
      output.push(elt);
    }
  });
  return output;
}

function encodeParamsRaw(params) {
  var args = [];
  
  if (! params) params = {};
  Object.keys(params).forEach(function(key) {
    var components;
    if (! Array.isArray(params[key])) {
      components = toURIComponent(key, params[key], true);
    } else {
      components = toURIComponent(key, params[key], false);
    }
    if (! Array.isArray(components)) components = [components];
    components.forEach(function(component) {
      console.log(component);
      if (component != null) args.push(component);
    })
  });

  return flatten(args, []).join('&');
}

function encodeParams(service, operation, params) {
  var newParams = {};
  
  if (! params) params = {};
  
  Object.keys(params).forEach(function(key) { newParams[key] = params[key]; });
  
  newParams["Service"] = service;
  newParams["Operation"] = operation;
  newParams["Version"] = "2008-08-02";
  
  return encodeParamsRaw(newParams);
}


/*
 * Compose a mechanical turk URI for a given service, operation, and arguments
 *
 * @param {service} The service (string)
 * @param {operation} The operation (string)
 * @param {params} An object with the call params
 * 
 * @return the URI for this operation as a string
 */
module.exports = function(service, operation, params) {
  return uriFromPath(encodeParams(service, operation, params));
}

module.exports.postURI = function() {
  return uriFromPath();
};

module.exports.setBaseURI = function(path) {
  baseURI = path;
};

module.exports.encodeParams = encodeParams;
module.exports.encodeParamsRaw = encodeParamsRaw;