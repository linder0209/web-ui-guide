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


