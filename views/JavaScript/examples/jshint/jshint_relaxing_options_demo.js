/* global console */
//Relaxing Options

//1. asi
var a = ''
var b = ''

//2. boss
if (a = 10) {} 
for (var i = 0, person; person = people[i]; i++) {}
for (var i = 0, person; (person = people[i]); i++) {}

//3. debug
debugger;

//4. eqnull
var eqnullStr = '';
if(eqnullStr == null){
  console.info(1);
}

//5. evil
eval('var aa = "bb";');
setTimeout('function(){console.info(1);}',100);
var fn = new Function();

//5. funcscope
function test() {
  if (true) {
    var x = 0;
  }
  x += 1; 
}

//6.  __iterator__
function iteratorFn (){}
var iterator = new iteratorFn();
console.info(iterator.__iterator__);

//7. lastsemic
var name = (function() { return 'Anton' }());

//8. laxcomma
var obj = {
    name: 'Anton'
  , handle: 'valueof'
  , role: 'SW Engineer'
};

//9. loopfunc
var nums = [];
for (var i = 0; i < 10; i++) {
  nums[i] = function (j) {
    return i + j;
  };
}
nums[0](2); // Prints 12 instead of 2

var nums = [];
for (var i = 0; i < 10; i++) {
  (function (i) {
    nums[i] = function (j) {
        return i + j;
    };
  }(i));
}   

//10. notypeof
// 'fuction' instead of 'function'
var a = '';
if (typeof a == "fuction") { // Invalid typeof value 'fuction'
  /* ... */
}

//11. sub
var a = {
  b: '',
  'c-d': ''
};
console.info(a['b']);
console.info(a['c-d']);

//12. supernew
var singleton = new function() {
  var privateVar;

  this.publicMethod  = function () {}
  this.publicMethod2 = function () {}
};

