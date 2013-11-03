/*
 * Push-pull menu
 * drawer menu
 * 推拉式菜单，目前支持二级菜单
 * 该类依赖于jquery.hopefuture.platform.js和jquery.hopefuture.platform.Collection.js
 */
(function($, undefined) {

    /**
     * 
     * @param config 菜单配置项
     * config包括以下参数
     * container : 显示菜单的容器，必选项
     * asyn : 是同步加载数据还是异步加载
     * url ：异步时需要url链接
     * params ： url链接对应的参数
     * data: 显示菜单数据，同步时需要加载的数据
     * dataType : ajax加载数据格式
     * @returns {$.hopefuture.platform.P2Menu}
     */
    function p2Menu(config) {
        var container = config.container;
        if (!config || !config.container) {
            return;
        }
        $.extend(this, config);

        if (typeof container == 'string') {
            container = $('#' + container);
        } else {
            container = $(container);
        }
        if (container.length == 0) {
            return;
        }
        this.container = container;

        //async loading
        //data优先
        if (this.asyn !== true && this.data) {
            var collection = new $.hopefuture.platform.Collection();
            collection.addAll(this.data);
            this.data = collection;
            delete this.url;
        }
        this.dataType = this.dataType || 'xml';
        this.initTemplate();
        this.initElementCls();

    }
    ;

    jQuery.extend(p2Menu.prototype, {
        baseClass: 'h-menu-',
        /**
         * init Menu Template
         */
        initTemplate: function() {
            if (!this.menuItemTemplate) {
                var temp = '<div class="h-menu-panel" id="${id}">'
                        + '<h3 class="h-menu-header">'
                        + '	<span class="h-menu-icon"></span> <a href="#">${name}</a>'
                        + '</h3>'
                        + '<ul class="h-menu-ct">'
                        + ' {{each(i, child) children}}'
                        + '		<li id="${child.id}" {{if i%2 == 1}}class="odd"{{/if}}><a href="${child.href}">${child.name}</a></li>'
                        + ' {{/each}}'
                        + '</ul>'
                        + '</div>';
                this.menuItemTemplate = temp;
            }
            ;
            $.template('menuItemTemplate', this.menuItemTemplate);
        },
        /**
         * 初始化菜单相关元素
         */
        initElementCls: function() {
            // 分别对应于菜单项的顶部、箭头和二级菜单容器
            // 如果用户想自定义菜单也需要按照该规则实现
            if (!this.elements) {
                this.elements = {
                    menuHeader: 'h3.' + this.baseClass + 'header',
                    menuItemCt: '.' + this.baseClass + 'panel',
                    menuSubItemCt: 'ul.' + this.baseClass + 'ct',
                    menuSubItem: 'ul.' + this.baseClass + 'ct li'
                };
            }
        },
        /**
         * load the menu
         */
        loadMenu: function() {
            var me = this;
            if (this.asyn) {
                if (this.dataType == 'xml') {
                    $.ajax({
                        url: this.url,
                        type: 'GET',
                        async : false,
                        success: function(data, status, resp) {
                            var json = $.xml2json(data);
                            var collection = new $.hopefuture.platform.Collection();
                            var menus = json.menu;
                            if(!$.isArray(menus)){
                                menus = [json.menu];
                            }
                            //对于children是一个的话，由于解析成不是数组，这里需要处理一下
                            $(menus).each(function(index, element){
                                if(!$.isArray(element.children)){
                                    element.children = [element.children];
                                }
                            });
                            
                            collection.addAll(menus);
                            me.data = collection;
                            me.loadData(collection);
                        },
                        error: function(xml) {
                            console.info('Error loading XML document' + xml);
                        },
                        dataType: 'xml'
                    });
                } else if (this.dataType == 'json') {
                    $.ajax({
                        url: this.url,
                        async : false,
                        data: this.params || {},
                        dataType: 'json',
                        success: function(data, textStatus) {
                            var collection = new $.hopefuture.platform.Collection();
                            collection.addAll(data);
                            me.data = collection;
                            me.loadData(collection);
                        }
                    });
                }
            } else {
                if (!this.data || this.data.length == 0) {
                    return;
                }
                this.loadData(this.data);
            }
        },
        /**
         * load the data
         * @param data
         */
        loadData: function(data) {
            this.container.empty().append($.tmpl('menuItemTemplate', data.items)).append('<div class="h-menu-buttom-margin"></div>');
            this.initEvent();
            if(this.loadCurrentMenu === true){//是否加载第一个菜单项
            	var level1NodeId = data.itemAt(0).id,
                level2NodeId = data.itemAt(0).children[0].id,
                href = data.itemAt(0).children[0].href;
            	this.setCurrentMenu(level1NodeId, level2NodeId, href);
            }
        },
        /**
         * 初始化菜单各元素事件
         */
        initEvent: function() {
            var header = this.elements['menuHeader'],
                    menuItemCt = this.elements['menuItemCt'],
                    menuSubItemCt = this.elements['menuSubItemCt'],
                    menuSubItem = this.elements['menuSubItem'],
                    me = this;
            //一级菜单事件
            this.container.on('click', header, function(e) {
                e.preventDefault();
                var currentSubMenu = $(this).parent().find(menuSubItemCt);
                if (currentSubMenu.is(':visible')) {
                    currentSubMenu.hide();
                } else {
                    me.container.find(menuItemCt).removeClass('active');
                    me.container.find(menuSubItemCt).hide();

                    $(this).parent().addClass('active');
                    currentSubMenu.show();
                }
            });
            //二级菜单事件
            this.container.on('click', menuSubItem, function(e) {
                e.preventDefault();
                if (me.lastNodeLevel2) {
                    me.lastNodeLevel2.removeClass('active');
                }
                var el = $(this).addClass('active');
                me.lastNodeLevel2 = el;
                var aEl = el.find('a');
                var url = aEl.attr('href');
                var nodeName = aEl.text();
                me.ajaxLoading({
                    url: url,
                    nodeId: el.attr('id'),
                    nodeName: nodeName
                });
            });
        },
        /**
         * set current menu
         */
        setCurrentMenu: function(level1NodeId, level2NodeId) {
            var url;
            var nodeName;
        	var data = this.data;
        	var findItem = data.find(function(item, keys){
        		if(item.id == level1NodeId){
        			return true;
        		}
        	});
        	if(findItem){
            	var children = findItem.children;
            	for(var i = 0, len = children.length; i < len; i++){
            		if(children[i].id == level2NodeId){
            			url = children[i].href;
                        nodeName = children[i].name;
            			break;
            		}
            	}
        	}
        	
        	if(!url){
        		level1NodeId = data.itemAt(0).id,
                level2NodeId = data.itemAt(0).children[0].id,
                url = data.itemAt(0).children[0].href;
                nodeName = data.itemAt(0).children[0].name;
        	}
            
            if (level1NodeId) {
                $('#' + level1NodeId).addClass('active').find(this.elements['menuSubItemCt']).show();
            }

            if (level2NodeId) {
                var el = $('#' + level2NodeId).addClass('active');
                this.lastNodeLevel2 = el;
                this.ajaxLoading({
                    url: url,
                    nodeId: level2NodeId,
                    nodeName: nodeName
                });
            }
        },
        
        /**
         * load pages
         * @param options
         {
         href : href
         }
         **/
        ajaxLoading: function(options) {
            if(this.fn && $.isFunction(this.fn)){
            	this.fn.call(this.scope || this, options.url, options.nodeId, options.nodeName);
            }
        }

    });

    $.hopefuture.platform.P2Menu = p2Menu;

})(jQuery);

