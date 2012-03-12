module.exports = function(conf) {
  var inherits  = require('util').inherits
    , Base      = require('./base')
    , jade      = require('jade')
    , ret;

  var Question = ret = function(templateFilePath, options) {
    this.templateFilePath = templateFilePath;
    this.options = options || {};
  };

  inherits(Question, Base);

  Question.prototype.validate = function(v) {
    v.check(this.templateFilePath, 'Please provide a templateFilePath').notNull();
  };

  Question.prototype.load = function(callback) {
    var self = this,
        calledback = false;
    
    jade.renderFile(this.templateFilePath, this.options, callback);
  };
  
  return ret;
};