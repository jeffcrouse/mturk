var sax    = require('sax')
  , util   = require('util')
  , strict = true;

function remove_parents(node) {
  if (!node) return;
  if (node._parent) delete(node._parent);
  if (typeof(node) == 'object') {
    Object.keys(node).forEach(function(key) {
      remove_parents(node[key]);
    });
  }
}

function decode_read_stream(read_stream,callback) {
  var parser = sax.createStream(strict, {trim: true, normalize: true})
    , response = {}
    , stack    = []
    , calledback = false
    , parent
    , root
    , current_name
    , self
    , sibling;

  parser.on('error', 
    function (error) {
      console.error(new Error('error parsing stream: ' + (read_stream.uri && read_stream.uri.href)  + "\n" + util.inspect(error)));
      this._parser.error = null;
      this._parser.resume();
  });
  parser.on('opentag', function (node) { // name and attributes
    parent = stack.length > 0 ? stack[stack.length - 1] : undefined;
    if (!parent) { parent = root = {}; }
    self         = { '_parent': parent };
    current_name = node.name;
    sibling      = parent[current_name];
    if (!sibling) {
      parent[current_name] = self;
    } else {
      if (Array.isArray(sibling)) {
        sibling.push(self);
      } else {
        parent[current_name] = [sibling, self];
      }
    }
    stack.push(self);
  });
  parser.on('closetag', function (node_name) {
    stack.pop();
  });
  parser.on('text',
    function (text) {
      if (text.length === 0) return;
      var leaf = stack.length > 0 ? stack[stack.length - 1] : undefined;
      var elem = leaf._parent[current_name];
      if (Array.isArray(elem)) {
        elem.forEach(function(oneElem, index) {
          if (typeof(oneElem) == 'object' && oneElem._parent) {
            elem[index] = text;
          }
        });
      } else {
        leaf._parent[current_name] = text;
      }
  });
  read_stream.on('data', function(data) { parser.write(data); });
  read_stream.on('end', function() {
    if (!calledback) {
      calledback = true;
      remove_parents(root);
      // console.log(JSON.stringify(root));
      callback(null, root);
    }
  });
}

module.exports = exports = { decodeReadStream: decode_read_stream };