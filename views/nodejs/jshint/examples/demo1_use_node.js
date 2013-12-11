/*jshint unused:true, eqnull:true */
/*jshint -W030, -W098 */
function main(a, b) {
  return a == null;
}

/* jshint -W034, -W097 */
"use strict";
/* ... */

// From another file
function demo() {
  "use strict";
  /* ... */
}

var y = Object.create(null);
// ... 首先忽略 W089警告
/*jshint -W089 */
for (var prop in y) {
    // ...
}
//再激活 W089警告
/*jshint +W089 */

switch (cond) {
case "one":
  doSomething(); // JSHint will warn about missing 'break' here.
  /* falls through */
case "two":
  doSomethingElse();
}