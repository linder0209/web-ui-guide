(function($, undefined) {
    //ie8（包括ie8）以下版本不支持数组方法 indexOf
    if(!Array.prototype.indexOf){
        Array.prototype.indexOf = function(item){
            var me = this;
            if(me.length === 0){
                return -1;
            }
            for (var i = 0, len = me.length; i < len; i++) {
                if(item === me[i]){
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
        currentScrollTop: 0,//记录当前页面scrollTop的值
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
                                    <span class="h-body-content-zoom h-float-r" id="body_content_zoom"></span> \n\
                                </div> \n\
                                <div class="h-line h-margin10-TB"></div> \n\
                                <div class="h-body-content-frame" id="body_content_frame"> </div> \n\
                            </div> \n\
                        </div> \n\
                    </div> \n\
                </div>';
            var webUiBody = $('#webUiBody');
            if(webUiBody.length > 0 ){
                webUiBody.html(webUiBodyTmpl);
            }else{
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
                        minHeight : element.getDocumentHeight(),
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
            if(upward.length == 0){
                upward = $('<div class="h-upward" id="upward" title="回到顶部"><i></i></div>').appendTo(document.body);
            }
            upward.click(function(e) {
                $(document).scrollTop(0);
                //document.documentElement.scrollTop = 0;
            });
            
            //初始化目录列表事件
            $('#body_content_frame').on('click', '.h-web-catalogue li a', function(e) {
                e.preventDefault();
                var paragraphNum,
                        paragraph,
                        offset;
                var el = this;
                $(this).closest('ol').find('li a').each(function(index, element) {
                    if (this === el) {
                        paragraphNum = index;
                        return false;
                    }
                });
                paragraph = $('.h-web-paragraph h3[paragraph]').eq(paragraphNum);
                offset = paragraph.offset();
                if (offset) {
                    $(window).scrollTop(offset.top);
                }
            });
            //初始化内容折叠事件
            $('#body_content_frame').on('click' , 'h3[paragraph]', function(e){
                $(this).next().toggle();
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
                if(me.hideUpward){
                    clearTimeout(me.hideUpward);
                }
                me.hideUpward = setTimeout(function(){
                    $('#upward').hide();
                },5000);
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
        linkMenuLoadContent: function(url,nodeId) {
            //记录所有上下文模块
            var _modules = url.split('/');
            this.currentModules = _modules[0] + '|' + nodeId;
            url = this.context + url;
            this.loadExamples(url,nodeId);
        },
                
        loadExamples: function(path, nodeId) {
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
                //替换a标签和img标签相对路径，该正则表达式的意思是：替换href或src中的值，并且该值开头不是http或#。该例子中用到了零宽断言
                repSource = repSource.replace(/((href|src)=["'])(?!(http|#|\/))/ig, '$1' + directory + '/');
				//替换绝对路径，加上root
				repSource = repSource.replace(/((href|src)=["'])\//ig, '$1' + root + '/');
                //替换样式中图片背景
                repSource = repSource.replace(/(url\(\s*["']?\s*)(?!(http|#|data))/ig, '$1' + directory + '/');
                //repSource = repSource.replace(/\/\//g,'/');
                
                //代码高亮
                repSource = repSource.replace(/<pre>/ig,'<pre type="syntaxhighlighter" class="brush: js; html-script: true; quick-code: false; toolbar : false" >');
                $('#body_content_frame').empty().html(repSource);
                SyntaxHighlighter.highlight();
                
            }, 'html');
        }
    };

    $.hopefuture.platform.Layout = pub;

})(jQuery);