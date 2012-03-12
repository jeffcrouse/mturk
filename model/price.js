module.exports = function(conf) {
  var inherits  = require('util').inherits
    , Base      = require('./base')
    , ret;

  var SUPPORTED_CURRENCIES = ['USD']; // Amazon MTurk limitation

  var Price = ret = function(amount, currencyCode) {
    if (amount) this.amount = amount;
    if (currencyCode) this.currencyCode = currencyCode;
  };

  inherits(Price, Base);

  Price.prototype.validate = function(v) {
    v.check(this.amount, 'Please provide a valid amount').notNull();
    v.check(this.amount, 'Please provide a valid amount').isFloat();
    v.check(this.currencyCode, 'Please provide a currency code').notNull();
    v.check(this.currencyCode, 'Please provide a valid currency code: ' + JSON.stringify(SUPPORTED_CURRENCIES)).isIn(SUPPORTED_CURRENCIES);
  };
  
  return ret;
};
