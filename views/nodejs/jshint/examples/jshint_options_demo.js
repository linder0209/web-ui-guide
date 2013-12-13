/* global console */
//1.bitwise
/* jshint bitwise: true*/
var a = 12 | 23;
console.info(a);

//camelcase
/* jshint camelcase: true*/
var upper_case = '123';//正确的写法为 UPPER_CASE
var camelCase = '';

//2.curly
/* jshint curly: true*/
var a = false;
if (a)
  console.info(a);

//3.eqeqeq
/* jshint eqeqeq: true*/
if (1 == 2) {
  console.info('宇宙消失了！');
}

//4.es3
/* jshint es3: true*/

//5.forin
/* jshint forin: true*/
var Obj1 = function() {
};
Obj1.prototype = {
  property1: '属性一'
};
var obj1 = new Obj1();
obj1.property2 = '属性二';

//如果方法体中不加hasOwnProperty判断，会提示错误警告的
for (var p in obj1) {
  if (obj1.hasOwnProperty(p)) {
    console.info('自己的属性：' + p);
  } else {
    console.info('继承的属性：' + p);
  }
}

//简单的继承
var Obj1Sub = function() {
};
Obj1Sub.prototype = new Obj1();
Obj1Sub.prototype.constructor = Obj1Sub;
Obj1Sub.prototype.property3 = '属性三';

var obj1Sub = new Obj1Sub();
for (var p in obj1Sub) {
  if (obj1Sub.hasOwnProperty(p)) {
    console.info('自己的属性：' + p);
  } else {
    console.info('继承的属性：' + p);
  }
}

//6.freeze
/* jshint freeze:true */
Array.prototype.count = function(value) {
  return 4;
};

//7.immed
/* jshint immed:true */
(function() {
  console.info(1);
}());

(function() {
  console.info(1);
})();

//8.indent
/*jshint indent:4 */
var cond = true;
if (cond) {
  console.info(1);
}

//9.latedef
/*jshint latedef: nofunc */
latedefFun();
function latedefFun() {
}

console.info(latedefVar);
var latedefVar = '1';

//9.newcap
/*jshint newcap: true */
function newcapFun() {
  this.a = 'a';
}
var newcapCon = new newcapFun();

//10.noarg
/*jshint noarg: true */
function noargFun() {
  console.info(arguments.callee);
  console.info(arguments.caller);
}

//11.noempty
/*jshint noempty: true */

//12.nonew
/*jshint nonew: true */
function nonewFun() {}
new nonewFun();

//13.plusplus
/*jshint plusplus: true */
var plus = 10;
plus++;
++plus;

//14.quotmark
/*jshint quotmark: true */
var quotmark1 = "";
var quotmark2 = '';

//15.undef
/*jshint undef:true */
function test() {
  var myVar = 'Hello, World';
  console.log(myvar);
}

//16.unused
/*jshint unused:true */
function test(a, b) {
  var c, d = 2;
  return a + d;
}
test(1, 2);
// Line 3: 'b' was defined but never used.
// Line 4: 'c' was defined but never used.

//17.strict
/*jshint strict:true */
var o = { p: 1, p: 2 };

//18.trailing
/*jshint trailing:true */
var str = "Hello \
World";

//19.maxparams
/*jshint maxparams:3 */
function login(request, onSuccess) {
  // ...
}
// JSHint: Too many parameters per function (4).
function logout(request, isManual, whereAmI, onSuccess) {
  // ...
}

//20.maxdepth
/*jshint maxdepth:2 */
function maxdepthFn(meaning) {
  var day = true;
  var tired = true;
  var shuffle = function(){
    tired = false;
  };
  var sleep = function(){
    console.info(1);
  };
  if (meaning === 42) {
    while (day) {
      shuffle();
      if (tired) { // JSHint: Blocks are nested too deeply (3).
          sleep();
      }
    }
  }
}

//21.maxstatements
/*jshint maxstatements:4 */
function maxstatementsFn() {
  var i = 0;
  var j = 0;

  // Function declarations count as one statement. Their bodies
  // don't get taken into account for the outer function.
  function inner() {
    var i2 = 1;
    var j2 = 1;

    return i2 + j2;
  }

  j = i + j;
  return j; // JSHint: Too many statements per function. (5)
}

//22.maxcomplexity
/*jshint maxcomplexity:true */

//23.maxlen
/*jshint maxlen:20 */
var maxlenStr = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

//Relaxing Options


