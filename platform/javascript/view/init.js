//单独访问页面时，需要加载的脚本
$(function() {
  /**
   * 返回到最上面处理代码
   * 此处应换成合适的图标，待换
   */
  var upward = $('#upward');
  if (upward.length == 0) {
    upward = $('<div class="h-upward" id="upward" title="回到顶部"><i></i></div>').appendTo(document.body);
  }
  upward.click(function(e) {
    //jQuery平滑回到顶端效果
    $('html, body').animate({
      scrollTop: 0
    }, {
      duration: 200,
      easing: 'swing'
    });
  });

  //动态显示回到顶部按钮
  var currentScrollTop = 0;
  var hideUpward;
  $(window).scroll(function(e) {
    var scrollTop = $(this).scrollTop();
    $('#upward')[currentScrollTop > scrollTop && scrollTop > 0 ? 'show' : 'hide']();
    currentScrollTop = scrollTop;
    if (hideUpward) {
      clearTimeout(hideUpward);
    }
    hideUpward = setTimeout(function() {
      $('#upward').hide();
    }, 5000);
  });

  /**
   * 初始化目录列表事件
   * 内容格式为
   * <div class="h-web-paragraph">
   <h3 paragraph>一级目录</h3>
   <div>
   <h4>二级目录</h4>
   ... 内容
   <h5>三级目录</h5> 
   ... 内容
   </div>
   </div>
   */
  var onClickCatalogue = function(e) {
    e.preventDefault();
    var level = e.data.level;
    var levelNum = '';
    var el = e.target;
    var parentEl = $(el).closest('ol');
    for (var i = level; i > 0; i--) {
      parentEl.find('>li>a').each(function(index, element) {
        if (this === el) {
          levelNum = '.' + index + levelNum;
          return false;
        }
      });
      el = parentEl.prev('a')[0];
      parentEl = parentEl.parent().closest('ol');
    }

    //example: $('.h-web-paragraph h3[paragraph]:eq(3) + div h4:eq(0) ~ h5:eq(1)');
    var selector = '.h-web-paragraph';
    levelNum = levelNum.substring(1);
    var levelNums = levelNum.split('.');
    var hs = [' h3[paragraph]', ' + div h4', ' ~ h5'];
    for (var i = 0, len = levelNums.length; i < len; i++) {
      selector += hs[i] + ':eq(' + levelNums[i] + ')';
    }

    //console.info(selector);
    var paragraph = $(selector);
    var offset = paragraph.offset();
    if (offset) {
      $(window).scrollTop(offset.top);
    }
  };

  //支持 三级 目录
  $('.h-web-catalogue>li>a').click({level: 1}, onClickCatalogue);
  $('.h-web-catalogue2>li>a').click({level: 2}, onClickCatalogue);
  $('.h-web-catalogue3>li>a').click({level: 3}, onClickCatalogue);

  //初始化内容折叠事件
  $('h3[paragraph]').click(function(e) {
    $(this).next().toggle();
  });

  //SyntaxHighlighter
  $('pre').replaceWith(function() {
    var html = '<pre type="syntaxhighlighter" class="brush: js; html-script: true; quick-code: false; toolbar : false" >';
    html += $(this).html();
    html += '</pre>';
    return html;
  });
  SyntaxHighlighter.highlight();
});