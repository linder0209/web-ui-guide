(function($, undefined) {
  //ie8（包括ie8）以下版本不支持数组方法 indexOf
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(item) {
      var me = this;
      if (me.length === 0) {
        return -1;
      }
      for (var i = 0, len = me.length; i < len; i++) {
        if (item === me[i]) {
          return i;
        }
      }
      return -1;
    };
  }
  var element = $.hopefuture.platform.Element;
  var pub = {
    context: 'views/',
    currentModules: '', //记录当前所有模块上下文
    currentScrollTop: 0, //记录当前页面scrollTop的值
    initWebUI: function(xmlUrl) {
      this.initElement();
      this.initEvent();
      this.initScroll();
      this.loadLeftMenu(xmlUrl);
    },
    /**
     * 初始化模板内容，主要是主页面显示区域<div id="webUiBody">中的内容
     * @returns {undefined}
     */
    initElement: function() {
      var webUiBodyTmpl = '<div class="h-body h-clearfix"> \n\
                    <div id="p2Menu" class="h-body-sidebar"> \n\
                        <!-- 动态加载菜单项 --> \n\
                    </div> \n\
                    <div class="h-body-container"> \n\
                        <div id="panel" class="h-body-panel"> \n\
                            <div class="h-body-content-ct" id="body_content_ct"> \n\
                                <div class="h-clearfix"> \n\
                                    单独访问该页面 <a id="page_link" href="" target="_blank"></a>\n\
                                    <button type="button" class="h-margin10-L h-web-btn h-web-btn-primary" id="create_catalogue">生成目录代码</button>\n\
                                    <span class="h-body-content-zoom h-float-r" id="body_content_zoom"></span> \n\
                                </div> \n\
                                <div class="h-line h-margin10-TB"></div> \n\
                                <div class="h-body-content-frame" id="body_content_frame"> </div> \n\
                            </div> \n\
                        </div> \n\
                    </div> \n\
                </div>';
      var webUiBody = $('#webUiBody');
      if (webUiBody.length > 0) {
        webUiBody.html(webUiBodyTmpl);
      } else {
        $(document.body).html(webUiBodyTmpl);
      }
    },
    initEvent: function() {
      //放大缩小事件
      $('#body_content_zoom').click(function() {
        var el = $(this),
                ct = $('#body_content_ct');
        if (el.hasClass('reduce')) {
          ct.css({
            position: 'static',
            backgroundColor: '',
            width: '',
            minHeight: '',
            paddingTop: 0
          });
        } else {
          ct.css({
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundColor: '#FFFFFF',
            width: element.getViewportWidth() - $.position.scrollbarWidth(),
            minHeight: element.getDocumentHeight(),
            paddingTop: 5,
            zIndex: 1
          });
        }
        el.toggleClass('reduce');
      });

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
        //$(document).scrollTop(0);
        //document.documentElement.scrollTop = 0;
      });

      //初始化目录列表事件
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
        //console.info(levelNum);

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
      $('#body_content_frame').on('click', '.h-web-catalogue>li>a', {level: 1}, onClickCatalogue)
              .on('click', '.h-web-catalogue2>li>a', {level: 2}, onClickCatalogue)
              .on('click', '.h-web-catalogue3>li>a', {level: 3}, onClickCatalogue);

      //初始化内容折叠事件
      $('#body_content_frame').on('click', 'h3[paragraph]', function(e) {
        $(this).next().toggle();
      });

      //初始化生成目录代码事件
      $('#create_catalogue').click(function() {
        var codeDialog = $('#codeDialog');
        if (codeDialog.length == 0) {
          codeDialog = $('<div id="codeDialog"><textarea style="width:970px;height:480px;"></textarea></div>').appendTo(document.body);
          codeDialog.dialog({
            autoOpen: false,
            title: '目录代码',
            width: 1000,
            height: 600,
            buttons: {
              Ok: {
                click: function() {
                  codeDialog.dialog('close');
                },
                text: '确定'
              }
            }
          });
        }
        var html = pub.createCatalogue();
        codeDialog.find('textarea').text(html);
        codeDialog.dialog('open');
      });
    },
    //实现当window滚动时，顶端的菜单栏位置不变，始终置于页面顶部
    initScroll: function() {
      var headerHeight = $('#header').outerHeight(true);
      var me = this;
      $(window).scroll(function(e) {
        var scrollTop = $(this).scrollTop();
        $('#upward')[me.currentScrollTop > scrollTop && scrollTop > 0 ? 'show' : 'hide']();
        if (scrollTop > headerHeight) {
          var match = /(msie) ([\w.]+)/.exec(window.navigator.userAgent.toLowerCase()) || [];
          if (match[1] == 'msie' && match[2] === '6.0') {
            $('#p2Menu').css('position', 'absolute');
            $('#p2Menu').animate({
              top: scrollTop - headerHeight
            }, {
              duration: 100,
              queue: false
            });
          } else {
            $('#p2Menu').css({
              position: 'fixed',
              top: '5px'
            });
          }
        } else {
          $('#p2Menu').css('position', 'static');
        }
        me.currentScrollTop = scrollTop;
        if (me.hideUpward) {
          clearTimeout(me.hideUpward);
        }
        me.hideUpward = setTimeout(function() {
          $('#upward').hide();
        }, 5000);
      });
    },
    //加载左侧菜单列表
    loadLeftMenu: function(xmlUrl) {
      var conf = {
        url: xmlUrl,
        asyn: true,
        container: 'p2Menu',
        scope: this,
        fn: this.linkMenuLoadContent
      };
      var pMenu = new $.hopefuture.platform.P2Menu(conf);
      pMenu.loadMenu();

      var level1NodeId, level2NodeId;
      if (window.location.hash && window.location.hash.indexOf('|') !== -1) {
        var modules = window.location.hash.split('|');
        level1NodeId = modules[0].substring(1);//去掉#号
        level2NodeId = modules[1];
      }
      //定位当前的菜单项
      pMenu.setCurrentMenu(level1NodeId, level2NodeId);

    },
    //点击左侧菜单项时回调函数
    linkMenuLoadContent: function(url, nodeId, nodeName) {
      //记录所有上下文模块
      var _modules = url.split('/');
      this.currentModules = _modules[0] + '|' + nodeId;
      url = this.context + url;
      this.loadExamples(url, nodeId, nodeName);
    },
    loadExamples: function(path, nodeId, nodeName) {
      //设置单独访问该页面链接
      $('#page_link').text(nodeName).attr('href', path);
      //Set the hash to the actual page without ".html"
      var part = path.replace(/\/[^\/]+\.html/, '').replace(this.context, '');
      var hash = part;
      if (nodeId) {
        hash += '|' + nodeId;
      }
      window.location.hash = hash;
      var root = window.location.href.replace(/\/index\.html.*/, '');
      var directory = path.replace(/\/[^\/]+\.html/, '');
      $.get(path, function(req, status, res) {
        var source = res.responseText;
        var repSource = source;
        //直接取body标签中的值
        repSource = repSource.match(/<(body)[^>]*>(.|\s)*<\/\1>/ig)[0];
        repSource = repSource.replace(/<\/?body.*>/ig, ""); //Remove body tag
        //替换a标签、img标签、link标签和script标签相对路径，该正则表达式的意思是：替换href或src中的值，并且该值开头不是http或#。该例子中用到了零宽断言
        /**
         * 之前的写法是这样的
         * repSource = repSource.replace(/((href|src)=["'])(?!(http|#|\/))/ig, '$1' + directory + '/');
         * 这种情况会替换以下内容，即开头是&lt;的情况，实际上这种转移后的html内容我们是不希望被替换的
         * &lt;link href="./stylesheet/bootstrap/bootstrap.min.css" rel="stylesheet" media="screen"&gt;
         */

        //例子，单一一种情况，只替换a标签
        //repSource = repSource.replace(/(<a.*?\s*href=["'])(?!(http|#|\/))/ig, '$1' + directory + '/');

        //这样写有问题：repSource = repSource.replace(/(<link|<img|<a|<script).*?\s*((href|src)=["'])(?!(http|#|\/))/ig, '$1' + ' ' + '$2' + directory + '/');
        //字符串"ccc<a id='linkId' href='index/8800387989517#/faq'>Frequently Asked Questions</a>" 替换后，a 和 href之间的内容也会被替换，而且这是贪婪匹配，如果有多个的话，只会匹配最后一个
        //以下是改进版
        //这里用到了懒惰匹配 *?
        repSource = repSource.replace(/((<link|<img|<a|<script).*?\s*((href|src)=["']))(?!(http|#|\/|view-source))/ig, '$1' + directory + '/');
        //替换绝对路径，加上root
        //repSource = repSource.replace(/((href|src)=["'])\//ig, '$1' + root + '/');
        //替换样式中图片背景
        repSource = repSource.replace(/(url\(\s*["']?\s*)(?!(http|#|data))/ig, '$1' + directory + '/');
        //repSource = repSource.replace(/\/\//g,'/');

        //代码高亮
        repSource = repSource.replace(/<pre>/ig, '<pre type="syntaxhighlighter" class="brush: js,css; html-script: true; quick-code: false; toolbar : false" >');
        $('#body_content_frame').empty().html(repSource);
        SyntaxHighlighter.defaults['toolbar'] = false;
        SyntaxHighlighter.highlight();

      }, 'html');
    },
    /**
     * 创建目录: 三级目录
     * 树结构
     * var node = {
     text: '',
     nodes: []
     };
     * @returns {}
     */
    createCatalogue: function() {
      var hs = [{
          method: 'find',
          params: [' + div h4']
        }, {
          method: 'nextUntil',
          params: ['h4', 'h5']
        }];
      var fn = function(el, index) {
        var nodes = [];
        for (var i = 0, len = el.length; i < len; i++) {
          var subEl = $(el[i]);
          var node = {
            text: subEl.html()
          };
          if (hs[index + 1] != undefined) {
            var method = hs[index + 1].method;
            var params = hs[index + 1].params;
            subEl = subEl[method](params[0], params[1]);
            if (subEl.length > 0) {
              node.nodes = fn(subEl, index + 1);
            }
          }
          nodes.push(node);
        }
        return nodes;
      };

      var catalogues = fn($('.h-web-paragraph  h3[paragraph]'), -1);
      //console.log(catalogues);

      var blank = ['  ', '    ', '      ', '        ', '          ', '            ', '              '];
      var fn2 = function(nodes, index, blankIndex) {
        var html = blank[blankIndex];
        html += '<ol class="h-web-catalogue' + (index == 0 ? '' : index + 1) + '">\n';
        for (var i = 0, len = nodes.length; i < len; i++) {
          var node = nodes[i];
          html += blank[blankIndex + 1] + '<li>\n';
          html += blank[blankIndex + 2] + '<a' + (index == 0 ? ' paragraph' : '') + ' href="#">' + node.text + '</a>\n';
          if (node.nodes && node.nodes.length > 0) {
            html += fn2(node.nodes, index + 1, blankIndex + 2);
          }
          html += blank[blankIndex + 1] + '</li>\n';
        }
        html += blank[blankIndex] + '</ol>\n';
        return html;
      };

      var cataloguesHtml = fn2(catalogues, 0, 0);
      //去掉最后一个换行符
      cataloguesHtml = cataloguesHtml.substring(0, cataloguesHtml.length - 1);
      //console.log(cataloguesHtml);
      return cataloguesHtml;
    }
  };

  $.hopefuture.platform.Layout = pub;

})(jQuery);
