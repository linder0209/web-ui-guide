(function($, undefined) {
  //重构方法errorsFor和elements
  $.extend($.validator.prototype, {errorsFor: function(element) {
      var validatorgen = $(element).attr('validatorgen');
      return this.errors().filter(function() {
        return $(this).attr('for') == validatorgen;
      });
    },
    //相同名字的也会校验
    elements: function() {
      var validator = this;

      // select all valid inputs inside the form (no submit or reset buttons)
      return $(this.currentForm)
              .find("input, select, textarea")
              .not(":submit, :reset, :image, [disabled]")
              .not(this.settings.ignore)
              .filter(function() {
        if (!this.name && validator.settings.debug && window.console) {
          console.error("%o has no name assigned", this);
        }

        // select only the first element for each name, and only those with rules specified
        if (!validator.objectLength($(this).rules())) {
          return false;
        }
        return true;
      });
    }});

  //对于上传附件输入框，需额外加入chang事件
  $(document.body).on('change', 'form [type="file"]', function(e) {
    $(e.currentTarget).valid();
  });
  //扩展方法
  $.fn.hideErrors = function() {
    this.each(function() {
      if ($(this).is('form')) {
        $(this).validate().resetForm();
        $(this).find(':input:not(:button,:reset,:submit)').each(function() {
          var originalWidth = $(this).attr('originalWidth');
          if (originalWidth !== undefined) {
            $(this).width(originalWidth);
          }
        });
      } else {
        var validator = $(this.form).validate();
        var settings = validator.settings;
        settings.unhighlight(this, settings.errorClass, settings.validClass);
        validator.errorsFor(this).hide();
        var originalWidth = $(this).attr('originalWidth');
        if (originalWidth !== undefined) {
          $(this).width(originalWidth);
        }
      }
    });
    return this;
  };

  $.validator.setDefaults({
    onfocusout: function(e) {
      /**
       * 这里用到了延迟校验，主要解决以下操作产生的问题
       * A:操作
       * 1.当鼠标停留在一个文本域上
       * 2.此时点击提交按钮
       * B：可能会产生的问题
       * 1.条件:生成的错误信息改变页面的大小，使鼠标没有停留在提交按钮上，只有这种情况才会产生这个问题，如果生成的错误信息没有改变页面的大小，不会产生这个问题。
       * 2.分析原因，可能是当鼠标点击按钮时，由于在很短的时间内，鼠标离开了提交按钮，点击事件将不会发生，引起这个问题应该跟框架有关，由于事件执行是按队列处理的，当执行focusout后，鼠标离开了提交按钮，就不会再执行click事件。
      **/
      setTimeout(function(){
        $(e).valid();
      },100);
    },
    ignore: ':hidden, :button',
    validatorGen: 0,
    showErrors: function(errorMap, errorList) {
      for (var i = 0; this.errorList[i]; i++) {
        var error = this.errorList[i];
        this.settings.highlight
                && this.settings.highlight.call(this, error.element,
                this.settings.errorClass, this.settings.validClass);
        showLabel.call(this, error.element, error.message);
      }
      if (this.errorList.length) {
        this.toShow = this.toShow.add(this.containers);
      }
      if (this.settings.success) {
        for (var i = 0; this.successList[i]; i++) {
          showLabel.call(this, this.successList[i]);
        }
      }
      if (this.settings.unhighlight) {
        for (var i = 0, elements = this.validElements(); elements[i]; i++) {
          this.settings.unhighlight.call(this, elements[i],
                  this.settings.errorClass, this.settings.validClass);
          var originalWidth = $(elements[i]).attr('originalWidth');
          if (originalWidth !== undefined) {
            $(elements[i]).width(originalWidth);
          }
        }
      }
      this.toHide = this.toHide.not(this.toShow);
      this.hideErrors();
      this.addWrapper(this.toShow).show();
    }
  });

  /**
   * reconstruction the method of "showing label"
   * Linder Wang
   **/
  function showLabel(element, message) {
    var me = this,
            label = this.errorsFor(element),
            element$ = $(element);
    if (label.length) {
      // refresh error/success class
      label.removeClass(this.settings.validClass)
              .addClass(this.settings.errorClass);
    } else {
      var gen = (this.currentForm.id || this.currentForm.name) + '-' + this.idOrName(element) + '-' + (this.settings.validatorGen++);
      element$.attr('validatorgen', gen);
      // create label
      label = $("<" + this.settings.errorElement + "/>").attr({
        "for": gen
      }).addClass(this.settings.errorClass).hide();

      if (this.settings.wrapper) {
        // make sure the element is visible, even in IE
        // actually showing the wrapped element is handled elsewhere
        label = label.hide().show().wrap("<" + this.settings.wrapper
                + "/>").parent();
      }
      if (!this.labelContainer.append(label).length)
        this.settings.errorPlacement ? this.settings.errorPlacement(
                label, element$) : label.insertAfter(element);

      //init error tool tip 
      if (!this.errorToolTip) {
        if ($('div.error-tooltip').length > 0) {
          this.errorToolTip = $('div.error-tooltip');
        } else {
          this.errorToolTip = $('<div class="error-tooltip"><span></span></div>').appendTo('body');
        }
      }
      var tip = this.errorToolTip;

      // add listener event
      label.hover(function(e) {
        //validation info
        var rules = element$.rules(),
                rule,
                message,
                method;
        for (method in rules) {
          rule = {method: method, parameters: rules[method]};
          try {
            var result = $.validator.methods[method].call(me, element.value.replace(/\r/g, ""), element, rule.parameters);
            if (result == "dependency-mismatch") {
              continue;
            }

            if (!result) {
              message = me.defaultMessage(element, rule.method);
              var theregex = /\$?\{(\d+)\}/g;
              if (typeof message == "function") {
                message = message.call(me, rule.parameters, element);
              } else if (theregex.test(message)) {
                message = $.format(message.replace(theregex, '{$1}'), rule.parameters);
              }
              break;
            }
          } catch (e) {
            throw e;
          }
        }
        if (message) {
          tip.children('span').html(message || '');
          tip.css({top: 0, left: 0}).show();
          tip.position({
            my: 'left+10 center',
            at: 'right+10 center',
            of: e.target
          });
          var inputLeft = element$.offset().left,
                  tipLeft = tip.offset().left;
          if (inputLeft < tipLeft) {
            tip.removeClass('left').addClass('right');
          } else {
            tip.removeClass('right').addClass('left');
          }
        }

      }, function() {
        tip.hide();
      });
    }
    // adjust inputs and label's width to adapt to the layout
    var inputCt = element$.parent(),
            inputCtW = inputCt.width(),
            inputW = element$.outerWidth(true),
            inputMarginW = inputW - element$.width(),
            labelW = label.outerWidth(true);

    if (inputCtW - inputW < labelW) {
      if (element$.attr('originalWidth') === undefined) {
        element$.attr('originalWidth', element.style.width);//原始的设置，可能style.width没有设置
      }
      element$.width(inputCtW - labelW - inputMarginW);
    }

    if (!message && this.settings.success) {
      typeof this.settings.success == "string" ? label
              .addClass(this.settings.success) : this.settings
              .success(label);
    }

    this.toShow = this.toShow.add(label);
  }

})(jQuery);