Klass('trackr.CookieManager',
    /**
     * @class
     * @alias trackr.CookieManager
     * 内部匿名构造函数
     * @param {Object} kv
     */
    function(kv) {
      /** The value. */
      this.value = kv;
    }

  );

/** @namespace */
var Apple = {};

(function(ns) {
  /**
   * @namespace
   * 定义了@namespace的静态成员上
   * @alias Apple.Core
   */
  var core = {};

  /** Documented as Apple.Core.seed */
  core.seed = function() {
  };

  ns.Core = core;
})(Apple);

// Documenting objectA with @alias
var objectA = (function() {

  /**
   * Documented as objectA
   * @alias objectA
   * 用在一个对象上
   * @namespace
   */
  var x = {
    /**
     * Documented as objectA.myProperty
     * @member
     */
    myProperty: 'foo'
  };

  return x;
})();

// Documenting objectB with @lends

/**
 * Documented as objectB
 * @namespace
 */
var objectB = (function() {

  /** @lends objectB */
  var x = {
    /**
     * Documented as objectB.myProperty
     * @member
     */
    myProperty: 'bar'
  };

  return x;
})();

// @alias 和 @name的不同
/**
 * Bar function.
 * @name bar1
 */
function foo() {}

/**
 * Bar function.
 * @alias bar2
 */
function foo() {}


