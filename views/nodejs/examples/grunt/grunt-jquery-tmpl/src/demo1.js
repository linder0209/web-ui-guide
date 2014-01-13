/*
 * demo1
 * https://github.com/linder0209/web-ui-guide
 *
 * Copyright (c) 2013 linder0209
 * Licensed under the MIT license.
 */

(function($) {

  // Collection method.
  $.fn.demo1 = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.demo1 = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.demo1.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.demo1.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].demo1 = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
