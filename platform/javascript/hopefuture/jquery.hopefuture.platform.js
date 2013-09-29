/**
 * tools 工具类
 * 
 * @author : linder
 * @date : 2012-12-12
 */
(function($, undefined) {

    // init package
    $.hopefuture = $.hopefuture || {};
    $.hopefuture.platform = $.hopefuture.platform || {};

    var re = /\{([\w-]+)\}/g;

    $.hopefuture.platform.util = {
        // deal with template
        // 该方法支持键值即json格式的数据
        applyTemplate: function(template, values) {
            return template.replace(re, function(m, name) {
                return values[name] !== undefined ? values[name] : '';
            });
        }
        
         //替换{0}的情况，回头糅合到一块
//         var re = /\{(\d+)\}/g;
//        applyTemplate: function(template, values) {
//            return template.replace(re, function(match, key, index, source) {
//                return values[key] !== undefined ? values[key] : '';
//            });
//        }

    };

    /**
     * 用来处理DOM元素工具类
     * 详细查看我的类库中相关方法 jquery.util.element.js
     */
    $.hopefuture.platform.Element = (function() {
        var doc = document;
        var element = {
            /**
             * 返回页面可视化宽度
             * 该方法不同于ExtJs中的实现，与之有区别
             * $.support.boxModel 返回 true表明浏览器是严格模式即：document.compatMode 为 'CSS1Compat'
             * return the page viewport width
             * @returns {}
             */
            getViewportWidth: function() {
                return self.innerWidth ? self.innerWidth :
                        ($.support.boxModel ? doc.documentElement.clientWidth : doc.body.clientWidth);
            },
            /**
             * 返回页面可视化高度
             * return the page viewport height
             * @returns {}
             */
            getViewportHeight: function() {
                return self.innerHeight ? self.innerHeight :
                        ($.support.boxModel ? doc.documentElement.clientHeight : doc.body.clientHeight);
            },
            /**
             * 得到页面的实际高度
             */
            getDocumentHeight: function() {
                return Math.max(!$.support.boxModel ? doc.body.scrollHeight : doc.documentElement.scrollHeight, this.getViewportHeight());
            },
            /**
             * 得到页面的实际宽度
             */
            getDocumentWidth: function() {
                return Math.max(!$.support.boxModel ? doc.body.scrollWidth : doc.documentElement.scrollWidth, this.getViewportWidth());
            }
        };
        return element;
    })();


})(jQuery);
