var expat = require('node-expat');

function removeParentLinks(node) {
  if (! node) return;
  if (node.parent) delete(node.parent);
  if (typeof(node) == 'object') {
    Object.keys(node).forEach(function(key) {
      removeParentLinks(node[key]);
    });
  }
}

/*
 * Decode an UTF-8 XML readStream into a plain javascript object
 *
 * @param {rs} The readStream
 * @param {callback} A function that accepts (error, rootDoc). rootDoc is a Javascript object
 * 
 */
exports.decodeReadStream = function(rs, callback) {
  var parser = new expat.Parser("UTF-8")
    , stack = []
    , calledback = false
    , currentElementKey
    , root;

  function head() {
    return stack.length > 0 ? stack[stack.length - 1] : undefined;
  }

  parser.on('startElement', function(name) {
    var parent = head();
    if (! parent) parent = root = {};
    var self = {parent: parent};

    currentElementKey = name;
    
    if (! parent[name]) {
      parent[name] = self;
    } else {
      // if we have a sibling with the same name, join them
      var sibling = parent[name];
      if (Array.isArray(sibling)) {
        sibling.push(self);
      } else {
        parent[name] = [sibling, self];
      }
    }
    
    stack.push(self);
  });

  parser.on('endElement', function(name) {
    stack.pop();
  });

  parser.on('text', function(text) {
    if (text.trim().length === 0) return;
    var leaf = head();
    var elem = leaf.parent[currentElementKey];
    if (Array.isArray(elem)) {
      elem.forEach(function(oneElem, index) {
        if (typeof(oneElem) == 'object' && oneElem.parent) {
          elem[index] = text;
        }
      });
    } else {
      leaf.parent[currentElementKey] = text;
    }
  });
  
  rs.on('data', function(data) {
    parser.parse(data);
  });
  rs.on('end', function() {
    if (!calledback) {
      calledback = true;
      removeParentLinks(root);
      callback(null, root);
    }
  });
};