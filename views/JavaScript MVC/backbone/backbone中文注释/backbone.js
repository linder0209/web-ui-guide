// Backbone.js 0.9.2

// (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org
(function() {

    // ����һ��ȫ�ֶ���, ��������б�ʾΪwindow����, ��Node.js�б�ʾglobal����
    var root = this;

    // ����"Backbone"����������֮ǰ��ֵ
    // �������������ͻ���ǵ��淶, ��ͨ��Backbone.noConflict()�����ָ��ñ�����Backboneռ��֮ǰ��ֵ, ������Backbone�����Ա���������
    var previousBackbone = root.Backbone;

    // ��Array.prototype�е�slice��splice�������浽�ֲ������Թ�����
    var slice = Array.prototype.slice;
    var splice = Array.prototype.splice;

    var Backbone;
    if( typeof exports !== 'undefined') {
        Backbone = exports;
    } else {
        Backbone = root.Backbone = {};
    }

    // ����Backbone�汾
    Backbone.VERSION = '0.9.2';

    // �ڷ������������Զ�����Underscore, ��Backbone�в��ַ���������̳���Underscore
    var _ = root._;
    if(!_ && ( typeof require !== 'undefined'))
        _ = require('underscore');

    // �����������Ϊͳһ�ı���"$", ��������ͼ(View), �¼�����������������ͬ��(sync)ʱ���ÿ��еķ���
    // ֧�ֵĿ����jQuery, Zepto��, �����﷨��ͬ, ��Zepto�������ƶ�����, ����Ҫ���Webkit�ں������
    // Ҳ����ͨ���Զ���һ����jQuery�﷨���Ƶ��Զ����, ��Backboneʹ��(��ʱ���ǿ�����Ҫһ����jQuery, Zepto�����ɵ��Զ���汾)
    // ���ﶨ���"$"�Ǿֲ�����, ��˲���Ӱ����Backbone���֮��������������ʹ��
    var $ = root.jQuery || root.Zepto || root.ender;

    // �ֶ����õ�������
    // ����ڵ�����Backbone֮ǰ��û�е����������, ����ͨ��setDomLibrary��������"$"�ֲ�����
    // setDomLibrary����Ҳ��������Backbone�ж�̬�����Զ����
    Backbone.setDomLibrary = function(lib) {
        $ = lib;
    };
    // ������"Backbone"�������, ������Backbone����, һ�����ڱ���������ͻ��淶������ʽ
    // ����:
    // var bk = Backbone.noConflict(); // ȡ��"Backbone"����, ����Backbone��������bk������
    // console.log(Backbone); // �ñ����Ѿ��޷��ٷ���Backbone����, ���ָ�ΪBackbone����ǰ��ֵ
    // var MyBackbone = bk; // ��bk�洢��Backbone����, ���ǽ���������ΪMyBackbone
    Backbone.noConflict = function() {
        root.Backbone = previousBackbone;
        return this;
    };
    // ���ڲ�֧��REST��ʽ�������, ��������Backbone.emulateHTTP = true
    // �������������POST��ʽ����, ���������м���_method������ʶ��������, ͬʱҲ������X-HTTP-Method-Overrideͷ��Ϣ
    Backbone.emulateHTTP = false;

    // ���ڲ�֧��application/json����������, ��������Backbone.emulateJSON = true;
    // ��������������Ϊapplication/x-www-form-urlencoded, �������ݷ�����model������ʵ�ּ���
    Backbone.emulateJSON = false;

    // Backbone.Events �Զ����¼����
    // -----------------

    // eventSplitterָ���������¼�ʱ, �¼����ƵĽ�������
    var eventSplitter = /\s+/;

    // �Զ����¼�������
    // ͨ���ڶ����а�Events��ط���, ������������, ɾ���ʹ����Զ����¼�
    var Events = Backbone.Events = {

        // ���Զ����¼�(events)�ͻص�����(callback)�󶨵���ǰ����
        // �ص������е������Ķ���Ϊָ����context, ���û������context�������Ķ���Ĭ��Ϊ��ǰ���¼��Ķ���
        // �÷���������DOM Level2�е�addEventListener����
        // events����ָ������¼�����, ͨ���հ��ַ����зָ�(��ո�, �Ʊ����)
        // ���¼�����Ϊ"all"ʱ, �ڵ���trigger���������κ��¼�ʱ, �������"all"�¼��а󶨵����лص�����
        on : function(events, callback, context) {
            // ����һЩ������ʹ�õ��ľֲ�����
            var calls, event, node, tail, list;
            // ��������callback�ص�����
            if(!callback)
                return this;
            // ͨ��eventSplitter���¼����ƽ��н���, ʹ��split������¼������Ϊһ������
            // һ��ʹ�ÿհ��ַ�ָ������¼�����
            events = events.split(eventSplitter);
            // calls��¼�˵�ǰ�������Ѱ󶨵��¼���ص������б�
            calls = this._callbacks || (this._callbacks = {});

            // ѭ���¼����б�, ��ͷ��β���ν��¼��������event����
            while( event = events.shift()) {
                // ��ȡ�Ѿ���event�¼��Ļص�����
                // list�洢�����¼����а󶨵�callback�ص������б�
                // �����б�û��ͨ�����鷽ʽ�洢, ����ͨ����������next���Խ������ι���
                /** ���ݸ�ʽ��:
                 * {
                 *     tail: {Object},
                 *     next: {
                 *         callback: {Function},
                 *         context: {Object},
                 *         next: {
                 *             callback: {Function},
                 *             context: {Object},
                 *             next: {Object}
                 *         }
                 *     }
                 * }
                 */
                // �б�ÿһ��next����洢��һ�λص��¼������Ϣ(������, �����ĺ���һ�λص��¼�)
                // �¼��б����洢��һ��tail����, ���洢�����һ�ΰ󶨻ص��¼��ı�ʶ(�����һ�λص��¼���nextָ��ͬһ������)
                // ͨ��tail��ʶ, �����ڱ����ص��б�ʱ��֪�Ѿ��������һ���ص�����
                list = calls[event];
                // node�������ڼ�¼���λص������������Ϣ
                // tailֻ�洢���һ�ΰ󶨻ص������ı�ʶ
                // ������֮ǰ�Ѿ��󶨹��ص�����, ��֮ǰ��tailָ����node��Ϊһ������ʹ��, Ȼ�󴴽�һ���µĶ����ʶ��tail
                // ����֮����Ҫ�����λص��¼���ӵ���һ�λص���tail����, ��Ϊ���ûص������б�Ķ����ι�ϵ���հ�˳������(���°󶨵��¼������ŵ���ײ�)
                node = list ? list.tail : {};
                node.next = tail = {};
                // ��¼���λص��ĺ����弰��������Ϣ
                node.context = context;
                node.callback = callback;
                // ������װ��ǰ�¼��Ļص��б�, �б����Ѿ������˱��λص��¼�
                calls[event] = {
                    tail : tail,
                    next : list ? list.next : node
                };
            }
            // ���ص�ǰ����, ������з���������
            return this;
        },
        // �Ƴ��������Ѱ󶨵��¼���ص�����, ����ͨ��events, callback��context����Ҫɾ�����¼���ص��������й���
        // - ���contextΪ��, ���Ƴ����е�callbackָ���ĺ���
        // - ���callbackΪ��, ���Ƴ��¼������еĻص�����
        // - ���eventsΪ��, ��ָ����callback��context, ���Ƴ�callback��contextָ���Ļص�����(�������¼�����)
        // - ���û�д����κβ���, ���Ƴ������а󶨵������¼��ͻص�����
        off : function(events, callback, context) {
            var event, calls, node, tail, cb, ctx;

            // No events, or removing *all* events.
            // ��ǰ����û�а��κ��¼�
            if(!( calls = this._callbacks))
                return;
            // ���û��ָ���κβ���, ���Ƴ������¼��ͻص�����(ɾ��_callbacks����)
            if(!(events || callback || context)) {
                delete this._callbacks;
                return this;
            }

            // ������Ҫ�Ƴ����¼��б�
            // - ���ָ����events, ����eventSplitter���¼������н���
            // - ���û��ָ��events, ������Ѱ������¼��������б�
            events = events ? events.split(eventSplitter) : _.keys(calls);

            // ѭ���¼����б�
            while( event = events.shift()) {
                // ����ǰ�¼�������б����Ƴ�, �����浽node������
                node = calls[event];
                delete calls[event];
                // ��������ڵ�ǰ�¼�����(��û��ָ���Ƴ���������, ����Ϊ���Ƴ���ǰ�¼������лص�����), ����ֹ�˴β���(�¼���������һ���Ѿ��Ƴ�)
                if(!node || !(callback || context))
                    continue;
                // Create a new list, omitting the indicated callbacks.
                // ���ݻص������������Ĺ�������, ��װһ���µ��¼��������°�
                tail = node.tail;
                // �����¼��е����лص�����
                while(( node = node.next) !== tail) {
                    cb = node.callback;
                    ctx = node.context;
                    // ���ݲ����еĻص�������������, �Իص��������й���, �������Ϲ��������Ļص��������°󶨵��¼���(��Ϊ�¼��е����лص������������Ѿ����Ƴ�)
                    if((callback && cb !== callback) || (context && ctx !== context)) {
                        this.on(event, cb, ctx);
                    }
                }
            }

            return this;
        },
        // �����Ѿ������һ�������¼�, ����ִ�а󶨵Ļص������б�
        trigger : function(events) {
            var event, node, calls, tail, args, all, rest;
            // ��ǰ����û�а��κ��¼�
            if(!( calls = this._callbacks))
                return this;
            // ��ȡ�ص������б��а󶨵�"all"�¼��б�
            all = calls.all;
            // ����Ҫ�������¼�����, ����eventSplitter�������Ϊһ������
            events = events.split(eventSplitter);
            // ��trigger�ӵ�2��֮��Ĳ���, ��¼��rest����, �����δ��ݸ��ص�����
            rest = slice.call(arguments, 1);

            // ѭ����Ҫ�������¼��б�
            while( event = events.shift()) {
                // �˴���node������¼�˵�ǰ�¼������лص������б�
                if( node = calls[event]) {
                    // tail������¼���һ�ΰ��¼��Ķ����ʶ
                    tail = node.tail;
                    // node������ֵ, �����¼��İ�˳��, �����θ�ֵΪ�󶨵ĵ����ص��¼�����
                    // ���һ�ΰ󶨵��¼�next����, ��tail����ͬһ������, �Դ���Ϊ�Ƿ񵽴��б�ĩβ���ж�����
                    while(( node = node.next) !== tail) {
                        // ִ�����а󶨵��¼�, ��������triggerʱ�Ĳ������ݸ��ص�����
                        node.callback.apply(node.context || this, rest);
                    }
                }
                // ����all��¼�˰�ʱ��"all"�¼�, ���ڵ����κ��¼�ʱ, "all"�¼��еĻص��������ᱻִ��
                // - "all"�¼��еĻص��������۰�˳�����, �����ڵ�ǰ�¼��Ļص������б�ȫ��ִ����Ϻ�������ִ��
                // - "all"�¼�Ӧ���ڴ�����ͨ�¼�ʱ���Զ�����, ���ǿ�ƴ���"all"�¼�, �¼��еĻص���������ִ������
                if( node = all) {
                    tail = node.tail;
                    // �������ͨ�¼��Ļص�������֮ͬ������, all�¼��Ὣ��ǰ���õ��¼�����Ϊ��һ���������ݸ��ص�����
                    args = [event].concat(rest);
                    // ������ִ��"all"�¼��еĻص������б�
                    while(( node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
            }

            return this;
        }
    };

    // ���¼����ͷ��¼��ı���, ҲΪ��ͬʱ����Backbone��ǰ�İ汾
    Events.bind = Events.on;
    Events.unbind = Events.off;

    // Backbone.Model ���ݶ���ģ��
    // --------------

    // Model��Backbone���������ݶ���ģ�͵Ļ���, ���ڴ���һ������ģ��
    // @param {Object} attributes ָ������ģ��ʱ�ĳ�ʼ������
    // @param {Object} options
    /**
     * @format options
     * {
     *     parse: {Boolean},
     *     collection: {Collection}
     * }
     */
    var Model = Backbone.Model = function(attributes, options) {
        // defaults�������ڴ洢ģ�͵�Ĭ������
        var defaults;
        // ���û��ָ��attributes����, ������attributesΪ�ն���
        attributes || ( attributes = {});
        // ����attributesĬ�����ݵĽ�������, ����Ĭ�������Ǵӷ�������ȡ(��ԭʼ������XML��ʽ), Ϊ�˼���set������������ݸ�ʽ, ��ʹ��parse�������н���
        if(options && options.parse)
            attributes = this.parse(attributes);
        if( defaults = getValue(this, 'defaults')) {
            // ���Model�ڶ���ʱ������defaultsĬ������, ���ʼ������ʹ��defaults��attributes�����ϲ��������(attributes�е����ݻḲ��defaults�е�ͬ������)
            attributes = _.extend({}, defaults, attributes);
        }
        // ��ʽָ��ģ��������Collection����(�ڵ���Collection��add, push�Ƚ�ģ����ӵ������еķ���ʱ, ���Զ�����ģ��������Collection����)
        if(options && options.collection)
            this.collection = options.collection;
        // attributes���Դ洢�˵�ǰģ�͵�JSON��������, ����ģ��ʱĬ��Ϊ��
        this.attributes = {};
        // ����_escapedAttributes�������, ��������ͨ��escape���������������
        this._escapedAttributes = {};
        // Ϊÿһ��ģ������һ��Ψһ��ʶ
        this.cid = _.uniqueId('c');
        // ����һϵ�����ڼ�¼����״̬�Ķ���, ���庬����ο�������ʱ��ע��
        this.changed = {};
        this._silent = {};
        this._pending = {};
        // ����ʵ��ʱ���ó�ʼ������, �״�����ʹ��silent����, ���ᴥ��change�¼�
        this.set(attributes, {
            silent : true
        });
        // �����Ѿ������˳�ʼ������, changed, _silent, _pending�����״̬�����Ѿ������仯, �������½��г�ʼ��
        this.changed = {};
        this._silent = {};
        this._pending = {};
        // _previousAttributes�����洢ģ�����ݵ�һ������
        // ������change�¼��л�ȡģ�����ݱ��ı�֮ǰ��״̬, ��ͨ��previous��previousAttributes������ȡ��һ��״̬������
        this._previousAttributes = _.clone(this.attributes);
        // ����initialize��ʼ������
        this.initialize.apply(this, arguments);
    };
    // ʹ��extend����ΪModelԭ�Ͷ���һϵ�����Ժͷ���
    _.extend(Model.prototype, Events, {

        // changed���Լ�¼��ÿ�ε���set����ʱ, ���ı����ݵ�key����
        changed : null,

        // // ��ָ��silent����ʱ, ���ᴥ��change�¼�, ���ı�����ݻ��¼����, ֱ����һ�δ���change�¼�
        // _silent����������¼ʹ��silentʱ�ı��ı������
        _silent : null,

        _pending : null,

        // ÿ��ģ�͵�Ψһ��ʶ����(Ĭ��Ϊ"id", ͨ���޸�idAttribute���Զ���id������)
        // �������������ʱ������id����, ��id���Ḳ��ģ�͵�id
        // id������Collection�����в��Һͱ�ʶģ��, ���̨�ӿ�ͨ��ʱҲ����id��Ϊһ����¼�ı�ʶ
        idAttribute : 'id',

        // ģ�ͳ�ʼ������, ��ģ�ͱ�����������Զ�����
        initialize : function() {
        },
        // ���ص�ǰģ�������ݵ�һ������(JSON�����ʽ)
        toJSON : function(options) {
            return _.clone(this.attributes);
        },
        // ����attr������, ��ȡģ���е�����ֵ
        get : function(attr) {
            return this.attributes[attr];
        },
        // ����attr������, ��ȡģ���е�����ֵ, ����ֵ������HTML�����ַ�����ת��ΪHTMLʵ��, ���� & < > " ' \
        // ͨ�� _.escape����ʵ��
        escape : function(attr) {
            var html;
            // ��_escapedAttributes��������в�������, ��������Ѿ���������ֱ�ӷ���
            if( html = this._escapedAttributes[attr])
                return html;
            // _escapedAttributes���������û���ҵ�����
            // ���ȴ�ģ���л�ȡ����
            var val = this.get(attr);
            // �������е�HTMLʹ�� _.escape����ת��Ϊʵ��, �����浽_escapedAttributes����, �����´�ֱ�ӻ�ȡ
            return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
        },
        // ���ģ�����Ƿ����ĳ������, �������Ե�ֵ��ת��ΪBoolean���ͺ�ֵΪfalse, ����Ϊ������
        // ���ֵΪfalse, null, undefined, 0, NaN, ����ַ���ʱ, ���ᱻת��Ϊfalse
        has : function(attr) {
            return this.get(attr) != null;
        },
        // ����ģ���е�����, ���keyֵ������, ����Ϊ�µ�������ӵ�ģ��, ���keyֵ�Ѿ�����, ���޸�Ϊ�µ�ֵ
        set : function(key, value, options) {
            // attrs�����м�¼��Ҫ���õ����ݶ���
            var attrs, attr, val;

            // ������ʽ����key-value������ʽ, ��ͨ��key, value�����������е�������
            // ���key��һ������, ���϶�Ϊʹ�ö�����ʽ����, �ڶ�������������Ϊoptions����
            if(_.isObject(key) || key == null) {
                attrs = key;
                options = value;
            } else {
                // ͨ��key, value����������������, �����ݷŵ�attrs�����з���ͳһ����
                attrs = {};
                attrs[key] = value;
            }

            // options�����������һ������, ���û������options��Ĭ��ֵΪһ���ն���
            options || ( options = {});
            // û�����ò���ʱ��ִ���κζ���
            if(!attrs)
                return this;
            // ��������õ����ݶ�������Model���һ��ʵ��, ��Model�����attributes���ݶ��󸳸�attrs
            // һ���ڸ���һ��Model��������ݵ���һ��Model����ʱ, ��ִ�иö���
            if( attrs instanceof Model)
                attrs = attrs.attributes;
            // ���options���ö�����������unset����, ��attrs���ݶ����е�������������Ϊundefined
            // һ���ڸ���һ��Model��������ݵ���һ��Model����ʱ, ��������Ҫ����Model�е����ݶ�����Ҫ����ֵʱִ�иò���
            if(options.unset)
                for(attr in attrs)
                attrs[attr] =
                void 0;

            // �Ե�ǰ���ݽ�����֤, �����֤δͨ����ִֹͣ��
            if(!this._validate(attrs, options))
                return false;

            // ������õ�id�����������������ݼ�����, ��id���ǵ�ģ�͵�id����
            // ����Ϊ��ȷ�����Զ���id��������, ����ģ�͵�id����ʱ, Ҳ����ȷ���ʵ�id
            if(this.idAttribute in attrs)
                this.id = attrs[this.idAttribute];

            var changes = options.changes = {};
            // now��¼��ǰģ���е����ݶ���
            var now = this.attributes;
            // escaped��¼��ǰģ����ͨ��escape�����������
            var escaped = this._escapedAttributes;
            // prev��¼ģ�������ݱ��ı�֮ǰ��ֵ
            var prev = this._previousAttributes || {};

            // ������Ҫ���õ����ݶ���
            for(attr in attrs) {
                // attr�洢��ǰ��������, val�洢��ǰ���Ե�ֵ
                val = attrs[attr];

                // �����ǰ������ģ���в�����, ���Ѿ������仯, ����options��ָ����unset����ɾ��, ��ɾ�������ݱ�������_escapedAttributes�е�����
                if(!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
                    // ��ɾ��ͨ��escape�����������, ����Ϊ�˱�֤�����е�������ģ���е���ʵ���ݱ���ͬ��
                    delete escaped[attr];
                    // ���ָ����silent����, ��˴�set�������ò��ᴥ��change�¼�, ��˽����ı�����ݼ�¼��_silent������, ������һ�δ���change�¼�ʱ, ֪ͨ�¼����������������Ѿ��ı�
                    // ���û��ָ��silent����, ��ֱ������changes�����е�ǰ����Ϊ�Ѹı�״̬
                    (options.silent ? this._silent : changes)[attr] = true;
                }

                // �����options��������unset, ���ģ����ɾ��������(����key)
                // ���û��ָ��unset����, ����Ϊ���������޸�����, ��ģ�͵����ݶ����м����µ�����
                options.unset ?
                delete now[attr] : now[attr] = val;

                // ���ģ���е��������µ����ݲ�һ��, ���ʾ�������ѷ����仯
                if(!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
                    // ��changed�����м�¼��ǰ�����Ѿ������仯��״̬
                    this.changed[attr] = val;
                    if(!options.silent)
                        this._pending[attr] = true;
                } else {
                    // �������û�з����仯, ���changed�������Ƴ��ѱ仯״̬
                    delete this.changed[attr];
                    delete this._pending[attr];
                }
            }

            // ����change����, ������change�¼��󶨵ĺ���
            if(!options.silent)
                this.change(options);
            return this;
        },
        // �ӵ�ǰģ����ɾ��ָ��������(����Ҳ����ͬʱɾ��)
        unset : function(attr, options) {
            (options || ( options = {})).unset = true;
            // ͨ��options.unset�������֪set��������ɾ������
            return this.set(attr, null, options);
        },
        // �����ǰģ���е��������ݺ�����
        clear : function(options) {
            (options || ( options = {})).unset = true;
            // ��¡һ����ǰģ�͵����Ը���, ��ͨ��options.unset�������֪set����ִ��ɾ������
            return this.set(_.clone(this.attributes), options);
        },
        // �ӷ�������ȡĬ�ϵ�ģ������, ��ȡ���ݺ�ʹ��set������������䵽ģ��, ��������ȡ���������뵱ǰģ���е����ݲ�һ��, ���ᴥ��change�¼�
        fetch : function(options) {
            // ȷ��options��һ���µĶ���, ��󽫸ı�options�е�����
            options = options ? _.clone(options) : {};
            var model = this;
            // ��options�п���ָ����ȡ���ݳɹ�����Զ���ص�����
            var success = options.success;
            // ����ȡ���ݳɹ���������ݲ������Զ���ɹ��ص�����
            options.success = function(resp, status, xhr) {
                // ͨ��parse���������������ص����ݽ���ת��
                // ͨ��set������ת�����������䵽ģ����, ��˿��ܻᴥ��change�¼�(�����ݷ����仯ʱ)
                // ����������ʱ��֤ʧ��, �򲻻�����Զ���success�ص�����
                if(!model.set(model.parse(resp, xhr), options))
                    return false;
                // �����Զ����success�ص�����
                if(success)
                    success(model, resp);
            };
            // ����������ʱͨ��wrapError����error�¼�
            options.error = Backbone.wrapError(options.error, model, options);
            // ����sync�����ӷ�������ȡ����
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },
        // ����ģ���е����ݵ�������
        save : function(key, value, options) {
            // attrs�洢��Ҫ���浽�����������ݶ���
            var attrs, current;

            // ֧�����õ������Եķ�ʽ key: value
            // ֧�ֶ�����ʽ���������÷�ʽ {key: value}
            if(_.isObject(key) || key == null) {
                // ���key��һ������, ����Ϊ��ͨ������ʽ����
                // ��ʱ�ڶ�����������Ϊ��options
                attrs = key;
                options = value;
            } else {
                // �����ͨ��key: value��ʽ���õ�������, ��ֱ������attrs
                attrs = {};
                attrs[key] = value;
            }
            // ���ö��������һ���µĶ���
            options = options ? _.clone(options) : {};

            // �����options��������waitѡ��, �򱻸ı�����ݽ��ᱻ��ǰ��֤, �ҷ�����û����Ӧ������(����Ӧʧ��)ʱ, �������ݻᱻ��ԭΪ�޸�ǰ��״̬
            // ���û������waitѡ��, �����۷������Ƿ����óɹ�, �������ݾ��ᱻ�޸�Ϊ����״̬
            if(options.wait) {
                // ����Ҫ�����������ǰ������֤
                if(!this._validate(attrs, options))
                    return false;
                // ��¼��ǰģ���е�����, �����ڽ����ݷ��͵���������, �����ݽ��л�ԭ
                // �����������Ӧʧ�ܻ�û�з�������, ����Ա����޸�ǰ��״̬
                current = _.clone(this.attributes);
            }

            // silentOptions��options�����м�����silent(�������ݽ�����֤)
            // ��ʹ��wait����ʱʹ��silentOptions������, ��Ϊ�������Ѿ������ݽ��й���֤
            // ���û������wait����, ����Ȼʹ��ԭʼ��options������
            var silentOptions = _.extend({}, options, {
                silent : true
            });
            // ���޸Ĺ����µ����ݱ��浽ģ����, ������sync�����л�ȡģ�����ݱ��浽������
            if(attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
                return false;
            }

            var model = this;
            // ��options�п���ָ���������ݳɹ�����Զ���ص�����
            var success = options.success;
            // ��������Ӧ�ɹ���ִ��success
            options.success = function(resp, status, xhr) {
                // ��ȡ��������Ӧ����״̬������
                var serverAttrs = model.parse(resp, xhr);
                // ���ʹ����wait����, �����Ƚ��޸ĺ������״ֱ̬�����õ�ģ��
                if(options.wait) {
                    delete options.wait;
                    serverAttrs = _.extend(attrs || {}, serverAttrs);
                }
                // �����µ�����״̬���õ�ģ����
                // �������set����ʱ��֤ʧ��, �򲻻�����Զ����success�ص�����
                if(!model.set(serverAttrs, options))
                    return false;
                if(success) {
                    // ������Ӧ�ɹ����Զ����success�ص�����
                    success(model, resp);
                } else {
                    // ���û��ָ���Զ���ص�, ��Ĭ�ϴ���sync�¼�
                    model.trigger('sync', model, resp, options);
                }
            };
            // ����������ʱͨ��wrapError����error�¼�
            options.error = Backbone.wrapError(options.error, model, options);
            // ��ģ���е����ݱ��浽������
            // �����ǰģ����һ���½���ģ��(û��id), ��ʹ��create����(����), ������Ϊ��update����(�޸�)
            var method = this.isNew() ? 'create' : 'update';
            var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
            // ���������options.wait, �����ݻ�ԭΪ�޸�ǰ��״̬
            // ��ʱ���������û�еõ���Ӧ, ��������Ӧʧ��, ģ���н������޸�ǰ��״̬, �����������Ӧ�ɹ�, �����success������ģ���е�����Ϊ����״̬
            if(options.wait)
                this.set(current, silentOptions);
            return xhr;
        },
        // ɾ��ģ��, ģ�ͽ�ͬʱ��������Collection�����б�ɾ��
        // ���ģ�����ڿͻ����½���, ��ֱ�Ӵӿͻ���ɾ��
        // ���ģ������ͬʱ���ڷ�����, ��ͬʱ��ɾ���������˵�����
        destroy : function(options) {
            // �����������һ���µĶ���
            options = options ? _.clone(options) : {};
            var model = this;
            // ��options�п���ָ��ɾ�����ݳɹ�����Զ���ص�����
            var success = options.success;
            // ɾ�����ݳɹ�����, ����destroy�¼�, ���ģ�ʹ�����Collection������, ���Ͻ�����destroy�¼����ڴ���ʱ�Ӽ������Ƴ���ģ��
            // ɾ��ģ��ʱ, ģ���е����ݲ�û�б����, ��ģ���Ѿ��Ӽ������Ƴ�, ��˵�û���κεط����ø�ģ��ʱ, �ᱻ�Զ����ڴ����ͷ�
            // ������ɾ��ģ��ʱ, ��ģ�Ͷ�������ñ�������Ϊnull
            var triggerDestroy = function() {
                model.trigger('destroy', model, model.collection, options);
            };
            // �����ģ����һ���ͻ����½���ģ��, ��ֱ�ӵ���triggerDestroy�Ӽ����н�ģ���Ƴ�
            if(this.isNew()) {
                triggerDestroy();
                return false;
            }

            // ���ӷ�����ɾ�����ݳɹ�ʱ
            options.success = function(resp) {
                // �����options����������wait��, ���ʾ�����ڴ��е�ģ������, ���ڷ��������ݱ�ɾ���ɹ�����ɾ��
                // �����������Ӧʧ��, �򱾵����ݲ��ᱻɾ��
                if(options.wait)
                    triggerDestroy();
                if(success) {
                    // �����Զ���ĳɹ��ص�����
                    success(model, resp);
                } else {
                    // ���û���Զ���ص�, ��Ĭ�ϴ���sync�¼�
                    model.trigger('sync', model, resp, options);
                }
            };
            // ����������ʱͨ��wrapError����error�¼�
            options.error = Backbone.wrapError(options.error, model, options);
            // ͨ��sync��������ɾ�����ݵ�����
            var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
            // ���û����options����������wait��, �����ɾ����������, �ٷ�������ɾ������������
            // ��ʱ���۷�����ɾ���Ƿ�ɹ�, ����ģ�������ѱ�ɾ��
            if(!options.wait)
                triggerDestroy();
            return xhr;
        },
        // ��ȡģ���ڷ������ӿ��ж�Ӧ��url, �ڵ���save, fetch, destroy��������������ķ���ʱ, ��ʹ�ø÷�����ȡurl
        // ���ɵ�url������"PATHINFO"ģʽ, ��������ģ�͵Ĳ���ֻ��һ��url, �����޸ĺ�ɾ����������url��׷��ģ��id���ڱ�ʶ
        // �����ģ���ж�����urlRoot, �������ӿ�ӦΪ[urlRoot/id]��ʽ
        // ���ģ��������Collection���϶�����url����������, ��ʹ�ü����е�url��ʽ: [collection.url/id]
        // �ڷ��ʷ�����urlʱ����url����׷����ģ�͵�id, ���ڷ�������ʶһ����¼, ���ģ���е�id��Ҫ���������¼��Ӧ
        // ����޷���ȡģ�ͻ򼯺ϵ�url, ������urlError�����׳�һ���쳣
        // ����������ӿڲ�û�а���"PATHINFO"��ʽ������֯, ����ͨ������url����ʵ������������޷콻��
        url : function() {
            // �����������Ӧ��url·��
            var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
            // �����ǰģ���ǿͻ����½���ģ��, �򲻴���id����, ������urlֱ��ʹ��base
            if(this.isNew())
                return base;
            // �����ǰģ�;���id����, �����ǵ�����save��destroy����, ����base����׷��ģ�͵�id
            // ���潫�ж�base���һ���ַ��Ƿ���"/", ���ɵ�url��ʽΪ[base/id]
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
        },
        // parse�������ڽ����ӷ�������ȡ������, ����һ���ܹ���set����������ģ������
        // һ��parse��������ݷ��������ص����ݽ�������, �Ա㹹������������޷�����
        // �����������ص����ݽṹ��set������������ݽṹ��һ��(�������������XML��ʽ����ʱ), ��ʹ��parse��������ת��
        parse : function(resp, xhr) {
            return resp;
        },
        // ����һ���µ�ģ��, �����к͵�ǰģ����ͬ������
        clone : function() {
            return new this.constructor(this.attributes);
        },
        // ��鵱ǰģ���Ƿ��ǿͻ��˴�������ģ��
        // ��鷽ʽ�Ǹ���ģ���Ƿ����id��ʶ, �ͻ��˴�������ģ��û��id��ʶ
        // ��˷�������Ӧ��ģ�������б������id��ʶ, ��ʶ��������Ĭ��Ϊ"id", Ҳ����ͨ���޸�idAttribute�����Զ����ʶ
        isNew : function() {
            return this.id == null;
        },
        // ���ݱ�����ʱ����change�¼��󶨵ĺ���
        // ��set����������, ���Զ�����change����, �����set����������ʱָ����silent����, ����Ҫ�ֶ�����change����
        change : function(options) {
            // options������һ������
            options || ( options = {});
            // this._changing��ص��߼���Щ����
            // this._changing�ڷ����������Ϊfalse, ��˷�������changing������ֵʼ��Ϊfalse(��һ��Ϊundefined)
            // ���ߵĳ���Ӧ�������øñ�����ʾchange�����Ƿ�ִ�����, ����������˵��̵߳Ľű���˵û������, ��Ϊ�÷�����ִ��ʱ�����������ű�
            // changing��ȡ��һ��ִ�е�״̬, �����һ�νű�û��ִ�����, ��ֵΪtrue
            var changing = this._changing;
            // ��ʼִ�б�ʶ, ִ�й�����ֵʼ��Ϊtrue, ִ����Ϻ�this._changing���޸�Ϊfalse
            this._changing = true;

            // ���Ǳ��θı������״̬��ӵ�_pending������
            for(var attr in this._silent)
            this._pending[attr] = true;

            // changes��������˵�ǰ������һ��ִ��change�¼�����, �ѱ��ı����������
            // ���֮ǰʹ��silentδ����change�¼�, �򱾴λᱻ�ŵ�changes������
            var changes = _.extend({}, options.changes, this._silent);
            // ����_silent����
            this._silent = {};
            // ����changes����, �ֱ����ÿһ�����Դ���������change�¼�
            for(var attr in changes) {
                // ��Model����, ����ֵ, ��������Ϊ�����Դ˴��ݸ��¼��ļ�������
                this.trigger('change:' + attr, this, this.get(attr), options);
            }

            // �����������ִ����, ��ִֹͣ��
            if(changing)
                return this;

            // ����change�¼�, �������ݱ��ı��, �������δ���"change:����"�¼���"change"�¼�
            while(!_.isEmpty(this._pending)) {
                this._pending = {};
                // ����change�¼�, ����Modelʵ������������Ϊ�������ݸ���������
                this.trigger('change', this, options);
                // ����changed�����е�����, �����ν��Ѹı����ݵ�״̬��changed���Ƴ�
                // �ڴ�֮���������hasChanged�������״̬, ���õ�false(δ�ı�)
                for(var attr in this.changed) {
                    if(this._pending[attr] || this._silent[attr])
                        continue;
                    // �Ƴ�changed�����ݵ�״̬
                    delete this.changed[attr];
                }
                // change�¼�ִ�����, _previousAttributes���Խ���¼��ǰģ�����µ����ݸ���
                // ��������Ҫ��ȡ���ݵ���һ��״̬, һ��ֻͨ���ڴ�����change�¼���ͨ��previous��previousAttributes������ȡ
                this._previousAttributes = _.clone(this.attributes);
            }

            // ִ����ϱ�ʶ
            this._changing = false;
            return this;
        },
        // ���ĳ�������Ƿ�����һ��ִ��change�¼��󱻸ı��
        /**
         * һ����change�¼������previous��previousAttributes����ʹ��, ��:
         * if(model.hasChanged('attr')) {
         *     var attrPrev = model.previous('attr');
         * }
         */
        hasChanged : function(attr) {
            if(!arguments.length)
                return !_.isEmpty(this.changed);
            return _.has(this.changed, attr);
        },
        // ��ȡ��ǰģ���е���������һ���������Ѿ������仯�����ݼ���
        // (һ����ʹ��silent����ʱû�е���change����, ������ݻᱻ��ʱ������changed������, ��һ�ε����ݿ�ͨ��previousAttributes������ȡ)
        // ���������diff����, ��ʹ����һ��ģ��������diff�����е����ݽ��бȽ�, ���ز�һ�µ����ݼ���
        // ����ȽϽ����û�в���, �򷵻�false
        changedAttributes : function(diff) {
            // ���û��ָ��diff, �����ص�ǰģ�ͽ���һ��״̬�Ѹı�����ݼ���, ��Щ�����Ѿ�������changed������, ��˷���changed���ϵ�һ������
            if(!diff)
                return this.hasChanged() ? _.clone(this.changed) : false;
            // ָ������Ҫ���бȽϵ�diff����, ��������һ�ε�������diff���ϵıȽϽ��
            // old�����洢����һ��״̬��ģ������
            var val, changed = false, old = this._previousAttributes;
            // ����diff����, ����ÿһ������һ��״̬�ļ��Ͻ��бȽ�
            for(var attr in diff) {
                // ���ȽϽ����һ�µ�������ʱ�洢��changed����
                if(_.isEqual(old[attr], ( val = diff[attr])))
                    continue;
                (changed || (changed = {}))[attr] = val;
            }
            // ���رȽϽ��
            return changed;
        },
        // ��ģ�ʹ�����change�¼���, ��ȡĳ�����Ա��ı�ǰ��һ��״̬������, һ�����ڽ������ݱȽϻ�ع�
        // �÷���һ����change�¼��е���, change�¼���������, _previousAttributes���Դ�����µ�����
        previous : function(attr) {
            // attrָ����Ҫ��ȡ��һ��״̬����������
            if(!arguments.length || !this._previousAttributes)
                return null;
            return this._previousAttributes[attr];
        },
        // ��ģ�ʹ���change�¼���, ��ȡ����������һ��״̬�����ݼ���
        // �÷���������previous()����, һ����change�¼��е���, �������ݱȽϻ�ع�
        previousAttributes : function() {
            // ����һ��״̬�����ݶ����¡Ϊһ���¶��󲢷���
            return _.clone(this._previousAttributes);
        },
        // Check if the model is currently in a valid state. It's only possible to
        // get into an *invalid* state if you're using silent changes.
        // ��֤��ǰģ���е������Ƿ���ͨ��validate������֤, ����ǰ��ȷ��������validate����
        isValid : function() {
            return !this.validate(this.attributes);
        },
        // ������֤����, �ڵ���set, save, add�����ݸ��·���ʱ, ���Զ�ִ��
        // ��֤ʧ�ܻᴥ��ģ�Ͷ����"error"�¼�, �����options��ָ����error������, ��ֻ��ִ��options.error����
        // @param {Object} attrs ����ģ�͵�attributes����, �洢ģ�͵Ķ�������
        // @param {Object} options ������
        // @return {Boolean} ��֤ͨ������true, ��ͨ������false
        _validate : function(attrs, options) {
            // ����ڵ���set, save, add�����ݸ��·���ʱ������options.silent����, �������֤
            // ���Model��û�����validate����, �������֤
            if(options.silent || !this.validate)
                return true;
            // ��ȡ���������е�����ֵ, ������validate�����н�����֤
            // validate��������2������, �ֱ�Ϊģ���е����ݼ��������ö���, �����֤ͨ���򲻷����κ�����(Ĭ��Ϊundefined), ��֤ʧ���򷵻ش��д�����Ϣ����
            attrs = _.extend({}, this.attributes, attrs);
            var error = this.validate(attrs, options);
            // ��֤ͨ��
            if(!error)
                return true;
            // ��֤δͨ��
            // ������ö�����������error��������, ����ø÷��������������ݺ����ö��󴫵ݸ��÷���
            if(options && options.error) {
                options.error(this, error, options);
            } else {
                // �����ģ�Ͱ���error�¼�����, �򴥷����¼�
                this.trigger('error', this, error, options);
            }
            // ������֤δͨ����ʶ
            return false;
        }
    });

    // Backbone.Collection ����ģ�ͼ������
    // -------------------

    // Collection���ϴ洢һϵ����ͬ�������ģ��, ���ṩ��ط�����ģ�ͽ��в���
    var Collection = Backbone.Collection = function(models, options) {
        // ���ö���
        options || ( options = {});
        // �����ò��������ü��ϵ�ģ����
        if(options.model)
            this.model = options.model;
        // ���������comparator����, �򼯺��е����ݽ�����comparator�����е������㷨��������(��add�����л��Զ�����)
        if(options.comparator)
            this.comparator = options.comparator;
        // ʵ����ʱ���ü��ϵ��ڲ�״̬(��һ�ε���ʱ�����Ϊ����״̬)
        this._reset();
        // �����Զ����ʼ������, �����Ҫһ�������initialize����
        this.initialize.apply(this, arguments);
        // ���ָ����models����, �����reset������������ӵ�������
        // �״ε���ʱ������silent����, ��˲��ᴥ��"reset"�¼�
        if(models)
            this.reset(models, {
                silent : true,
                parse : options.parse
            });
    };
    // ͨ��extend�������弯����ԭ�ͷ���
    _.extend(Collection.prototype, Events, {

        // ���弯�ϵ�ģ����, ģ���������һ��Backbone.Model������
        // ��ʹ�ü�����ط���(��add, create��)ʱ, ���������ݶ���, ���Ϸ�������ݶ����ģ�����Զ�������Ӧ��ʵ��
        // �����д洢������ģ��Ӧ�ö���ͬһ��ģ�����ʵ��
        model : Model,

        // ��ʼ������, �÷����ڼ���ʵ�����������Զ�����
        // һ����ڶ��弯����ʱ���ظ÷���
        initialize : function() {
        },
        // ����һ������, �����˼�����ÿ��ģ�͵����ݶ���
        toJSON : function(options) {
            // ͨ��Undersocre��map������������ÿһ��ģ�͵�toJSON������һ������, ������
            return this.map(function(model) {
                // ���ε���ÿ��ģ�Ͷ����toJSON����, �÷���Ĭ�Ͻ�����ģ�͵����ݶ���(���Ƶĸ���)
                // �����Ҫ�����ַ�����������ʽ, ��������toJSON����
                return model.toJSON(options);
            });
        },
        // �򼯺������һ������ģ�Ͷ���
        // Ĭ�ϻᴥ��"add"�¼�, �����options��������silent����, ���Թرմ˴��¼�����
        // �����models������һ����һϵ�е�ģ�Ͷ���(Model���ʵ��), ����ڼ�����������model����, ������ֱ�Ӵ������ݶ���(�� {name: 'test'}), ���Զ������ݶ���ʵ����Ϊmodelָ���ģ�Ͷ���
        add : function(models, options) {
            // �ֲ���������
            var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
            options || ( options = {});
            // models������һ������, ���ֻ������һ��ģ��, ����ת��Ϊ����
            models = _.isArray(models) ? models.slice() : [models];

            // ������Ҫ��ӵ�ģ���б�, ����������, ��ִ�����²���:
            // - �����ݶ���ת��ģ�Ͷ���
            // - ����ģ���뼯��֮�������
            // - ��¼��Ч���ظ���ģ��, ���ں�����й���
            for( i = 0, length = models.length; i < length; i++) {
                // �����ݶ���ת��Ϊģ�Ͷ���, ����ģ���뼯�ϵ�����, ���洢��model(ͬʱmodels�ж�Ӧ��ģ���Ѿ����滻Ϊģ�Ͷ���)
                if(!( model = models[i] = this._prepareModel(models[i], options))) {
                    throw new Error("Can't add an invalid model to a collection");
                }
                // ��ǰģ�͵�cid��id
                cid = model.cid;
                id = model.id;
                // dups�����м�¼����Ч���ظ���ģ������(models�����е�����), ������һ�����й���ɾ��
                // ���cids, ids�������Ѿ������˸�ģ�͵�����, ����Ϊ��ͬһ��ģ���ڴ����models�����������˶��
                // ���_byCid, _byId�������Ѿ������˸�ģ�͵�����, ����Ϊͬһ��ģ���ڵ�ǰ�������Ѿ�����
                // ���������������, ��ģ�͵�������¼��dups���й���ɾ��
                if(cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
                    dups.push(i);
                    continue;
                }
                // ��models���Ѿ���������ģ�ͼ�¼����, ��������һ��ѭ��ʱ�����ظ����
                cids[cid] = ids[id] = model;
            }

            // ��models��ɾ����Ч���ظ���ģ��, ����Ŀǰ������������Ҫ��ӵ�ģ���б�
            i = dups.length;
            while(i--) {
                models.splice(dups[i], 1);
            }

            // ������Ҫ��ӵ�ģ��, ����ģ���¼�����¼_byCid, _byId�б�, �����ڵ���get��getByCid����ʱ��Ϊ����
            for( i = 0, length = models.length; i < length; i++) {
                // ����ģ���е������¼�, ��ִ��_onModelEvent����
                // _onModelEvent�����л��ģ���׳���add, remove, destroy��change�¼����д���, �Ա�ģ���뼯���е�״̬����ͬ��
                ( model = models[i]).on('all', this._onModelEvent, this);
                // ��ģ�͸���cid��¼��_byCid����, ���ڸ���cid���в���
                this._byCid[model.cid] = model;
                // ��ģ�͸���id��¼��_byId����, ���ڸ���id���в���
                if(model.id != null)
                    this._byId[model.id] = model;
            }

            // �ı伯�ϵ�length����, length���Լ�¼�˵�ǰ������ģ�͵�����
            this.length += length;
            // ������ģ���б���뵽�����е�λ��, �����options��������at����, ���ڼ��ϵ�atλ�ò���
            // Ĭ�Ͻ����뵽���ϵ�ĩβ
            // ���������comparator�Զ������򷽷�, ������at�󻹽�����comparator�еķ�����������, ������յ�˳����ܲ�����atָ����λ��
            index = options.at != null ? options.at : this.models.length;
            splice.apply(this.models, [index, 0].concat(models));
            // ���������comparator����, �����ݰ���comparator�е��㷨��������
            // �Զ�����ʹ��silent������ֹ����reset�¼�
            if(this.comparator)
                this.sort({
                    silent : true
                });
            // ���ζ�ÿ��ģ�Ͷ��󴥷�"add"�¼�, ���������silent����, ����ֹ�¼�����
            if(options.silent)
                return this;
            // ���������ӵ�ģ���б�
            for( i = 0, length = this.models.length; i < length; i++) {
                if(!cids[( model = this.models[i]).cid])
                    continue;
                options.index = i;
                // ����ģ�͵�"add"�¼�, ��Ϊ���ϼ�����ģ�͵�"all"�¼�, �����_onModelEvent������, ����Ҳ������"add"�¼�
                // ��ϸ��Ϣ�ɲο�Collection.prototype._onModelEvent����
                model.trigger('add', model, this, options);
            }
            return this;
        },
        // �Ӽ������Ƴ�ģ�Ͷ���(֧���Ƴ����ģ��)
        // �����models��������Ҫ�Ƴ���ģ�Ͷ���, ��ģ�͵�cid��ģ�͵�id
        // �Ƴ�ģ�Ͳ��������ģ�͵�destroy����
        // ���û������options.silent����, ������ģ�͵�remove�¼�, ͬʱ���������ϵ�remove�¼�(����ͨ��_onModelEvent����������ģ�͵������¼�)
        remove : function(models, options) {
            var i, l, index, model;
            // optionsĬ��Ϊ�ն���
            options || ( options = {});
            // models��������������, ��ֻ�Ƴ�һ��ģ��ʱ, �������һ������
            models = _.isArray(models) ? models.slice() : [models];
            // ������Ҫ�Ƴ���ģ���б�
            for( i = 0, l = models.length; i < l; i++) {
                // �������models�б��п�������Ҫ�Ƴ���ģ�Ͷ���, ��ģ�͵�cid��ģ�͵�id
                // (��getByCid��get������, ��ͨ��cid, id����ȡģ��, ����������һ��ģ�Ͷ���, �򷵻�ģ�ͱ���)
                model = this.getByCid(models[i]) || this.get(models[i]);
                // û�л�ȡ��ģ��
                if(!model)
                    continue;
                // ��_byId�б����Ƴ�ģ�͵�id����
                delete this._byId[model.id];
                // ��_byCid�б����Ƴ�ģ�͵�cid����
                delete this._byCid[model.cid];
                // indexOf��Underscore�����еķ���, ����ͨ��indexOf������ȡģ���ڼ������״γ��ֵ�λ��
                index = this.indexOf(model);
                // �Ӽ����б����Ƴ���ģ��
                this.models.splice(index, 1);
                // ���õ�ǰ���ϵ�length����(��¼������ģ�͵�����)
                this.length--;
                // ���û������silent����, �򴥷�ģ�͵�remove�¼�
                if(!options.silent) {
                    // ����ǰģ���ڼ����е�λ����ӵ�options���󲢴��ݸ�remove�����¼�, �Ա����¼������п���ʹ��
                    options.index = index;
                    model.trigger('remove', model, this, options);
                }
                // ���ģ���뼯�ϵĹ�ϵ, ���������ж�ģ�͵����ú��¼�����
                this._removeReference(model);
            }
            return this;
        },
        // �򼯺ϵ�ĩβ���ģ�Ͷ���
        // ����������ж�����comparator���򷽷�, ��ͨ��push������ӵ�ģ�ͽ�����comparator������㷨��������, ���ģ��˳����ܻᱻ�ı�
        push : function(model, options) {
            // ͨ��_prepareModel������modelʵ����Ϊģ�Ͷ���, �������Ƕ����, ��Ϊ��������õ�add�����л���ͨ��_prepareModel��ȡһ��ģ��
            model = this._prepareModel(model, options);
            // ����add������ģ����ӵ�������(Ĭ����ӵ�����ĩβ)
            this.add(model, options);
            return model;
        },
        // �Ƴ����������һ��ģ�Ͷ���
        pop : function(options) {
            // ��ȡ���������һ��ģ��
            var model = this.at(this.length - 1);
            // ͨ��remove�����Ƴ���ģ��
            this.remove(model, options);
            return model;
        },
        // �򼯺ϵĵ�һ��λ�ò���ģ��
        // ����������ж�����comparator���򷽷�, ��ͨ��unshift������ӵ�ģ�ͽ�����comparator������㷨��������, ���ģ��˳����ܻᱻ�ı�
        unshift : function(model, options) {
            // ͨ��_prepareModel������modelʵ����Ϊģ�Ͷ���
            model = this._prepareModel(model, options);
            // ����add������ģ�Ͳ��뵽���ϵĵ�һ��λ��(����atΪ0)
            // ���������comparator���򷽷�, ���ϵ�˳�򽫱�����
            this.add(model, _.extend({
                at : 0
            }, options));
            return model;
        },
        // �Ƴ������ؼ����еĵ�һ��ģ�Ͷ���
        shift : function(options) {
            // ��ü����еĵ�һ��ģ��
            var model = this.at(0);
            // �Ӽ�����ɾ����ģ��
            this.remove(model, options);
            // ����ģ�Ͷ���
            return model;
        },
        // ����id�Ӽ����в���ģ�Ͳ�����
        get : function(id) {
            if(id == null)
                return
                void 0;
            return this._byId[id.id != null ? id.id : id];
        },
        // ����cid�Ӽ����в���ģ�Ͳ�����
        getByCid : function(cid) {
            return cid && this._byCid[cid.cid || cid];
        },
        // ��������(�±�, ��0��ʼ)�Ӽ����в���ģ�Ͳ�����
        at : function(index) {
            return this.models[index];
        },
        // �Լ����е�ģ�͸���ֵ����ɸѡ
        // attrs��һ��ɸѡ����, �� {name: 'Jack'}, �����ؼ���������nameΪ"Jack"��ģ��(����)
        where : function(attrs) {
            // attrs����Ϊ��ֵ
            if(_.isEmpty(attrs))
                return [];
            // ͨ��filter�����Լ����е�ģ�ͽ���ɸѡ
            // filter������Underscore�еķ���, ���ڽ����������е�Ԫ��, ������ͨ����������֤(����ֵΪtrue)��Ԫ����Ϊ���鷵��
            return this.filter(function(model) {
                // ����attrs�����е���֤����
                for(var key in attrs) {
                    // ��attrs�е���֤�����뼯���е�ģ�ͽ���ƥ��
                    if(attrs[key] !== model.get(key))
                        return false;
                }
                return true;
            });
        },
        // �Լ����е�ģ�Ͱ���comparator����ָ���ķ�����������
        // ���û����options������silent����, ������󽫴���reset�¼�
        sort : function(options) {
            // optionsĬ����һ������
            options || ( options = {});
            // ����sort��������ָ����comparator����(�����㷨����), �����׳�һ������
            if(!this.comparator)
                throw new Error('Cannot sort a set without a comparator');
            // boundComparator�洢�˰󶨵�ǰ���������Ķ����comparator�����㷨����
            var boundComparator = _.bind(this.comparator, this);
            if(this.comparator.length == 1) {
                this.models = this.sortBy(boundComparator);
            } else {
                // ����Array.prototype.sortͨ��comparator�㷨�����ݽ����Զ�������
                this.models.sort(boundComparator);
            }
            // ���û��ָ��silent����, �򴥷�reset�¼�
            if(!options.silent)
                this.trigger('reset', this, options);
            return this;
        },
        // ������������ģ�͵�attr����ֵ��ŵ�һ�����鲢����
        pluck : function(attr) {
            // map��Underscore�еķ���, ���ڱ���һ������, �������д������ķ���ֵ��Ϊһ�����鷵��
            return _.map(this.models, function(model) {
                // ���ص�ǰģ�͵�attr����ֵ
                return model.get(attr);
            });
        },
        // �滻�����е�����ģ������(models)
        // �ò�����ɾ�������е�ǰ���������ݺ�״̬, �����½���������Ϊmodels
        // modelsӦ����һ������, ���԰���һϵ��Modelģ�Ͷ���, ��ԭʼ����(����add�������Զ�����Ϊģ�Ͷ���)
        reset : function(models, options) {
            // models�ǽ����滻��ģ��(������)����
            models || ( models = []);
            // optionsĬ����һ���ն���
            options || ( options = {});
            // ������ǰ�����е�ģ��, ����ɾ������������뼯�ϵ����ù�ϵ
            for(var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            // ɾ���������ݲ�����״̬
            this._reset();
            // ͨ��add�������µ�ģ��������ӵ�����
            // ����ͨ��exnted������������ǵ�һ���µĶ���, �ö���Ĭ��silentΪtrue, ��˲��ᴥ��"add"�¼�
            // ����ڵ���reset����ʱû������silent������ᴥ��reset�¼�, �������Ϊtrue�򲻻ᴥ���κ��¼�, �������Ϊfalse, �����δ���"add"��"reset"�¼�
            this.add(models, _.extend({
                silent : true
            }, options));
            // ����ڵ���reset����ʱû������silent����, �򴥷�reset�¼�
            if(!options.silent)
                this.trigger('reset', this, options);
            return this;
        },
        // �ӷ�������ȡ���ϵĳ�ʼ������
        // �����options�����ò���add=true, ���ȡ�������ݻᱻ׷�ӵ�������, �����Է��������ص������滻�����еĵ�ǰ����
        fetch : function(options) {
            // ����options����, ��Ϊoptions�����ں���ᱻ�޸�������ʱ�洢����
            options = options ? _.clone(options) : {};
            if(options.parse === undefined)
                options.parse = true;
            // collection��¼��ǰ���϶���, ������success�ص�������ʹ��
            var collection = this;
            // �Զ���ص�����, ��������ɹ��������ɺ�, ������Զ���success����
            var success = options.success;
            // ���ӷ������������ݳɹ�ʱִ��options.success, �ú����н��������������
            options.success = function(resp, status, xhr) {
                // ͨ��parse�����Է��������ص����ݽ��н���, �����Ҫ�Զ������ݽṹ, ��������parse����
                // �����options������add=true, �����add������������ӵ�����, ����ͨ��reset�����������е������滻Ϊ�������ķ�������
                collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
                // ����������Զ���ɹ��ص�, ��ִ��
                if(success)
                    success(collection, resp);
            };
            // ������������״̬����ʱ, ͨ��wrapError������������¼�
            options.error = Backbone.wrapError(options.error, collection, options);
            // ����Backbone.sync������������ӷ�������ȡ����
            // �����Ҫ�����ݲ����Ǵӷ�������ȡ, ���ȡ��ʽ��ʹ��AJAX, ��������Backbone.sync����
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },
        // �򼯺�����Ӳ�����һ��ģ��, ͬʱ����ģ�ͱ��浽������
        // �����ͨ�����ݶ���������ģ��, ��Ҫ�ڼ���������model���Զ�Ӧ��ģ����
        // �����options��������wait����, ����ڷ����������ɹ����ٽ�ģ����ӵ�����, �����Ƚ�ģ����ӵ�����, �ٱ��浽������(���۱����Ƿ�ɹ�)
        create : function(model, options) {
            var coll = this;
            // ����options����
            options = options ? _.clone(options) : {};
            // ͨ��_prepareModel��ȡģ�����ʵ��
            model = this._prepareModel(model, options);
            // ģ�ʹ���ʧ��
            if(!model)
                return false;
            // ���û������wait����, ��ͨ��add������ģ����ӵ�������
            if(!options.wait)
                coll.add(model, options);
            // success�洢���浽�������ɹ�֮����Զ���ص�����(ͨ��options.success����)
            var success = options.success;
            // ����ģ�����ݱ���ɹ���Ļص�����
            options.success = function(nextModel, resp, xhr) {
                // ���������wait����, ����ֻ���ڷ���������ɹ���ŻὫģ����ӵ�������
                if(options.wait)
                    coll.add(nextModel, options);
                // ����������Զ���ɹ��ص�, ��ִ���Զ��庯��, ����Ĭ�ϴ���ģ�͵�sync�¼�
                if(success) {
                    success(nextModel, resp);
                } else {
                    nextModel.trigger('sync', model, resp, options);
                }
            };
            // ����ģ�͵�save����, ��ģ�����ݱ��浽������
            model.save(null, options);
            return model;
        },
        // ���ݽ�������, ���ڽ����������ݽ���Ϊģ�ͺͼ��Ͽ��õĽṹ������
        // Ĭ�Ͻ�����resp����, ����Ҫ�����������Backbone֧�ֵ����ݸ�ʽ, �����Ҫ�Զ������ݸ�ʽ, ��������parse����
        parse : function(resp, xhr) {
            return resp;
        },
        // chain���ڹ����������ݵ���ʽ����, ���������е�����ת��Ϊһ��Underscore����, ��ʹ��Underscore��chain����ת��Ϊ��ʽ�ṹ
        // ����chain������ת����ʽ, �ɲο�Underscore��chain������ע��
        chain : function() {
            return _(this.models).chain();
        },
        // ɾ�����м���Ԫ�ز����ü����е�����״̬
        _reset : function(options) {
            // ɾ������Ԫ��
            this.length = 0;
            this.models = [];
            // ���ü���״̬
            this._byId = {};
            this._byCid = {};
        },
        // ��ģ����ӵ�������֮ǰ��һЩ׼������
        // ����������ʵ����Ϊһ��ģ�Ͷ���, �ͽ��������õ�ģ�͵�collection����
        _prepareModel : function(model, options) {
            options || ( options = {});
            // ���model�Ƿ���һ��ģ�Ͷ���(��Model���ʵ��)
            if(!( model instanceof Model)) {
                // �����model��ģ�����ݶ���, ������ģ�Ͷ���
                // ��������Ϊ�������ݸ�Model, �Դ���һ���µ�ģ�Ͷ���
                var attrs = model;
                // ����ģ�����õļ���
                options.collection = this;
                // ������ת��Ϊģ��
                model = new this.model(attrs, options);
                // ��ģ���е����ݽ�����֤
                if(!model._validate(model.attributes, options))
                    model = false;
            } else if(!model.collection) {
                // ����������һ��ģ�Ͷ���û�н����뼯�ϵ�����, ������ģ�͵�collection����Ϊ��ǰ����
                model.collection = this;
            }
            return model;
        },
        // ���ĳ��ģ���뼯�ϵĹ�ϵ, �����Լ��ϵ����ú��¼�����
        // һ���ڵ���remove����ɾ��ģ�ͻ����reset��������״̬ʱ�Զ�����
        _removeReference : function(model) {
            // ���ģ�������˵�ǰ����, ���Ƴ�������(����ȷ�����ж�ģ�͵������Ѿ����, ����ģ�Ϳ����޷����ڴ����ͷ�)
            if(this == model.collection) {
                delete model.collection;
            }
            // ȡ�������м���������ģ���¼�
            model.off('all', this._onModelEvent, this);
        },
        // ���򼯺������ģ��ʱ���Զ�����
        // ���ڼ���������ģ�͵��¼�, ��ģ���ڴ����¼�(add, remove, destroy, change�¼�)ʱ���Ͻ�����ش���
        _onModelEvent : function(event, model, collection, options) {
            // ��Ӻ��Ƴ�ģ�͵��¼�, ����ȷ��ģ�������ļ���Ϊ��ǰ���϶���
            if((event == 'add' || event == 'remove') && collection != this)
                return;
            // ģ�ʹ��������¼�ʱ, �Ӽ������Ƴ�
            if(event == 'destroy') {
                this.remove(model, options);
            }
            // ��ģ�͵�id���޸�ʱ, �����޸�_byId�д洢��ģ�͵�����, ������ģ��id��ͬ��, ����ʹ��get()������ȡģ�Ͷ���
            if(model && event === 'change:' + model.idAttribute) {
                // ��ȡģ���ڸı�֮ǰ��id, �����ݴ�id�Ӽ��ϵ�_byId�б����Ƴ�
                delete this._byId[model.previous(model.idAttribute)];
                // ��ģ���µ�id��Ϊkey, ��_byId�б��д�Ŷ�ģ�͵�����
                this._byId[model.id] = model;
            }
            // �ڼ����д���ģ�Ͷ�Ӧ���¼�, ����ģ�ʹ����κ��¼�, ���϶��ᴥ����Ӧ���¼�
            // (���統ģ�ͱ���ӵ�������ʱ, �ᴥ��ģ�͵�"add"�¼�, ͬʱҲ���ڴ˷����д������ϵ�"add"�¼�)
            // ����ڼ�������������ģ��״̬�ı仯�ǳ���Ч
            // �ڼ����ļ����¼���, ������Ӧ�¼���ģ�ͻᱻ��Ϊ�������ݸ����ϵļ�������
            this.trigger.apply(this, arguments);
        }
    });

    // ����Underscore�еļ��ϲ�������ط���
    // ��Underscore��һϵ�м��ϲ����������Ƶ�Collection�������ԭ�Ͷ�����
    // �����Ϳ���ֱ��ͨ�����϶������Underscore��صļ��Ϸ���
    // ��Щ�����ڵ���ʱ�������ļ��������ǵ�ǰCollection�����models����
    var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

    // �����Ѿ�����ķ����б�
    _.each(methods, function(method) {
        // ���������Ƶ�Collection�������ԭ�Ͷ���
        Collection.prototype[method] = function() {
            // ����ʱֱ��ʹ��Underscore�ķ���, �����Ķ��󱣳�ΪUnderscore����
            // ��Ҫע��������ﴫ�ݸ�Underscore�����ļ��ϲ����� this.models, �����ʹ����Щ����ʱ, �������ļ��϶����ǵ�ǰCollection�����models����
            return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
        };
    });
    // Backbone.Router URL·����
    // -------------------

    // ͨ���̳�Backbone.Router��ʵ���Զ����·����
    // ·����������·�ɹ���, ͨ��URLƬ�ν��е���, ����ÿһ�������Ӧ��һ������, ��URLƥ��ĳ������ʱ���Զ�ִ�и÷���
    // ·����ͨ��URL���е���, ������ʽ��ΪpushState, Hash, �ͼ�����ʽ(��ϸ�ɲο�Backbone.History��)
    // �ڴ���Routerʵ��ʱ, ͨ��options.routes������ĳ��·�ɹ����Ӧ�ļ�������
    // options.routes�е�·�ɹ����� {��������: ��������}������֯, ÿһ��·�ɹ�������Ӧ�ķ���, ����������Routerʵ���е��Ѿ������ķ���
    // options.routes�����·�ɹ������Ⱥ�˳�����ƥ��, �����ǰURL�ܱ��������ƥ��, ��ֻ��ִ�е�һ��ƥ����¼�����
    var Router = Backbone.Router = function(options) {
        // optionsĬ����һ���ն���
        options || ( options = {});
        // �����options��������routes����(·�ɹ���), �򸳸���ǰʵ����routes����
        // routes���Լ�¼��·�ɹ������¼������İ󶨹�ϵ, ��URL��ĳһ������ƥ��ʱ, ���Զ����ù������¼�����
        if(options.routes)
            this.routes = options.routes;
        // �����Ͱ�·�ɹ���
        this._bindRoutes();
        // �����Զ���ĳ�ʼ������
        this.initialize.apply(this, arguments);
    };
    // �������ڽ��ַ�����ʽ��·�ɹ���, ת��Ϊ��ִ�е�������ʽ����ʱ�Ĳ�������
    // (�ַ�����ʽ��·�ɹ���, ͨ��\w+����ƥ��, ���ֻ֧����ĸ���ֺ��»�����ɵ��ַ���)
    // ƥ��һ��URLƬ����(��/"б��"Ϊ�ָ�)�Ķ�̬·�ɹ���
    // ��: (topic/:id) ƥ�� (topic/1228), �����¼�function(id) { // idΪ1228 }
    var namedParam = /:\w+/g;
    // ƥ������URLƬ���еĶ�̬·�ɹ���
    // ��: (topic*id) ƥ�� (url#/topic1228), �����¼�function(id) { // idΪ1228 }
    var splatParam = /\*\w+/g;
    // ƥ��URLƬ���е������ַ�, �����ַ�ǰ����ת���, ��ֹ�����ַ��ڱ�ת��Ϊ������ʽ����Ԫ�ַ�
    // ��: (abc)^[,.] ����ת��Ϊ \(abc\)\^\[\,\.\]
    var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

    // ��Router���ԭ�Ͷ�������չ���Ժͷ���
    _.extend(Router.prototype, Events, {

        // �Զ����ʼ������, ��·����Routerʵ�������Զ�����
        initialize : function() {
        },
        // ��һ��·�ɹ���󶨸�һ�������¼�, ��URLƬ��ƥ��ù���ʱ, ���Զ����ô������¼�
        route : function(route, name, callback) {
            // ����historyʵ��, Backbone.history��һ����������, ֻ�ڵ�һ�δ���·��������ʱ��ʵ����
            Backbone.history || (Backbone.history = new History);
            // ���route���������Ƿ�Ϊһ���ַ���(���ֶ�����route��������·�ɹ���ʱ, ������һ��������ʽ���ַ�����Ϊ����)
            // �ڹ���Routerʵ��ʱ����options.routes�еĹ���, ��Ӧ����һ���ַ���(��Ϊ��_bindRoutes�����н�routes�����е�key��Ϊ·�ɹ���)
            // �����������ַ������͵�·�ɹ���, ͨ��_routeToRegExp��������ת��Ϊһ��������ʽ, ����ƥ��URLƬ��
            if(!_.isRegExp(route))
                route = this._routeToRegExp(route);
            // ���û������callback(�¼�����), �����name�ӵ�ǰRouterʵ���л�ȡ��nameͬ���ķ���
            // ������Ϊ���ֶ�����route����ʱ���ܲ��ᴫ��callback����, �����봫��name�¼�����, ����Routerʵ�����Ѿ������˸÷���
            if(!callback)
                callback = this[name];
            // ����historyʵ����route����, �÷����Ὣת�����������ʽ����, �ͼ����¼������󶨵�history.handlers�б���, �Ա�history����·�ɺͿ���
            // ��historyʵ��ƥ�䵽��Ӧ��·�ɹ�������ø��¼�ʱ, �ὫURLƬ����Ϊ�ַ���(��fragment����)���ݸ����¼�����
            // ���ﲢû��ֱ�ӽ������¼����ݸ�history��route����, ����ʹ��bind������װ����һ������, �ú�����ִ��������Ϊ��ǰRouter����
            Backbone.history.route(route, _.bind(function(fragment) {
                // ����_extractParameters������ȡƥ�䵽�Ĺ����еĲ���
                var args = this._extractParameters(route, fragment);
                // ����callback·�ɼ����¼�, �����������ݸ������¼�
                callback && callback.apply(this, args);
                // ����route:name�¼�, nameΪ����routeʱ���ݵ��¼�����
                // ����Ե�ǰRouterʵ��ʹ��on��������route:name�¼�, ����յ����¼��Ĵ���֪ͨ
                this.trigger.apply(this, ['route:' + name].concat(args));
                // ����historyʵ���а󶨵�route�¼�, ��·����ƥ�䵽�κι���ʱ, ���ᴥ�����¼�
                Backbone.history.trigger('route', this, name, args);
                /**
                 * �¼�����:
                 * var router = new MyRouter();
                 * router.on('route:routename', function(param) {
                 *     // �󶨵�Routerʵ����ĳ��������¼�, ��ƥ�䵽�ù���ʱ����
                 * });
                 * Backbone.history.on('route', function(router, name, args) {
                 *     // �󶨵�historyʵ���е��¼�, ��ƥ�䵽�κι���ʱ����
                 * });
                 * Backbone.history.start();
                 */
            }, this));
            return this;
        },
        // ͨ������history.navigate����, �ֶ�������ת��URL
        navigate : function(fragment, options) {
            // ����historyʵ����navigate����
            Backbone.history.navigate(fragment, options);
        },
        // ������ǰʵ�������·��(this.routes)����, ������route������ÿһ������󶨵���Ӧ�ķ���
        _bindRoutes : function() {
            // ����ڴ�������ʱû������routes����, �򲻽��н����Ͱ�
            if(!this.routes)
                return;
            // routes�����Զ�ά�������ʽ�洢�������е�·�ɹ���
            // ��[['', 'homepage'], ['controller:name', 'toController']]
            var routes = [];
            // ����routes����
            for(var route in this.routes) {
                // ��·�ɹ������һ���µ�����, ����[��������, �󶨷���]��֯
                // ��������ͨ��unshift�������õ�routes����, ʵ�ֵ�������
                // ���ｫroutes�еĹ���������, �ں������route����ʱ���ٴε���unshift��˳�򵹹���, �Ա�֤���յ�˳���ǰ���routes�����ж����˳����ִ�е�
                // ��������˳���, �����»ָ��������ǰ��˳��, ֮����������, ����Ϊ�û������ֶ�����route������̬���·�ɹ���, ���ֶ���ӵ�·�ɹ���ᱻ��ӵ��б�ĵ�һ��, ���Ҫ��route������ʹ��unshift���������
                // ������Routerʵ��ʱ�Զ���ӵĹ���, Ϊ�˱��ֶ���˳��, ����ڴ˴�������Ĺ���������
                routes.unshift([route, this.routes[route]]);
            }
            // ѭ�����, ��ʱroutes�д洢�˵������е�·�ɹ���

            // ѭ��·�ɹ���, �����ε���route����, ���������ư󶨵�������¼�����
            for(var i = 0, l = routes.length; i < l; i++) {
                // ����route����, ���ֱ𴫵�(��������, �¼�������, �¼���������)
                this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
            }
        },
        // ���ַ�����ʽ��·�ɹ���ת��Ϊ������ʽ����
        // (��route�����м�鵽�ַ������͵�·�ɹ����, ���Զ����ø÷�������ת��)
        _routeToRegExp : function(route) {
            // Ϊ�ַ����������ַ����ת���, ��ֹ�����ַ��ڱ�ת��Ϊ������ʽ����Ԫ�ַ�(��Щ�����ַ�����-[\]{}()+?.,\\^$|#\s)
            // ���ַ�������/"б��"Ϊ�ָ��Ķ�̬·�ɹ���ת��Ϊ([^\/]+), �������б�ʾ��/"б��"��ͷ�Ķ���ַ�
            // ���ַ����е�*"�Ǻ�"��̬·�ɹ���ת��Ϊ(.*?), �������б�ʾ0���������ַ�(����ʹ���˷�̰��ģʽ, ��������ʹ���������������·�ɹ���: *list/:id, ��ƥ�� orderlist/123 , ͬʱ�Ὣ"order"��"123"��Ϊ�������ݸ��¼����� )
            // ��ע��namedParam��splatParam�滻���������ʽ������()���Ž�ƥ������ݰ�������, ����Ϊ�˷���ȡ��ƥ���������Ϊ�������ݸ��¼�����
            // ��ע��namedParam��splatParamƥ����ַ��� :str, *str�е�str�ַ������������, ���ǻ��������滻�󱻺���, ��һ��д���ͼ����¼������Ĳ���ͬ��, �Ա���б�ʶ
            route = route.replace(escapeRegExp, '\\$&').replace(namedParam, '([^\/]+)').replace(splatParam, '(.*?)');
            // ��ת������ַ�������Ϊ������ʽ���󲢷���
            // ���������ʽ������route�ַ����еĹ���, ����ƥ��URLƬ��
            return new RegExp('^' + route + '$');
        },
        // ����һ��·�ɹ���(������ʽ)��URLƬ��(�ַ���)����ƥ��, �����ش�ƥ����ַ����л�ȡ����
        /**
         * ����·�ɹ���Ϊ 'teams/:type/:id', ��Ӧ��������ʽ�ᱻת��Ϊ/^teams/([^/]+)/([^/]+)$/ , (��·�ɹ���ת��Ϊ������ʽ�Ĺ��̿ɲο�_routeToRegExp����)
         * URLƬ��Ϊ 'teams/35/1228'
         * ��ͨ��execִ�к�Ľ��Ϊ ["teams/35/1228", "35", "1228"]
         * �����е�һ��Ԫ����URLƬ���ַ�������, �ӵڶ�����ʼ������Ϊ·�ɹ�����ʽ�еĲ���
         */
        _extractParameters : function(route, fragment) {
            return route.exec(fragment).slice(1);
        }
    });

    // Backbone.History ·��������
    // ----------------

    // History���ṩ·�ɹ�����ز���, ��������URL�ı仯, (ͨ��popstate��onhashchange�¼����м���, ���ڲ�֧���¼��������ͨ��setInterval�������)
    // �ṩ·�ɹ����뵱ǰURL��ƥ����֤, �ʹ�����صļ����¼�
    // Historyһ�㲻�ᱻֱ�ӵ���, �ڵ�һ��ʵ����Router����ʱ, ���Զ�����һ��History�ĵ���(ͨ��Backbone.history����)
    var History = Backbone.History = function() {
        // handlers���Լ�¼�˵�ǰ����·�ɶ������Ѿ����õĹ���ͼ����б�
        // ��ʽ��: [{route: route, callback: callback}], route��¼��������ʽ����, callback��¼��ƥ�����ʱ�ļ����¼�
        // ��history���������URL�����仯ʱ, ���Զ���handlers�ж���Ĺ������ƥ��, �����ü����¼�
        this.handlers = [];
        // ��checkUrl�����������Ķ���󶨵�history����, ��ΪcheckUrl��������Ϊpopstate��onhashchange�¼���setInterval�Ļص�����, ��ִ�лص�ʱ, �����Ķ���ᱻ�ı�
        // checkUrl���������ڼ�����URL�����仯ʱ��鲢����loadUrl����
        _.bindAll(this, 'checkUrl');
    };
    // ��������ƥ��URLƬ�������ַ��Ƿ�Ϊ"#"��"/"������
    var routeStripper = /^[#\/]/;

    // ��������ƥ���userAgent�л�ȡ���ַ����Ƿ����IE������ı�ʶ, �����жϵ�ǰ������Ƿ�ΪIE
    var isExplorer = /msie [\w.]+/;

    // ��¼��ǰhistory���������Ƿ��Ѿ�����ʼ����(����start����)
    History.started = false;

    // ��History���ԭ�Ͷ�������ӷ���, ��Щ��������ͨ��History��ʵ������(��Backbone.history����)
    _.extend(History.prototype, Events, {

        // ���û�ʹ�õͰ汾��IE�����(��֧��onhashchange�¼�)ʱ, ͨ����������·��״̬�ı仯
        // interval������������Ƶ��(����), ��Ƶ�����̫�Ϳ��ܻᵼ���ӳ�, ���̫�߿��ܻ�����CPU��Դ(��Ҫ�����û�ʹ�õͶ������ʱ���豸����)
        interval : 50,

        // ��ȡlocation��Hash�ַ���(ê��#���Ƭ��)
        getHash : function(windowOverride) {
            // ���������һ��window����, ��Ӹö����л�ȡ, ����Ĭ�ϴӵ�ǰwindow�����л�ȡ
            var loc = windowOverride ? windowOverride.location : window.location;
            // ��ê��(#)����ַ�����ȡ����������
            var match = loc.href.match(/#(.*)$/);
            // ���û���ҵ�ƥ�������, �򷵻ؿ��ַ���
            return match ? match[1] : '';
        },
        // ���ݵ�ǰ���õ�·�ɷ�ʽ, �������ص�ǰURL�е�·��Ƭ��
        getFragment : function(fragment, forcePushState) {
            // fragment��ͨ��getHash���URL���Ѿ���ȡ�Ĵ�����·��Ƭ��(�� #/id/1288)
            if(fragment == null) {// ���û�д���fragment, ����ݵ�ǰ·�ɷ�ʽ������ȡ
                if(this._hasPushState || forcePushState) {
                    // ʹ����pushState��ʽ����·��
                    // fragment��¼��ǰ�������URL·��
                    fragment = window.location.pathname;
                    // search��¼��ǰҳ���Ĳ�������
                    var search = window.location.search;
                    // ��·���Ͳ����ϲ���һ��, ��Ϊ�������·��Ƭ��
                    if(search)
                        fragment += search;
                } else {
                    // ʹ����hash��ʽ����·��
                    // ͨ��getHash������ȡ��ǰê��(#)����ַ�����Ϊ·��Ƭ��
                    fragment = this.getHash();
                }
            }
            // ���������������õ�root����, ���·��Ƭ��ȡ��root·��֮�������
            if(!fragment.indexOf(this.options.root))
                fragment = fragment.substr(this.options.root.length);
            // ���URLƬ������ĸΪ"#"��"/", ��ȥ�����ַ�
            // ���ش���֮���URLƬ��
            return fragment.replace(routeStripper, '');
        },
        // ��ʼ��Historyʵ��, �÷���ֻ�ᱻ����һ��, Ӧ���ڴ�������ʼ��Router����֮���Զ�����
        // �÷�����Ϊ����·�ɵĵ�����, ������Բ�ͬ���������URLƬ�εı仯, ������֤��֪ͨ����������
        start : function(options) {
            // ���history�����Ѿ�����ʼ����, ���׳�����
            if(History.started)
                throw new Error("Backbone.history has already been started");
            // ����history����ĳ�ʼ��״̬
            History.started = true;

            // ����������, ʹ�õ���start����ʱ���ݵ�options�������Ĭ������
            this.options = _.extend({}, {
                // root��������URL�����е�·�ɸ�Ŀ¼
                // ���ʹ��pushState��ʽ����·��, ��rootĿ¼֮��ĵ�ַ����ݲ�ͬ��·�ɲ�����ͬ�ĵ�ַ(����ܻᶨλ����ͬ��ҳ��, �����Ҫȷ��������֧��)
                // ���ʹ��Hashê��ķ�ʽ����·��, ��root��ʾURL��ê��(#)��λ��
                root : '/'
            }, this.options, options);
            /**
             * history��Բ�ͬ���������, ʵ����3�ַ�ʽ�ļ���:
             * - ����֧��HTML5��popstate�¼��������, ͨ��popstate�¼����м���
             * - ���ڲ�֧��popstate�������, ʹ��onhashchange�¼����м���(ͨ���ı�hash(ê��)���õ�URL�ڱ�����ʱ�ᴥ��onhashchange�¼�)
             * - ���ڲ�֧��popstate��onhashchange�¼��������, ͨ��������������
             *
             * ����HTML5��popstate�¼�����ط���:
             * - pushState���Խ�ָ����URL���һ���µ�historyʵ�嵽�������ʷ��
             * - replaceState�������Խ���ǰ��historyʵ���滻Ϊָ����URL
             * ʹ��pushState��replaceState����ʱ���滻��ǰURL, ������������ת�����URL(��ʹ�ú��˻�ǰ����ťʱ, Ҳ������ת����URL)
             * (�������������Խ����AJAX��ҳӦ���������ǰ��, ���˲���������)
             * ��ʹ��pushState��replaceState�����滻��URL, �ڱ�����ʱ�ᴥ��onpopstate�¼�
             * �����֧�����:
             * Chrome 5, Firefox 4.0, IE 10, Opera 11.5, Safari 5.0
             *
             * ע��:
             * - history.start����Ĭ��ʹ��Hash��ʽ���е���
             * - �����Ҫ����pushState��ʽ���е���, ��Ҫ�ڵ���start����ʱ, �ֶ���������options.pushState
             *   (����ǰ��ȷ�������֧��pushState����, ����Ĭ��ת��ΪHash��ʽ)
             * - ��ʹ��pushState��ʽ���е���ʱ, URL���ܻ��options.rootָ���ĸ�Ŀ¼�����仯, ����ܻᵼ������ͬҳ��, �����ȷ���������Ѿ�֧��pushState��ʽ�ĵ���
             */
            // _wantsHashChange���Լ�¼�Ƿ�ϣ��ʹ��hash(ê��)�ķ�ʽ����¼�͵���·����
            // ������options���������ֶ�����hashChangeΪfalse, ����Ĭ�Ͻ�ʹ��hashê��ķ�ʽ
            // (����ֶ�������options.pushStateΪtrue, �������֧��pushState����, ���ʹ��pushState��ʽ)
            this._wantsHashChange = this.options.hashChange !== false;
            // _wantsPushState���Լ�¼�Ƿ�ϣ��ʹ��pushState��ʽ����¼�͵���·����
            // pushState��HTML5��Ϊwindow.history��ӵ�������, ���û���ֶ�����options.pushStateΪtrue, ��Ĭ�Ͻ�ʹ��hash��ʽ
            this._wantsPushState = !!this.options.pushState;
            // _hasPushState���Լ�¼������Ƿ�֧��pushState����
            // �����options��������pushState(��ϣ��ʹ��pushState��ʽ), ����������Ƿ�֧�ָ�����
            this._hasPushState = !!(this.options.pushState && window.history && window.history.pushState);
            // ��ȡ��ǰURL�е�·���ַ���
            var fragment = this.getFragment();
            // documentMode��IE������Ķ�������, ���ڱ�ʶ��ǰ�����ʹ�õ���Ⱦģʽ
            var docMode = document.documentMode;
            // oldIE���ڼ�鵱ǰ������Ƿ�Ϊ�Ͱ汾��IE�����(��IE 7.0���°汾)
            // ����������Ϊ: ��ǰ�����ΪIE, ����֧��documentMode����, ��documentMode���Է��ص���ȾģʽΪIE7.0����
            var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

            if(oldIE) {
                // ����û�ʹ�õͰ汾��IE�����, ��֧��popstate��onhashchange�¼�
                // ��DOM�в���һ�����ص�iframe, ��ͨ���ı������������iframe��URLʵ��·��
                this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
                // ͨ��navigate��iframe���õ���ǰ��URLƬ��, �Ⲣ�����������ص�һ��ҳ��, ��Ϊfragment����һ��������URL
                this.navigate(fragment);
            }

            // ��ʼ����·��״̬�仯
            if(this._hasPushState) {
                // ���ʹ����pushState��ʽ·��, �������֧�ָ�����, ��popstate�¼�������checkUrl����
                $(window).bind('popstate', this.checkUrl);
            } else if(this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
                // ���ʹ��Hash��ʽ����·��, �������֧��onhashchange�¼�, ��hashchange�¼�������checkUrl����
                $(window).bind('hashchange', this.checkUrl);
            } else if(this._wantsHashChange) {
                // ���ڵͰ汾�������, ͨ��setInterval������������checkUrl����, interval���Ա�ʶ����Ƶ��
                this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
            }

            // ��¼��ǰ��URLƬ��
            this.fragment = fragment;
            // ��֤��ǰ�Ƿ��ڸ�·��(��options.root�������õ�·��)
            var loc = window.location;
            var atRoot = loc.pathname == this.options.root;

            // ����û�ͨ��pushState��ʽ��URL���ʵ���ǰ��ַ, ���û���ʱ��ʹ�õ����������֧��pushState����
            // (�������ĳ���û�ͨ��pushState��ʽ���ʸ�Ӧ��, Ȼ�󽫵�ַ����������û�, �������û������������֧�ָ�����)
            if(this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
                // ��ȡ��ǰpushState��ʽ�е�URLƬ��, ��ͨ��Hash��ʽ���´�ҳ��
                this.fragment = this.getFragment(null, true);
                // ����hashState��ʽ��URLΪ /root/topic/12001, ���´򿪵�Hash��ʽ��URL��Ϊ /root#topic/12001
                window.location.replace(this.options.root + '#' + this.fragment);
                return true;

                // ����û�ͨ��Hash��ʽ��URL���ʵ���ǰ��ַ, ������Backbone.history.start����ʱ������pushState(ϣ��ͨ��pushState��ʽ����·��)
                // ���û������֧��pushState����, �򽫵�ǰURL�滻ΪpushState��ʽ(ע��, ����ʹ��replaceState��ʽ�����滻URL, ��ҳ�治�ᱻˢ��)
                // ���·�֧���������Ϊ: �������ϣ��ʹ��pushState��ʽ����·��, �������֧�ָ�����, ͬʱ�û���ʹ����Hash��ʽ�򿪵�ǰҳ��
                // (�������ĳ���û�ʹ��Hash��ʽ�����һ��URL, ����URL�������һ�������֧��pushState���Ե��û�, �����û�����ʱ��ִ�д˷�֧)
            } else if(this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
                // ��ȡURL�е�HashƬ��, ������ַ����׸�"#"��"/"
                this.fragment = this.getHash().replace(routeStripper, '');
                // ʹ��replaceState��������ǰ�������URL�滻ΪpushState֧�ֵķ�ʽ, ��: Э��//������ַ/URL·��/Hash����, ����:
                // ���û�����Hash��ʽ��URLΪ /root/#topic/12001, �����滻Ϊ /root/topic/12001
                // ע:
                // pushState��replaceState�����Ĳ�����3��, �ֱ���state, title, url
                // -state: ���ڴ洢������޸ĵ�historyʵ����Ϣ
                // -title: �����������������(���ڱ�������, Ŀǰ�������û��ʵ�ָ�����)
                // -url: ����historyʵ���URL��ַ(�����Ǿ��Ի����·��, ���޷����ÿ���URL)
                window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
            }

            // һ�����start����ʱ���Զ�����loadUrl, ƥ�䵱ǰURLƬ�ζ�Ӧ��·�ɹ���, ���øù���ķ���
            // ���������silent����Ϊtrue, ��loadUrl�������ᱻ����
            // �������һ������ڵ�����stop��������history����״̬��, �ٴε���start��������(ʵ���ϴ�ʱ����Ϊҳ���ʼ��, ��˻�����silent����)
            if(!this.options.silent) {
                return this.loadUrl();
            }
        },
        // ֹͣhistory��·�ɵļ��, ����״̬�ָ�Ϊδ����״̬
        // ����stop����֮��, �����µ���start������ʼ����, stop����һ���û��ڵ���start����֮��, ��Ҫ��������start�����Ĳ���, �����ڵ�Ԫ����
        stop : function() {
            // ����������·�ɵ�onpopstate��onhashchange�¼��ļ���
            $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
            // ֹͣ���ڵͰ汾��IE��������������
            clearInterval(this._checkUrlInterval);
            // �ָ�started״̬, �����´����µ���start����
            History.started = false;
        },
        // ��handlers�а�һ��·�ɹ���(����route, ����Ϊ������ʽ)���¼�(����callback)��ӳ���ϵ(�÷�����Router��ʵ���Զ�����)
        route : function(route, callback) {
            // ��route��callback���뵽handlers�б�ĵ�һ��λ��
            // ����Ϊ��ȷ��������routeʱ����Ĺ������Ƚ���ƥ��
            this.handlers.unshift({
                // ·�ɹ���(����)
                route : route,
                // ƥ�����ʱִ�еķ���
                callback : callback
            });
        },
        // ��鵱ǰ��URL�����һ�ε�״̬�Ƿ����˱仯
        // ��������仯, ���¼�µ�URL״̬, ������loadUrl����������URL��ƥ��·�ɹ���ķ���
        // �÷�����onpopstate��onhashchange�¼����������Զ�����, �����ڵͰ汾��IE���������setInterval������ʱ����
        checkUrl : function(e) {
            // ��ȡ��ǰ��URLƬ��
            var current = this.getFragment();
            // �ԵͰ汾��IE�����, ����iframe�л�ȡ���µ�URLƬ�β�����current����
            if(current == this.fragment && this.iframe)
                current = this.getFragment(this.getHash(this.iframe));
            // �����ǰURL����һ�ε�״̬û�з����κα仯, ��ִֹͣ��
            if(current == this.fragment)
                return false;
            // ִ�е�����, URL�Ѿ������ı�, ����navigate������URL����Ϊ��ǰURL
            // �������Զ�����navigate����ʱ, ��û�д���options����, ��˲��ᴥ��navigate�����е�loadUrl����
            if(this.iframe)
                this.navigate(current);
            // ����loadUrl����, ���ƥ��Ĺ���, ��ִ�й���󶨵ķ���
            // �������this.loadUrl����û�гɹ�, ����ͼ�ڵ���loadUrl����ʱ, �����»�ȡ�ĵ�ǰHash���ݸ��÷���
            this.loadUrl() || this.loadUrl(this.getHash());
        },
        // ���ݵ�ǰURL, ��handler·���б��еĹ������ƥ��
        // ���URL����ĳһ������, ��ִ�������������Ӧ�ķ���, ����������true
        // ���û���ҵ����ʵĹ���, ������false
        // loadUrl����һ����ҳ���ʼ��ʱ����start�����ᱻ�Զ�����(����������silent����Ϊtrue)
        // - ���û��ı�URL��, ��checkUrl������URL�����仯ʱ������
        // - �򵱵���navigate�����ֶ�������ĳ��URLʱ������
        loadUrl : function(fragmentOverride) {
            // ��ȡ��ǰURLƬ��
            var fragment = this.fragment = this.getFragment(fragmentOverride);
            // ����Undersocre��any����, ��URLƬ����handlers�е����й������ν���ƥ��
            var matched = _.any(this.handlers, function(handler) {
                // ���handlers�еĹ����뵱ǰURLƬ��ƥ��, ��ִ�иù���Ӧ�ķ���, ������true
                if(handler.route.test(fragment)) {
                    handler.callback(fragment);
                    return true;
                }
            });
            // matched��any�����ķ���ֵ, ���ƥ�䵽�����򷵻�true, û��ƥ�䵽����false
            return matched;
        },
        // ������ָ����URL
        // �����options��������trigger, ������������URL���Ӧ·�ɹ�����¼�
        // �����options��������replace, ��ʹ����Ҫ������URL�滻��ǰ��URL��history�е�λ��
        navigate : function(fragment, options) {
            // ���û�е���start����, ���Ѿ�����stop����, ���޷�����
            if(!History.started)
                return false;
            // ���options��������һ������, ����trueֵ, ��Ĭ��trigger������Ϊtrue(������������URL���Ӧ·�ɹ�����¼�)
            if(!options || options === true)
                options = {
                    trigger : options
                };
            // �����ݵ�fragment(URLƬ��)ȥ�����ַ���"#"��"/"
            var frag = (fragment || '').replace(routeStripper, '');
            // �����ǰURL����Ҫ������URLû�б仯, �򲻼���ִ��
            if(this.fragment == frag)
                return;

            // �����ǰ֧�ֲ�ʹ����pushState��ʽ���е���
            if(this._hasPushState) {
                // ����һ��������URL, �����ǰURLƬ����û�а�����·��, ��ʹ�ø�·������URLƬ��
                if(frag.indexOf(this.options.root) != 0)
                    frag = this.options.root + frag;
                // �����µ�URL
                this.fragment = frag;
                // �����optionsѡ����������replace����, ���µ�URL�滻��history�еĵ�ǰURL, ����Ĭ�Ͻ��µ�URL׷�ӵ�history��
                window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

                // ���ʹ��hash��ʽ���е���
            } else if(this._wantsHashChange) {
                // �����µ�hash
                this.fragment = frag;
                // ����_updateHash�������µ�ǰURLΪ�µ�hash, ����options�е�replace���ô��ݸ�_updateHash����(�ڸ÷�����ʵ���滻��׷���µ�hash)
                this._updateHash(window.location, frag, options.replace);
                // ���ڵͰ汾��IE�����, ��Hash�����仯ʱ, ����iframe URL�е�Hash
                if(this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
                    // ���ʹ����replace�����滻��ǰURL, ��ֱ�ӽ�iframe�滻Ϊ�µ��ĵ�
                    // ����document.open��һ���µ��ĵ�, �Բ�����ǰ�ĵ��е�����(�������close������Ϊ�˹ر��ĵ���״̬)
                    // open��close����֮��û��ʹ��write��writeln�����������, �������һ�����ĵ�
                    if(!options.replace)
                        this.iframe.document.open().close();
                    // ����_updateHash��������iframe�е�URL
                    this._updateHash(this.iframe.location, frag, options.replace);
                }

            } else {
                // ����ڵ���start����ʱ, �ֶ�����hashChange����Ϊtrue, ��ϣ��ʹ��pushState��hash��ʽ����
                // ��ֱ�ӽ�ҳ����ת���µ�URL
                window.location.assign(this.options.root + fragment);
            }
            // �����options��������������trigger����, �����loadUrl��������·�ɹ���, ��ִ�й����Ӧ���¼�
            // ��URL�����仯ʱ, ͨ��checkUrl������������״̬, ����checkUrl�������Զ�����loadUrl����
            // ���ֶ�����navigate����ʱ, �����Ҫ����·���¼�, ����Ҫ����trigger����
            if(options.trigger)
                this.loadUrl(fragment);
        },
        // ���»����õ�ǰURL�е�Has��, _updateHash������ʹ��hash��ʽ����ʱ���Զ�����(navigate������)
        // location����Ҫ����hash��window.location����
        // fragment����Ҫ���µ�hash��
        // �����Ҫ���µ�hash�滻����ǰURL, ��������replaceΪtrue
        _updateHash : function(location, fragment, replace) {
            // ���������replaceΪtrue, ��ʹ��location.replace�����滻��ǰ��URL
            // ʹ��replace�����滻URL��, �µ�URL��ռ��ԭ��URL��history��ʷ�е�λ��
            if(replace) {
                // ����ǰURL��hash���Ϊһ��������URL���滻
                location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
            } else {
                // û��ʹ���滻��ʽ, ֱ������location.hashΪ�µ�hash��
                location.hash = fragment;
            }
        }
    });

    // Backbone.View ��ͼ���
    // -------------

    // ��ͼ�����ڴ��������ݵ���ϵĽ�����ƶ���, ͨ������ͼ����Ⱦ�����󶨵�����ģ�͵�change�¼�, �����ݷ����仯ʱ��֪ͨ��ͼ������Ⱦ
    // ��ͼ�����е�el���ڴ洢��ǰ��ͼ����Ҫ������DOM���Ԫ��, ����Ҫ��Ϊ�����Ԫ�صĲ��ҺͲ���Ч��, ���ŵ����:
    // - ���һ����Ԫ��ʱ, �������ķ�Χ�޶���elԪ����, ����Ҫ�������ĵ���������
    // - ��ΪԪ�ذ��¼�ʱ, ���Է���ؽ��¼��󶨵�elԪ��(Ĭ��Ҳ��󶨵�elԪ��)����������Ԫ��
    // - �����ģʽ��, ��һ����ͼ��ص�Ԫ��, �¼�, ���߼��޶��ڸ���ͼ�ķ�Χ��, ������ͼ����ͼ������(�������߼���������)
    var View = Backbone.View = function(options) {
        // Ϊÿһ����ͼ���󴴽�һ��Ψһ��ʶ, ǰ׺Ϊ"view"
        this.cid = _.uniqueId('view');
        // ���ó�ʼ������
        this._configure(options || {});
        // ���û򴴽���ͼ�е�Ԫ��
        this._ensureElement();
        // �����Զ���ĳ�ʼ������
        this.initialize.apply(this, arguments);
        // ����options�����õ�events�¼��б�, �����¼��󶨵���ͼ�е�Ԫ��
        this.delegateEvents();
    };
    // �������ڽ���events�������¼����ƺ�Ԫ�ص�����
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    // viewOptions�б��¼һЩ��������, �ڹ�����ͼ����ʱ, ������ݵ��������а�����Щ����, �����Ը��Ƶ�������
    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

    // ����ͼ���ԭ�Ͷ��������һЩ����
    _.extend(View.prototype, Events, {

        // ����ڴ�����ͼ����ʱ, û������ָ����elԪ��, ���ͨ��make��������һ��Ԫ��, tagNameΪ����Ԫ�ص�Ĭ�ϱ�ǩ
        // Ҳ����ͨ����options���Զ���tagName������Ĭ�ϵ�"div"��ǩ
        tagName : 'div',

        // ÿ����ͼ�ж�����һ��$ѡ��������, �÷�����jQuery��Zepto����, ͨ������һ�����ʽ����ȡԪ��
        // ���÷���ֻ������ͼ�����$elԪ�ط�Χ�ڽ��в���, ��˻����ƥ��Ч��
        $ : function(selector) {
            return this.$el.find(selector);
        },
        // ��ʼ������, �ڶ���ʵ�������Զ�����
        initialize : function() {
        },
        // render������initialize��������, Ĭ��û��ʵ���κ��߼�
        // һ������ظ÷���, ��ʵ�ֶ���ͼ��Ԫ�ص���Ⱦ
        render : function() {
            // ���ص�ǰ��ͼ����, ��֧�ַ�������ʽ����
            // �����������˸÷���, �����ڷ������Ҳ������ͼ����(this)
            return this;
        },
        // �Ƴ���ǰ��ͼ��$elԪ��
        remove : function() {
            // ͨ������jQuery��Zepto��remove����, ����ڵ��������л�ͬʱ�Ƴ���Ԫ�ذ󶨵������¼�������
            this.$el.remove();
            return this;
        },
        // ���ݴ���ı�ǩ����, ���Ժ�����, ����������һ��DOMԪ��
        // �÷����������ڲ�����this.elʱ�Զ�����
        make : function(tagName, attributes, content) {
            // ����tagName����Ԫ��
            var el = document.createElement(tagName);
            // ����Ԫ������
            if(attributes)
                $(el).attr(attributes);
            // ����Ԫ������
            if(content)
                $(el).html(content);
            // ����Ԫ��
            return el;
        },
        // Ϊ��ͼ�������ñ�׼��$el��el����, �÷����ڶ��󴴽�ʱ���Զ�����
        // $el��ͨ��jQuery��Zepto�����Ķ���, el�Ǳ�׼��DOM����
        setElement : function(element, delegate) {
            // ����Ѿ�������$el����(�������ֶ�������setElement�����л���ͼ��Ԫ��), ��ȡ��֮ǰ��$el�󶨵�events�¼�(��ϸ�ο�undelegateEvents����)
            if(this.$el)
                this.undelegateEvents();
            // ��Ԫ�ش���ΪjQuery��Zepto����, �������$el������
            this.$el = ( element instanceof $) ? element : $(element);
            // this.el��ű�׼��DOM����
            this.el = this.$el[0];
            // ���������delegate����, ��ΪԪ�ذ���ͼ��events�������õ��¼�
            // ����ͼ��Ĺ��캯����, �Ѿ�������delegateEvents�������а�, ����ڳ�ʼ����_ensureElement�����е���setElement����ʱû�д���delegate����
            // ���ֶ�����setElemen����������ͼԪ��ʱ, ������delegate���¼�
            if(delegate !== false)
                this.delegateEvents();
            return this;
        },
        // Ϊ��ͼԪ�ذ��¼�
        // events������������Ҫ���¼��ļ���, ��ʽ��('�¼����� Ԫ��ѡ����ʽ' : '�¼���������/���¼�����'):
        // {
        //     'click #title': 'edit',
        //     'click .save': 'save'
        //     'click span': function() {}
        // }
        // �÷�������ͼ�����ʼ��ʱ�ᱻ�Զ�����, ���������е�events������Ϊevents����(�¼�����)
        delegateEvents : function(events) {
            // ���û���ֶ�����events����, �����ͼ�����ȡevents������Ϊ�¼�����
            if(!(events || ( events = getValue(this, 'events'))))
                return;
            // ȡ����ǰ�Ѿ��󶨹���events�¼�
            this.undelegateEvents();
            // ������Ҫ�󶨵��¼��б�
            for(var key in events) {
                // ��ȡ��Ҫ�󶨵ķ���(�����Ƿ������ƻ���)
                var method = events[key];
                // ����Ƿ�������, ��Ӷ����л�ȡ�ú�������, ��˸÷������Ʊ�������ͼ�������Ѷ���ķ���
                if(!_.isFunction(method))
                    method = this[events[key]];
                // ����Ч�ķ����׳�һ������
                if(!method)
                    throw new Error('Method "' + events[key] + '" does not exist');
                // �����¼����ʽ(key), �ӱ��ʽ�н������¼������ֺ���Ҫ������Ԫ��
                // ���� 'click #title'��������Ϊ 'click' �� '#title' ������, �������match������
                var match = key.match(delegateEventSplitter);
                // eventNameΪ��������¼�����
                // selectorΪ��������¼�Ԫ��ѡ�������ʽ
                var eventName = match[1], selector = match[2];
                // bind������Underscore�����ڰ󶨺��������ĵķ���
                // ���ｫmethod�¼������������İ󶨵���ǰ��ͼ����, ������¼���������, �¼������е�thisʼ��ָ����ͼ������
                method = _.bind(method, this);
                // �����¼�����, ���¼����ƺ�׷�ӱ�ʶ, ���ڴ��ݸ�jQuery��Zepto���¼��󶨷���
                eventName += '.delegateEvents' + this.cid;
                // ͨ��jQuery��Zepto���¼�
                if(selector === '') {
                    // ���û��������Ԫ��ѡ����, ��ͨ��bind�������¼��ͷ����󶨵���ǰ$elԪ�ر���
                    this.$el.bind(eventName, method);
                } else {
                    // �����ǰ��������Ԫ��ѡ�������ʽ, ��ͨ��delegate��ʽ��
                    // �÷��������ҵ�ǰ$elԪ���µ���Ԫ��, ������selector���ʽƥ���Ԫ�ؽ����¼���
                    // �����ѡ������Ԫ�ز����ڵ�ǰ$el����Ԫ��, ���¼�����Ч
                    this.$el.delegate(selector, eventName, method);
                }
            }
        },
        // ȡ����ͼ�е�ǰԪ�ذ󶨵�events�¼�, �÷���һ�㲻�ᱻʹ��
        // ���ǵ���delegateEvents��������Ϊ��ͼ�е�Ԫ�ذ��¼�, �����°�֮ǰ�������ǰ���¼�
        // ��ͨ��setElement��������������ͼ��elԪ��, Ҳ�������ǰԪ�ص��¼�
        undelegateEvents : function() {
            this.$el.unbind('.delegateEvents' + this.cid);
        },
        // ��ʵ������ͼ����ʱ���ó�ʼ����
        // �����ݵ����ø��ǵ������options��
        // ����������viewOptions�б���ͬ�����ø��Ƶ�������, ��Ϊ���������
        _configure : function(options) {
            // ���������������Ĭ������, ��ʹ�ô��ݵ����ý��кϲ�
            if(this.options)
                options = _.extend({}, this.options, options);
            // ����viewOptions�б�
            for(var i = 0, l = viewOptions.length; i < l; i++) {
                // attr����ΪviewOptions�е�������
                var attr = viewOptions[i];
                // ��options��������viewOptions��ͬ�����ø��Ƶ�������, ��Ϊ���������
                if(options[attr])
                    this[attr] = options[attr];
            }
            // ���ö����options����
            this.options = options;
        },
        // ÿһ����ͼ����Ӧ����һ��elԪ��, ��Ϊ��Ⱦ��Ԫ��
        // �ڹ�����ͼʱ, �������ö����el������ָ��һ��Ԫ��
        // ������õ�el��һ���ַ�����DOM����, ��ͨ��$�������䴴��Ϊһ��jQuery��Zepto����
        // ���û������el����, ����ݴ��ݵ�tagName, id��className, ����mak��������һ��Ԫ��
        // (�´�����Ԫ�ز��ᱻ��ӵ��ĵ�����, ��ʼ�մ洢���ڴ�, �����������Ҫ��Ⱦ��ҳ��ʱ, һ�������д��render����, ���Զ��巽����, ����this.el����׷�ӵ��ĵ�)
        // (���������Ҫ��ҳ�����һ��Ŀǰ��û�е�Ԫ��, ������ҪΪ�����һЩ��Ԫ��, ����, ��ʽ���¼�ʱ, ����ͨ���÷�ʽ�Ƚ�Ԫ�ش������ڴ�, ��������в���֮�����ֶ���Ⱦ���ĵ�, ���������ȾЧ��)
        _ensureElement : function() {
            // ���û������el����, �򴴽�Ĭ��Ԫ��
            if(!this.el) {
                // �Ӷ����ȡattributes����, ��Ϊ�´���Ԫ�ص�Ĭ�������б�
                var attrs = getValue(this, 'attributes') || {};
                // ������Ԫ�ص�id
                if(this.id)
                    attrs.id = this.id;
                // ������Ԫ�ص�class
                if(this.className)
                    attrs['class'] = this.className;
                // ͨ��make��������Ԫ��, ������setElement������Ԫ������Ϊ��ͼ��ʹ�õı�׼Ԫ��
                this.setElement(this.make(this.tagName, attrs), false);
            } else {
                // ���������el����, ��ֱ�ӵ���setElement������elԪ������Ϊ��ͼ�ı�׼Ԫ��
                this.setElement(this.el, false);
            }
        }
    });

    // ʵ�ֶ���̳еĺ���, �ú����ڲ�ʹ��inheritsʵ�ּ̳�, ��ο�inherits����
    var extend = function(protoProps, classProps) {
        // child�洢�Ѿ�ʵ�ּ̳��Ե�ǰ�������(Function)
        // protoProps��������ԭ�����е�����
        // classProps��������ľ�̬����
        var child = inherits(this, protoProps, classProps);
        // ��extend������ӵ�����, ��˵��������extend�������ʵ�ֶ�����ļ̳�
        child.extend = this.extend;
        // ����ʵ�ּ̳е�����
        return child;
    };
    // ΪModel, Collection, Router��View��ʵ�ּ̳л���
    Model.extend = Collection.extend = Router.extend = View.extend = extend;

    // Backbone.sync ��������첽�������
    // -------------

    // ����Backbone�����������������������type�Ķ�Ӧ��ϵ
    var methodMap = {
        'create' : 'POST',
        'update' : 'PUT',
        'delete' : 'DELETE',
        'read' : 'GET'
    };

    // sync������Backbone�в�������ʱ, ���������������ͬ������״̬, �Խ����������֮����޷�����
    // sync����Ĭ��ͨ����������(jQuery, Zepto��) $.ajax������������, ������Ҫ����״̬ͬ����صķ���, ��Ҫ��������֧��
    // BackboneĬ�϶�����һ������������������ݸ�ʽ(JSON)�ͽṹ, ��������Ӧ������Ӧ����ѭ��Լ��
    // ������ݲ���Ҫ�����ڷ�����, �����������������, ���ݸ�ʽ�ṹ��Լ����һ��, ����ͨ������sync����ʵ��
    // @param {String} method ��Backbone��ִ�е�CRUD��������
    // @param {Model Obejct} model ��Ҫ�������ͬ��״̬��ģ�Ͷ���
    // @param {Object} options
    Backbone.sync = function(method, model, options) {
        // ����CRUD����������������������ķ���(POST, GET, PUT, DELETE)
        var type = methodMap[method];

        // optionsĬ��Ϊһ���ն���
        options || ( options = {});

        // params����Ϊ����������󴫵ݸ����������$.ajax����
        var params = {
            // ��������
            type : type,
            // ���ݸ�ʽĬ��Ϊjson
            dataType : 'json'
        };

        // ����ڷ�������ʱû����options������url��ַ, ����ͨ��ģ�Ͷ����url���Ի򷽷�����ȡurl
        // ģ������ȡurl�ķ�ʽ�ɲο�ģ�͵�url����
        if(!options.url) {
            // ��ȡ�����ַʧ��ʱ�����urlError�����׳�һ������
            params.url = getValue(model, 'url') || urlError();
        }

        // �������create��update����, ��û����options�ж�����������, �����л�ģ���е����ݶ��󴫵ݸ�������
        if(!options.data && model && (method == 'create' || method == 'update')) {
            // ���������Content-Typeͷ, Ĭ��Ϊapplication/json
            params.contentType = 'application/json';
            // ���л�ģ���е�����, ����Ϊ�������ݴ��ݸ�������
            params.data = JSON.stringify(model.toJSON());
        }

        // ���ڲ�֧��application/json����������, ����ͨ������Backbone.emulateJSON����Ϊtrueʵ�ּ���
        if(Backbone.emulateJSON) {
            // ��֧��Backbone.emulateJSON����������, ����������Ϊapplication/x-www-form-urlencoded
            params.contentType = 'application/x-www-form-urlencoded';
            // ����Ҫͬ�������ݴ����keyΪ"model"�����з��͵�������
            params.data = params.data ? {
                model : params.data
            } : {};
        }

        // ���ڲ�֧��REST��ʽ�������, ��������Backbone.emulateHTTP����Ϊtrue, ��POST��ʽ��������, ���������м���_method������ʶ��������
        // ͬʱҲ������X-HTTP-Method-Overrideͷ��Ϣ
        if(Backbone.emulateHTTP) {
            // �����������ΪPUT��DELETE
            if(type === 'PUT' || type === 'DELETE') {
                // ���������ƴ�ŵ�_method�������͵�������
                if(Backbone.emulateJSON)
                    params.data._method = type;
                // ʵ����POST��ʽ�����ύ, ������X-HTTP-Method-Overrideͷ��Ϣ
                params.type = 'POST';
                params.beforeSend = function(xhr) {
                    xhr.setRequestHeader('X-HTTP-Method-Override', type);
                };
            }
        }

        // �Է�GET��ʽ������, ���������ݽ���ת��, ��Ϊ���ݵ����ݿ�����һ��JSONӳ��
        if(params.type !== 'GET' && !Backbone.emulateJSON) {
            // ͨ������processDataΪfalse���ر�����ת��
            // processData������$.ajax�����е����ò���, ��ϸ��Ϣ�ɲο�jQuery��Zepto����ĵ�
            params.processData = false;
        }

        // ͨ�����������$.ajax�������������������ͬ������״̬
        // ���ݸ�$.ajax�����Ĳ���ʹ��extend������options�����еĲ������ǵ���params����, ����ڵ���sync����ʱ��������paramsͬ����options����, ����optionsΪ׼
        return $.ajax(_.extend(params, options));
    };
    // ��װһ��ͳһ��ģ�ʹ�������, ����ģ���������������������ʱ������
    // onError���ڵ�����������Ľ�������ʱ(��fetch, destory��), options��ָ�����Զ����������
    // originalModel�Ƿ��������ģ�ͻ򼯺϶���
    Backbone.wrapError = function(onError, originalModel, options) {
        return function(model, resp) {
            resp = model === originalModel ? resp : model;

            if(onError) {
                // ����������Զ����������, ������Զ��巽��
                onError(originalModel, resp, options);
            } else {
                // Ĭ�Ͻ��������������ģ�ͻ򼯺ϵ�error�¼�
                originalModel.trigger('error', originalModel, resp, options);
            }
        };
    };
    // Helpers ����һЩ��Backbone�ڲ�ʹ�õİ�������
    // -------

    // ctor��һ������Ŀպ���, �����ڵ���inherits����ʵ�ּ̳�ʱ, ���ظ����ԭ�����Ա����õ�����ԭ����
    var ctor = function() {
    };
    // ʵ��OOP�̳�����
    // @param {Function} parent ���̳еĸ���Function
    // @param {Object} protoProps ��չ����ԭ���е�����(�򷽷�)����
    // @param {Object} staticProps ��չ����ľ�̬����(�򷽷�)����
    var inherits = function(parent, protoProps, staticProps) {
        var child;

        // �����protoProps��ָ����"constructor"����, ��"constructor"���Ա���Ϊ����Ĺ��캯��
        // ���û��ָ���������๹�캯��, ��Ĭ�ϵ��ø���Ĺ��캯��
        if(protoProps && protoProps.hasOwnProperty('constructor')) {
            // ʹ��"constructor"����ָ�������๹�캯��
            child = protoProps.constructor;
        } else {
            // ʹ�ø���Ĺ��캯��
            child = function() {
                parent.apply(this, arguments);
            };
        }

        // �������еľ�̬���Ը���Ϊ���ྲ̬����
        _.extend(child, parent);

        // ������ԭ�������õ������ԭ�Ͷ�����, �����Դ˼̳и���ԭ�����е���������
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // ��protoProps�����е����Ը��Ƶ������ԭ�Ͷ���, �����Դ�ӵ��protoProps�е�����
        if(protoProps)
            _.extend(child.prototype, protoProps);

        // ��staticProps�����е����Ը��Ƶ�����Ĺ��캯������, ��staticProps�е�������Ϊ����ľ�̬����
        if(staticProps)
            _.extend(child, staticProps);

        // �ڸ��Ƹ���ԭ����������ԭ��ʱ, ����ԭ�����еĹ��캯���Ѿ�������, ��˴˴�������������Ĺ��캯��
        child.prototype.constructor = child;

        // �������������constructor����, �����๹�캯��Ϊconstructorָ���ĺ���
        // �����Ҫ�����๹�캯���е��ø��๹�캯��, ����Ҫ�����๹�캯�����ֶ����ø���Ĺ��캯��
        // �˴��������__super__����ָ����Ĺ��캯��, �����������е���: ����.__super__.constructor.call(this);
        child.__super__ = parent.prototype;

        // ��������
        return child;
    };
    // ��ȡ����prop���Ե�ֵ, ���prop������һ������, ��ִ�в����ظú����ķ���ֵ
    var getValue = function(object, prop) {
        // ���objectΪ�ջ�object������prop����, �򷵻�null
        if(!(object && object[prop]))
            return null;
        // ����prop����ֵ, ���prop��һ������, ��ִ�в����ظú����ķ���ֵ
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };
    // �׳�һ��Error�쳣, ��Backbone�ڲ���Ƶ��ִ��, ��˶���Ϊһ����������
    var urlError = function() {
        throw new Error('A "url" property or function must be specified');
    };
}).call(this);
