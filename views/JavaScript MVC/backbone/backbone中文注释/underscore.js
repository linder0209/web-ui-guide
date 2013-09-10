// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function() {

    // ����һ��ȫ�ֶ���, ��������б�ʾΪwindow����, ��Node.js�б�ʾglobal����
    var root = this;

    // ����"_"(�»��߱���)������֮ǰ��ֵ
    // �������������ͻ���ǵ��淶, ��ͨ��_.noConflict()�����ָ�"_"��Underscoreռ��֮ǰ��ֵ, ������Underscore�����Ա���������
    var previousUnderscore = root._;

    // ����һ���յĶ�����, �����ڲ�����ʹ��
    var breaker = {};

    // �����ö����ԭ���������ھֲ�����, ������ٵ���
    var ArrayProto = Array.prototype, //
    ObjProto = Object.prototype, //
    FuncProto = Function.prototype;

    // �����ö���ԭ���еĳ��÷��������ھֲ�����, ������ٵ���
    var slice = ArrayProto.slice, //
    unshift = ArrayProto.unshift, //
    toString = ObjProto.toString, //
    hasOwnProperty = ObjProto.hasOwnProperty;

    // ���ﶨ����һЩJavaScript 1.6�ṩ���·���
    // �������������֧����Щ���������ȵ���, �������������û���ṩ, �����Underscoreʵ��
    var nativeForEach = ArrayProto.forEach, //
    nativeMap = ArrayProto.map, //
    nativeReduce = ArrayProto.reduce, //
    nativeReduceRight = ArrayProto.reduceRight, //
    nativeFilter = ArrayProto.filter, //
    nativeEvery = ArrayProto.every, //
    nativeSome = ArrayProto.some, //
    nativeIndexOf = ArrayProto.indexOf, //
    nativeLastIndexOf = ArrayProto.lastIndexOf, //
    nativeIsArray = Array.isArray, //
    nativeKeys = Object.keys, //
    nativeBind = FuncProto.bind;

    // ��������ʽ�ĵ��÷�ʽ, ������һ��Underscore��װ��, ��װ�������ԭ���а���Underscore���з���(�����뽫DOM�����װΪһ��jQuery����)
    var _ = function(obj) {
        // ����Underscore�������ڲ���ͨ��wrapper������й���
        return new wrapper(obj);
    };
    // ��Բ�ͬ����������, ��Undersocre������������ŵ���ͬ�Ķ�����
    if( typeof exports !== 'undefined') {// Node.js����
        if( typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {// �����������Underscore����������������window������
        root['_'] = _;
    }

    // �汾����
    _.VERSION = '1.3.3';

    // ������صķ���(���ݺͶ����ͨ�ô�����)
    // --------------------

    // ����������, �Լ�����ÿһ��Ԫ��ִ�д���������
    var each = _.each = _.forEach = function(obj, iterator, context) {
        // �������ֵ
        if(obj == null)
            return;
        if(nativeForEach && obj.forEach === nativeForEach) {
            // �����������֧��, �����ȵ���JavaScript 1.6�ṩ��forEach����
            obj.forEach(iterator, context);
        } else if(obj.length === +obj.length) {
            // ��<����>��ÿһ��Ԫ��ִ�д���������
            for(var i = 0, l = obj.length; i < l; i++) {
                if( i in obj && iterator.call(context, obj[i], i, obj) === breaker)
                    return;
            }
        } else {
            // ��<����>��ÿһ��Ԫ��ִ�д���������
            for(var key in obj) {
                if(_.has(obj, key)) {
                    if(iterator.call(context, obj[key], key, obj) === breaker)
                        return;
                }
            }
        }
    };
    // ����������, ��each�����Ĳ�������map��洢ÿ�ε����ķ���ֵ, ����Ϊһ���µ����鷵��
    _.map = _.collect = function(obj, iterator, context) {
        // ���ڴ�ŷ���ֵ������
        var results = [];
        if(obj == null)
            return results;
        // ���ȵ������������ṩ��map����
        if(nativeMap && obj.map === nativeMap)
            return obj.map(iterator, context);
        // �����������е�Ԫ��
        each(obj, function(value, index, list) {
            // ��ÿ�ε�������ķ���ֵ�洢��results����
            results[results.length] = iterator.call(context, value, index, list);
        });
        // ���ش�����
        if(obj.length === +obj.length)
            results.length = obj.length;
        return results;
    };
    // ��������ÿ��Ԫ�ط������������, �������ε����ķ���ֵ��Ϊ"memo"���ݵ���һ�ε���, һ�������ۼƽ������������
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        // ͨ��������������Ƿ���ڳ�ʼֵ
        var initial = arguments.length > 2;
        if(obj == null)
            obj = [];
        // ���ȵ������������ṩ��reduce����
        if(nativeReduce && obj.reduce === nativeReduce && false) {
            if(context)
                iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        // �����������е�Ԫ��
        each(obj, function(value, index, list) {
            if(!initial) {
                // ���û�г�ʼֵ, �򽫵�һ��Ԫ����Ϊ��ʼֵ; �����������Ƕ��󼯺�, ��Ĭ��ֵΪ��һ�����Ե�ֵ
                memo = value;
                initial = true;
            } else {
                // ��¼������, ����������ݸ���һ�ε���
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if(!initial)
            throw new TypeError('Reduce of empty array with no initial value');
        return memo;
    };
    // ��reduce��������, ��������������е�Ԫ��(�������һ��Ԫ�ؿ�ʼֱ����һ��Ԫ��)
    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if(obj == null)
            obj = [];
        // ���ȵ������������ṩ��reduceRight����
        if(nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if(context)
                iterator = _.bind(iterator, context);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        // ��ת�����е�Ԫ��˳��
        var reversed = _.toArray(obj).reverse();
        if(context && !initial)
            iterator = _.bind(iterator, context);
        // ͨ��reduce������������
        return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
    };
    // ���������е�Ԫ��, ���ص�һ���ܹ�ͨ����������֤��Ԫ��
    _.find = _.detect = function(obj, iterator, context) {
        // result��ŵ�һ���ܹ�ͨ����֤��Ԫ��
        var result;
        // ͨ��any������������, ����¼ͨ����֤��Ԫ��
        // (������ڵ����м�鴦��������״̬, ����ʹ��each�����������)
        any(obj, function(value, index, list) {
            // ������������صĽ����ת��ΪBoolean���ͺ�ֵΪtrue, ��ǰ��¼�����ص�ǰԪ��
            if(iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };
    // ��find������������, ��filter�������¼�¼���������ͨ����֤��Ԫ��
    _.filter = _.select = function(obj, iterator, context) {
        // ���ڴ洢ͨ����֤��Ԫ������
        var results = [];
        if(obj == null)
            return results;
        // ���ȵ������������ṩ��filter����
        if(nativeFilter && obj.filter === nativeFilter)
            return obj.filter(iterator, context);
        // ���������е�Ԫ��, ����ͨ����������֤��Ԫ�طŵ������в�����
        each(obj, function(value, index, list) {
            if(iterator.call(context, value, index, list))
                results[results.length] = value;
        });
        return results;
    };
    // ��filter���������෴, ������û��ͨ����������֤��Ԫ���б�
    _.reject = function(obj, iterator, context) {
        var results = [];
        if(obj == null)
            return results;
        each(obj, function(value, index, list) {
            if(!iterator.call(context, value, index, list))
                results[results.length] = value;
        });
        return results;
    };
    // �������������Ԫ�ؾ���ͨ����������֤, �򷵻�true
    _.every = _.all = function(obj, iterator, context) {
        var result = true;
        if(obj == null)
            return result;
        // ���ȵ������������ṩ��every����
        if(nativeEvery && obj.every === nativeEvery)
            return obj.every(iterator, context);
        // ���������е�Ԫ��
        each(obj, function(value, index, list) {
            // �������Ϊ result = (result && iterator.call(context, value, index, list))
            // ��֤�������Ľ����ת��ΪBoolean���ͺ��Ƿ�Ϊtrueֵ
            if(!( result = result && iterator.call(context, value, index, list)))
                return breaker;
        });
        return !!result;
    };
    // ��鼯�����κ�һ��Ԫ���ڱ�ת��ΪBoolean����ʱ, �Ƿ�Ϊtrueֵ?����ͨ�������������, �Ƿ�ֵΪtrue?
    var any = _.some = _.any = function(obj, iterator, context) {
        // ���û��ָ������������, ��Ĭ�ϵĴ����������᷵��Ԫ�ر���, ���ڵ���ʱͨ����Ԫ��ת��ΪBoolean�������ж��Ƿ�Ϊtrueֵ
        iterator || ( iterator = _.identity);
        var result = false;
        if(obj == null)
            return result;
        // ���ȵ������������ṩ��some����
        if(nativeSome && obj.some === nativeSome)
            return obj.some(iterator, context);
        // ���������е�Ԫ��
        each(obj, function(value, index, list) {
            if(result || ( result = iterator.call(context, value, index, list)))
                return breaker;
        });
        return !!result;
    };
    // ��鼯�����Ƿ���ֵ��Ŀ�������ȫƥ��(ͬʱ��ƥ����������)
    _.include = _.contains = function(obj, target) {
        var found = false;
        if(obj == null)
            return found;
        // ���ȵ������������ṩ��Array.prototype.indexOf����
        if(nativeIndexOf && obj.indexOf === nativeIndexOf)
            return obj.indexOf(target) != -1;
        // ͨ��any�������������е�Ԫ��, ��֤Ԫ�ص�ֵ��������Ŀ���Ƿ���ȫƥ��
        found = any(obj, function(value) {
            return value === target;
        });
        return found;
    };
    // ���ε��ü���������Ԫ�ص�ͬ������, �ӵ�3��������ʼ, �����Դ˴��뵽Ԫ�صĵ��÷�����
    // ����һ������, �洢�����з����Ĵ�����
    _.invoke = function(obj, method) {
        // ����ͬ������ʱ���ݵĲ���(�ӵ�3��������ʼ)
        var args = slice.call(arguments, 2);
        // ���ε���ÿ��Ԫ�صķ���, ����������������з���
        return _.map(obj, function(value) {
            return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
        });
    };
    // ����һ���ɶ����б���ɵ�����, ������ÿ�������е�ָ�����Ե�ֵ�б�
    _.pluck = function(obj, key) {
        // ���ĳһ�������в����ڸ�����, �򷵻�undefined
        return _.map(obj, function(value) {
            return value[key];
        });
    };
    // ���ؼ����е����ֵ, ��������ڿɱȽϵ�ֵ, �򷵻�undefined
    _.max = function(obj, iterator, context) {
        // ���������һ������, ��û��ʹ�ô�����, ��ʹ��Math.max��ȡ���ֵ
        // һ�������һ������洢��һϵ��Number���͵�����
        if(!iterator && _.isArray(obj) && obj[0] === +obj[0])
            return Math.max.apply(Math, obj);
        // ���ڿ�ֵ, ֱ�ӷ��ظ������
        if(!iterator && _.isEmpty(obj))
            return -Infinity;
        // һ����ʱ�Ķ���, computed�����ڱȽϹ����д洢���ֵ(��ʱ��)
        var result = {
            computed : -Infinity
        };
        // ���������е�Ԫ��
        each(obj, function(value, index, list) {
            // ���ָ���˴���������, ��Ƚϵ�����Ϊ���������ص�ֵ, ����ֱ��ʹ��each����ʱ��Ĭ��ֵ
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            // ����Ƚ�ֵ�����һ��ֵҪ��, �򽫵�ǰֵ����result.value
            computed >= result.computed && ( result = {
                value : value,
                computed : computed
            });
        });
        // �������ֵ
        return result.value;
    };
    // ���ؼ����е���Сֵ, ���������max����һ��
    _.min = function(obj, iterator, context) {
        if(!iterator && _.isArray(obj) && obj[0] === +obj[0])
            return Math.min.apply(Math, obj);
        if(!iterator && _.isEmpty(obj))
            return Infinity;
        var result = {
            computed : Infinity
        };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && ( result = {
                value : value,
                computed : computed
            });
        });
        return result.value;
    };
    // ͨ�������, ��������������
    _.shuffle = function(obj) {
        // shuffled�����洢������̼����յĽ������
        var shuffled = [], rand;
        // ���������е�Ԫ��
        each(obj, function(value, index, list) {
            // ����һ�������, �������<0-��ǰ�Ѵ��������>֮��
            rand = Math.floor(Math.random() * (index + 1));
            // ���Ѿ�����õ���Ԫ�طŵ�shuffled����ĩβ
            shuffled[index] = shuffled[rand];
            // ��ǰ��õ����������λ�ò�������ֵ
            shuffled[rand] = value;
        });
        // ����һ������, �������д洢�˾���������ŵļ���Ԫ��
        return shuffled;
    };
    // �Լ�����Ԫ��, �����ض����ֶλ�ֵ��������
    // ���Array.prototype.sort����, sortBy����֧�ֶԶ�������
    _.sortBy = function(obj, val, context) {
        // valӦ���Ƕ����һ������, ��һ������������, �����һ��������, ��Ӧ�÷�����Ҫ���бȽϵ�����
        var iterator = _.isFunction(val) ? val : function(obj) {
            return obj[val];
        };
        // ����˳��: _.pluck(_.map().sort());
        // ����_.map()������������, ���������е�Ԫ�طŵ�value�ڵ�, ��Ԫ������Ҫ���бȽϵ����ݷŵ�criteria������
        // ����sort()�����������е�Ԫ�ذ���criteria�����е����ݽ���˳������
        // ����pluck��ȡ�����Ķ��󼯺ϲ�����
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value : value,
                criteria : iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria, b = right.criteria;
            if(a ===
                void 0)
                return 1;
            if(b ===
                void 0)
                return -1;
            return a < b ? -1 : a > b ? 1 : 0;
        }), 'value');
    };
    // �������е�Ԫ��, �����������ص�key��Ϊ�������
    _.groupBy = function(obj, val) {
        var result = {};
        // val����ת��Ϊ���з���Ĵ���������, ���val����һ��Function���͵�����, �򽫱���ΪɸѡԪ��ʱ��keyֵ
        var iterator = _.isFunction(val) ? val : function(obj) {
            return obj[val];
        };
        // ���������е�Ԫ��
        each(obj, function(value, index) {
            // ���������ķ���ֵ��Ϊkey, ������ͬ��keyԪ�طŵ�һ���µ�����
            var key = iterator(value, index);
            (result[key] || (result[key] = [])).push(value);
        });
        // �����ѷ��������
        return result;
    };
    _.sortedIndex = function(array, obj, iterator) {
        iterator || ( iterator = _.identity);
        var low = 0, high = array.length;
        while(low < high) {
            var mid = (low + high) >> 1;
            iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
        }
        return low;
    };
    // ��һ������ת��һ�����鲢����
    // һ�����ڽ�argumentsת��Ϊ����, �򽫶������򼯺�ת��Ϊ������ʽ�����򼯺�
    _.toArray = function(obj) {
        if(!obj)
            return [];
        if(_.isArray(obj))
            return slice.call(obj);
        // ��argumentsת��Ϊ����
        if(_.isArguments(obj))
            return slice.call(obj);
        if(obj.toArray && _.isFunction(obj.toArray))
            return obj.toArray();
        // ������ת��Ϊ����, �����а����������������Ե�ֵ�б�(����������ԭ�����е�����)
        return _.values(obj);
    };
    // ���㼯����Ԫ�ص�����
    _.size = function(obj) {
        // ���������һ������, ���������Ԫ������
        // ���������һ������, ���������е���������(����������ԭ�����е�����)
        return _.isArray(obj) ? obj.length : _.keys(obj).length;
    };
    // ������صķ���
    // ---------------

    // ����һ������ĵ�һ�������ָ����n��Ԫ��
    _.first = _.head = _.take = function(array, n, guard) {
        // ���û��ָ������n, �򷵻ص�һ��Ԫ��
        // ���ָ����n, �򷵻�һ���µ�����, ����˳��ָ������n��Ԫ��
        // guard��������ȷ��ֻ���ص�һ��Ԫ��, ��guardΪtrueʱ, ָ������n��Ч
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    };
    // ����һ��������, ��������һ��Ԫ���������Ԫ��, ���ų������һ��Ԫ�ؿ�ʼ��ǰָ��n��Ԫ��
    // ��first������ͬ����, firstȷ����Ҫ��Ԫ��������֮ǰ��λ��, initialȷ�����ų���Ԫ������������λ��
    _.initial = function(array, n, guard) {
        // ���û�д��ݲ���n, ��Ĭ�Ϸ��س����һ��Ԫ���������Ԫ��
        // ������ݲ���n, �򷵻ش����һ��Ԫ�ؿ�ʼ��ǰ��n��Ԫ���������Ԫ��
        // guard����ȷ��ֻ����һ��Ԫ��, ��guardΪtrueʱ, ָ������n��Ч
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };
    // ������������һ������ָ����n��Ԫ��
    _.last = function(array, n, guard) {
        if((n != null) && !guard) {
            // ���㲢ָ����ȡ��Ԫ��λ��n, ֱ������ĩβ, ��Ϊһ���µ����鷵��
            return slice.call(array, Math.max(array.length - n, 0));
        } else {
            // ���û��ָ������, ��guardΪtrueʱ, ֻ�������һ��Ԫ��
            return array[array.length - 1];
        }
    };
    // ��ȡ���˵�һ����ָ��ǰn��Ԫ���������Ԫ��
    _.rest = _.tail = function(array, index, guard) {
        // ����slice�ĵڶ���λ�ò���, ֱ������ĩβ
        // ���û��ָ��index, ��guardֵΪtrue, �򷵻س���һ��Ԫ���������Ԫ��
        // (index == null)ֵΪtrueʱ, ��Ϊ�������ݸ�slice���������Զ�ת��Ϊ1
        return slice.call(array, (index == null) || guard ? 1 : index);
    };
    // ��������������ֵ�ܱ�ת��Ϊtrue��Ԫ��, ����һ���µ�����
    // ���ܱ�ת����ֵ���� false, 0, '', null, undefined, NaN, ��Щֵ����ת��Ϊfalse
    _.compact = function(array) {
        return _.filter(array, function(value) {
            return !!value;
        });
    };
    // ��һ����ά����ϳ�Ϊһά����, ֧�����ϲ�
    // shallow�������ڿ��ƺϲ����, ��shallowΪtrueʱ, ֻ�ϲ���һ��, Ĭ�Ͻ������ϲ�
    _.flatten = function(array, shallow) {
        // ���������е�ÿһ��Ԫ��, ��������ֵ��Ϊdemo���ݸ���һ�ε���
        return _.reduce(array, function(memo, value) {
            // ���Ԫ����Ȼ��һ������, ���������ж�:
            // - ������������ϲ�, ��ʹ��Array.prototype.concat����ǰ�����֮ǰ�����ݽ�������
            // - ���֧�����ϲ�, ���������flatten����, ֱ���ײ�Ԫ�ز�������������
            if(_.isArray(value))
                return memo.concat( shallow ? value : _.flatten(value));
            // ����(value)�Ѿ����ڵײ�, ��������������, �����ݺϲ���memo�в�����
            memo[memo.length] = value;
            return memo;
        }, []);
    };
    // ɸѡ�����ص�ǰ��������ָ�����ݲ���ȵĲ�������(�ɲο�difference����ע��)
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };
    // �������е����ݽ���ȥ��(ʹ��===���бȽ�)
    // ��isSorted������Ϊfalseʱ, �����ζ������е�Ԫ�ص���include����, �����ͬԪ���Ƿ��Ѿ�����ӵ�����ֵ(����)��
    // �������֮ǰȷ�����������ݰ�˳������, ����Խ�isSorted��Ϊtrue, ����ͨ�������һ��Ԫ�ؽ��жԱ����ų���ֵͬ, ʹ��isSortedЧ�ʻ����Ĭ�ϵ�include��ʽ
    // uniq����Ĭ�Ͻ��������е����ݽ��жԱ�, �������iterator������, �����ݴ���������һ���Ա�����, �Ƚ�ʱ�Ը������е�����Ϊ׼, �����շ��ص�Ψһ������Ȼ��ԭʼ����
    _.uniq = _.unique = function(array, isSorted, iterator) {
        // ���ʹ����iterator������, ���Ƚ���ǰ�����е����ݻ��Ⱦ���������������, ������һ��������������
        // ������������Ϊ�ȽϵĻ�׼
        var initial = iterator ? _.map(array, iterator) : array;
        // ���ڼ�¼����������ʱ����
        var results = [];
        // ���������ֻ��2��ֵ, ����Ҫʹ��include�������бȽ�, ��isSorted����Ϊtrue���������Ч��
        if(array.length < 3)
            isSorted = true;
        // ʹ��reduce�����������ۼӴ�����
        // initial��������Ҫ���бȽϵĻ�׼����, ��������ԭʼ����, Ҳ�����Ǵ������Ľ������(������ù�iterator)
        _.reduce(initial, function(memo, value, index) {
            // ���isSorted����Ϊtrue, ��ֱ��ʹ��===�Ƚϼ�¼�е����һ������
            // ���isSorted����Ϊfalse, ��ʹ��include�����뼯���е�ÿһ�����ݽ��жԱ�
            if( isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
                // memo��¼���Ѿ��ȽϹ������ظ�����
                // ����iterator������״̬, memo�м�¼�����ݿ�����ԭʼ����, Ҳ�����Ǵ���������������
                memo.push(value);
                // �����������б����ʼ��Ϊԭʼ�����е�����
                results.push(array[index]);
            }
            return memo;
        }, []);
        // ���ش�����, ��ֻ�������������ظ�������
        return results;
    };
    // union������uniq��������һ��, ��֮ͬ������union�����ڲ����д���������
    _.union = function() {
        // union�Բ����еĶ���������ǳ��ϲ�Ϊһ��������󴫵ݸ�uniq�������д���
        return _.uniq(_.flatten(arguments, true));
    };
    // ��ȡ��ǰ����������һ����������Ľ���Ԫ��
    // �ӵڶ���������ʼΪ��Ҫ���бȽϵ�һ����������
    _.intersection = _.intersect = function(array) {
        // rest������¼��Ҫ���бȽϵ������������
        var rest = slice.call(arguments, 1);
        // ʹ��uniq����ȥ����ǰ�����е��ظ�����, �����ظ�����
        // �Ե�ǰ���������ͨ�����������й���, �����ط�������(�Ƚ���ͬԪ��)������
        return _.filter(_.uniq(array), function(item) {
            // ʹ��every������֤ÿһ�������ж���������Ҫ�Աȵ�����
            // ������������о������Ա�����, ��ȫ������true, �������һ������û�а�����Ԫ��, �򷵻�false
            return _.every(rest, function(other) {
                // other�����洢��ÿһ����Ҫ���жԱȵ�����
                // item�洢�˵�ǰ��������Ҫ���жԱȵ�����
                // ʹ��indexOf���������������Ƿ���ڸ�Ԫ��(�ɲο�indexOf����ע��)
                return _.indexOf(other, item) >= 0;
            });
        });
    };
    // ɸѡ�����ص�ǰ��������ָ�����ݲ���ȵĲ�������
    // �ú���һ������ɾ��������ָ��������, ���õ�ɾ�����������
    // �÷�����������without���, without����������ʽ�ϲ��������ݱ�������������, ��difference����������ʽ�Ͻ���������(Ҳ���Ժ�withoutʹ����ͬ��ʽ�Ĳ���)
    _.difference = function(array) {
        // �Ե�2��������ʼ�����в���, ��Ϊһ��������кϲ�(���ϲ���һ��, ���������ϲ�)
        // rest�����洢��֤����, �ڱ�������������ԭ���ݶԱ�
        var rest = _.flatten(slice.call(arguments, 1), true);
        // �Ժϲ�����������ݽ��й���, ���������ǵ�ǰ�����в���������ָ������֤���ݵ�����
        // �����Ϲ����������������Ϊһ���µ����鲢����
        return _.filter(array, function(value) {
            return !_.include(rest, value);
        });
    };
    // ��ÿ���������ͬλ�õ�������Ϊһ���µĶ�ά���鷵��, ���ص����鳤���Դ���������������鳤��Ϊ׼, ��������Ŀհ�λ��ʹ��undefined���
    // zip����Ӧ�ð����������, ��ÿ������Ӧ�þ�Ϊ����
    _.zip = function() {
        // ������ת��Ϊ����, ��ʱargs��һ����ά����
        var args = slice.call(arguments);
        // ����ÿһ������ĳ���, ������������󳤶�ֵ
        var length = _.max(_.pluck(args, 'length'));
        // ������󳤶�ֵ����һ���µĿ�����, ���������ڴ洢������
        var results = new Array(length);
        // ѭ����󳤶�, ��ÿ��ѭ��������pluck������ȡÿ����������ͬλ�õ�����(���δ�0�����λ��)
        // ����ȡ�������ݴ洢��һ���µ�����, ����results������
        for(var i = 0; i < length; i++)
        results[i] = _.pluck(args, "" + i);
        // ���صĽ����һ����ά����
        return results;
    };
    // ����һ��Ԫ�����������״γ��ֵ�λ��, ���Ԫ�ز������򷵻� -1
    // ����ʱʹ�� === ��Ԫ�ؽ���ƥ��
    _.indexOf = function(array, item, isSorted) {
        if(array == null)
            return -1;
        var i, l;
        if(isSorted) {
            i = _.sortedIndex(array, item);
            return array[i] === item ? i : -1;
        }
        // ���ȵ������������ṩ��indexOf����
        if(nativeIndexOf && array.indexOf === nativeIndexOf)
            return array.indexOf(item);
        // ѭ��������Ԫ���״γ��ֵ�λ��
        for( i = 0, l = array.length; i < l; i++)
        if( i in array && array[i] === item)
            return i;
        // û���ҵ�Ԫ��, ����-1
        return -1;
    };
    // ����һ��Ԫ�������������һ�γ��ֵ�λ��, ���Ԫ�ز������򷵻� -1
    // ����ʱʹ�� === ��Ԫ�ؽ���ƥ��
    _.lastIndexOf = function(array, item) {
        if(array == null)
            return -1;
        // ���ȵ������������ṩ��lastIndexOf����
        if(nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf)
            return array.lastIndexOf(item);
        var i = array.length;
        // ѭ��������Ԫ�������ֵ�λ��
        while(i--)
        if( i in array && array[i] === item)
            return i;
        // û���ҵ�Ԫ��, ����-1
        return -1;
    };
    // ��������Ͳ���, ����һϵ������, ����Ϊ���鷵��
    // start������ʾ��С��
    // stop������ʾ�����
    // step������ʾ���ɶ����ֵ֮��Ĳ���ֵ
    _.range = function(start, stop, step) {
        // ��������
        if(arguments.length <= 1) {
            // ���û�в���, ��start = 0, stop = 0, ��ѭ���в��������κ�����, ������һ��������
            // �����1������, �����ָ����stop, start = 0
            stop = start || 0;
            start = 0;
        }
        // ���������Ĳ���ֵ, Ĭ��Ϊ1
        step = arguments[2] || 1;

        // ��������Ͳ������㽫���ɵ����ֵ
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);

        // ���������б�, ���洢��range����
        while(idx < len) {
            range[idx++] = start;
            start += step;
        }

        // �����б���
        return range;
    };
    // ������ط���
    // ------------------

    // ����һ����������prototype�Ĺ�����������
    var ctor = function() {
    };
    // Ϊһ��������ִ��������, �κ�����µ��øú���, �����е�this��ָ��context����
    // �󶨺���ʱ, ����ͬʱ���������ݵ����β�
    _.bind = function bind(func, context) {
        var bound, args;
        // ���ȵ������������ṩ��bind����
        if(func.bind === nativeBind && nativeBind)
            return nativeBind.apply(func, slice.call(arguments, 1));
        // func����������һ������(Function)����
        if(!_.isFunction(func))
            throw new TypeError;
        // args�����洢��bind������������ʼ�Ĳ����б�, ÿ�ε���ʱ�������ݸ�func����
        args = slice.call(arguments, 2);
        return bound = function() {
            if(!(this instanceof bound))
                return func.apply(context, sargs.concat(slice.call(arguments)));
            ctor.prototype = func.prototype;
            var self = new ctor;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if(Object(result) === result)
                return result;
            return self;
        };
    };
    // ��ָ���ĺ���, �����������к������±��󶨵�������, ���󶨵ĺ����ڱ�����ʱ, �����Ķ���ʼ��ָ�������
    // �÷���һ���ڴ�������¼�ʱʹ��, ����:
    // _(obj).bindAll(); // ��_(obj).bindAll('handlerClick');
    // document.addEventListener('click', obj.handlerClick);
    // ��handlerClick������, ��������Ȼ��obj����
    _.bindAll = function(obj) {
        // �ڶ���������ʼ��ʾ��Ҫ�󶨵ĺ�������
        var funcs = slice.call(arguments, 1);
        // ���û��ָ���ض��ĺ�������, ��Ĭ�ϰ󶨶�������������ΪFunction������
        if(funcs.length == 0)
            funcs = _.functions(obj);
        // ѭ���������еĺ������±�����Ϊobj������
        // each�����������������ԭ�����еķ���, ���˴���funcs�б���ͨ��_.functions������ȡ��, ���Ѿ�������ԭ�����еķ���
        each(funcs, function(f) {
            obj[f] = _.bind(obj[f], obj);
        });
        return obj;
    };
    // memoize����������һ������, �ú��������˻��湦��, �����������ֵ���浽�ֲ����������´ε���ʱֱ�ӷ���
    // �����������һ���Ӵ�Ķ��������, ʹ��ʱӦ�ÿ����ڴ�ռ�����
    _.memoize = function(func, hasher) {
        // ���ڴ洢��������memo����
        var memo = {};
        // hasher����Ӧ����һ��function, �����ڷ���һ��key, ��key��Ϊ��ȡ����ı�ʶ
        // ���û��ָ��key, ��Ĭ��ʹ�ú����ĵ�һ��������Ϊkey, ��������ĵ�һ�������Ǹ�����������, ���ܻ᷵������[Object object]��key, ���key���ܻ���ɺ�����������ݲ���ȷ
        hasher || ( hasher = _.identity);
        // ����һ������, �ú�������ͨ����黺��, �ٶ�û�л���������ݽ��е���
        return function() {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };
    // ��ʱִ��һ������
    // wait��λΪms, ��3��������ʼ�������δ��ݸ�ִ�к���
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    };
    // �ӳ�ִ�к���
    // JavaScript�е�setTimeout�ᱻ�ŵ�һ�������ĺ�����ջ��ִ��, ִ��ʱ�����ڵ�ǰ��ջ�е��õĺ�������ִ�����֮��
    // defer���ú�����1ms��ִ��, Ŀ���ǽ�func�����ŵ������Ķ�ջ��, �ȴ���ǰ����ִ����ɺ���ִ��
    // defer����һ�����ڴ���DOM���������ȼ�, ʵ����ȷ���߼����̺͸������Ľ�������
    _.defer = function(func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };
    // ������������, throttle������Ҫ���ڿ��ƺ�����ִ��Ƶ��, �ڱ����Ƶ�ʱ������, Ƶ�����ú������ᱻ���ִ��
    // ��ʱ�����������ε����˺���, ʱ�����ֹʱ���Զ�����һ��, ����Ҫ�ȵ�ʱ���ֹ�����ֶ�����(�Զ�����ʱ�����з���ֵ)
    // throttle����һ�����ڴ����Ӻ͵���Ƶ���ĺ���, ͨ���������ƺ����ĵ���Ƶ��, ��ʡ������Դ
    // ����window.onresize�󶨵��¼�����, ��element.onmousemove�󶨵��¼�����, ������throttle���а�װ
    // throttle��������һ������, �ú������Զ�����func�����н�������
    _.throttle = function(func, wait) {
        var context, args, timeout, throttling, more, result;
        // whenDone����������debounce����, ����ڶ���������ú���ʱ, ���һ�ε��ûḲ��֮ǰ���õĶ�ʱ��, ���״̬����Ҳ���ᱻִ��һ��
        // whenDone���������һ�κ���ִ�е�ʱ������ֹʱ����, ��������͵��ù����м�¼��һЩ״̬
        var whenDone = _.debounce(function() {
            more = throttling = false;
        }, wait);
        // ����һ������, ���ں����ڽ��н�������
        return function() {
            // ���溯����ִ�������ĺͲ���
            context = this;
            args = arguments;
            // later��������һ�κ�������ʱ������ֹʱִ��
            var later = function() {
                // ���timeout���, ������һ�κ�������
                timeout = null;
                // more��¼������һ�ε�����ʱ������ֹ֮��, �Ƿ��ظ������˺���
                // ����ظ������˺���, ��ʱ������ֹʱ���Զ��ٴε��ú���
                if(more)
                    func.apply(context, args);
                // ����whenDone, ������ʱ�������������״̬
                whenDone();
            };
            // timeout��¼����һ�κ���ִ�е�ʱ�������
            // timeoutʱ������ֹʱ����later����, later�н����timeout, ������Ƿ���Ҫ�ٴε��ú���
            if(!timeout)
                timeout = setTimeout(later, wait);
            // throttling������¼�ϴε��õ�ʱ�����Ƿ��Ѿ�����, ���Ƿ��ڽ���������
            // throttling��ÿ�κ�������ʱ��Ϊtrue, ��ʾ��Ҫ���н���, ��ʱ������ֹʱ����Ϊfalse(��whenDone������ʵ��)
            if(throttling) {
                // ���������н����˶�ε���, ��more�м�¼һ��״̬, ��ʾ��ʱ������ֹʱ��Ҫ�ٴ��Զ����ú���
                more = true;
            } else {
                // û�д��ڽ�������, �����ǵ�һ�ε��ú���, ���Ѿ�������һ�ε��õļ��, ����ֱ�ӵ��ú���
                result = func.apply(context, args);
            }
            // ����whenDone, ������ʱ�������������״̬
            whenDone();
            // throttling������¼��������ʱ�Ľ���״̬
            throttling = true;
            // ���ص��ý��
            return result;
        };
    };
    // debounce��throttle��������, ���ں�������, ���ǵĲ�֮ͬ������:
    // -- throttle��ע������ִ��Ƶ��, ��ָ��Ƶ���ں���ֻ�ᱻִ��һ��;
    // -- debounce��������ע����ִ�еļ��, ���������εĵ���ʱ�䲻��С��ָ��ʱ��;
    // ������κ�����ִ�м��С��wait, ��ʱ���ᱻ��������´���, ����ζ������Ƶ���ص��ú���, ����һֱ���ᱻִ��, ֱ��ĳһ�ε�������һ�ε��õ�ʱ�䲻С��wait����
    // debounce����һ�����ڿ�����Ҫһ��ʱ��֮�����ִ�еĲ���, �������û��������200ms����ʾ�û�, ����ʹ��debounce��װһ������, �󶨵�onkeyup�¼�
    // ----------------------------------------------------------------
    // @param {Function} func ��ʾ��ִ�еĺ���
    // @param {Number} wait ��ʾ�����ʱ����, �ڸ�ʱ�䷶Χ���ظ����ûᱻ�����Ƴ�wait����
    // @param {Boolean} immediate ��ʾ�������ú��Ƿ�����ִ��, trueΪ��������, falseΪ��ʱ���ֹʱ����
    // debounce��������һ������, �ú������Զ�����func�����н�������
    _.debounce = function(func, wait, immediate) {
        // timeout���ڼ�¼������һ�ε��õ�ִ��״̬(��ʱ�����)
        // ��timeoutΪnullʱ, ��ʾ��һ�ε����Ѿ�����
        var timeout;
        // ����һ������, ���ں����ڽ��н�������
        return function() {
            // ���ֺ����������Ķ���Ͳ���
            var context = this, args = arguments;
            var later = function() {
                // ����timeoutΪnull
                // later�������������ʱ���ֹʱ������
                // ���øú���ʱ, ������һ�κ���ִ��ʱ���Ѿ�������Լ����ʱ����, ��ʱ֮���ٽ��е��ö��Ǳ������
                timeout = null;
                if(!immediate)
                    func.apply(context, args);
            };
            // ����������趨Ϊ����ִ��, ����һ�ε��õ�ʱ�����Ѿ���ȥ, ���������ú���
            if(immediate && !timeout)
                func.apply(context, args);
            // ����һ����ʱ�����ڼ������ú����ĵ���״̬
            // ������ʱ��֮ǰ�������һ��setTimeout���, ������һ�ΰ󶨵ĺ����Ƿ��Ѿ���ִ��
            // ������κ����ڵ���ʱ, ��һ�κ���ִ�л�û�п�ʼ(һ����immediate����Ϊfalseʱ), ������ִ��ʱ��ᱻ�Ƴ�, ���timeout����ᱻ���´���
            clearTimeout(timeout);
            // �������ʱ���ֹʱ����later����
            timeout = setTimeout(later, wait);
        };
    };
    // ����һ��ֻ�ᱻִ��һ�εĺ���, ����ú������ظ�����, �����ص�һ��ִ�еĽ��
    // �ú������ڻ�ȡ�ͼ���̶����ݵ��߼�, ���ȡ�û����õ����������
    _.once = function(func) {
        // ran��¼�����Ƿ�ִ�й�
        // memo��¼�������һ��ִ�еĽ��
        var ran = false, memo;
        return function() {
            // ��������ѱ�ִ�й�, ��ֱ�ӷ��ص�һ��ִ�еĽ��
            if(ran)
                return memo;
            ran = true;
            return memo = func.apply(this, arguments);
        };
    };
    // ����һ������, �ú����Ὣ��ǰ������Ϊ�������ݸ�һ����������
    // �ڰ��������п���ͨ����һ���������õ�ǰ����, �����ؽ��
    // һ�����ڶ�����̴������ĵ������ϵ���
    _.wrap = function(func, wrapper) {
        return function() {
            // ����ǰ������Ϊ��һ������, ���ݸ�wrapper����
            var args = [func].concat(slice.call(arguments, 0));
            // ����wrapper�����Ĵ�����
            return wrapper.apply(this, args);
        };
    };
    // �����������ϵ�һ��, ���ղ������ݵ�˳��, ��һ�������ķ���ֵ�ᱻһ����Ϊ�������ݸ�ǰһ��������Ϊ������������
    // _.compose(A, B, C); ��ͬ�� A(B(C()));
    // �÷�����ȱ�����ڱ������ĺ�������Ĳ�������ֻ����һ��, �����Ҫ���ݶ������, ����ͨ��Array��Object�����������ͽ�����װ
    _.compose = function() {
        // ��ȡ�����б�, ���в������ΪFunction����
        var funcs = arguments;
        // ����һ�������õĺ������
        return function() {
            // �Ӻ���ǰ����ִ�к���, ������¼�ķ���ֵ��Ϊ�������ݸ�ǰһ��������������
            var args = arguments;
            for(var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            // �������һ�ε��ú����ķ���ֵ
            return args[0];
        };
    };
    // ����һ������, �ú�����Ϊ���ü�����, ���ú���������times��(�򳬹�times��)��, func��������ִ��
    // after����һ�������첽�ļ�����, �����ڶ��AJAX����ȫ����ɺ���Ҫִ��һ������, �����ʹ��after��ÿ��AJAX������ɺ����
    _.after = function(times, func) {
        // ���û��ָ����ָ����Ч����, ��func��ֱ�ӵ���
        if(times <= 0)
            return func();
        // ����һ������������
        return function() {
            // ÿ�ε��ü���������times��1, ����times��֮��ִ��func����������func�����ķ���ֵ
            if(--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };
    // ������ط���
    // ----------------

    // ��ȡһ��������������б�(������ԭ�����е�����)
    _.keys = nativeKeys ||
    function(obj) {
        if(obj !== Object(obj))
            throw new TypeError('Invalid object');
        var keys = [];
        // ��¼�����ض��������������
        for(var key in obj)
        if(_.has(obj, key))
            keys[keys.length] = key;
        return keys;
    };

    // ����һ���������������Ե�ֵ�б�(������ԭ�����е�����)
    _.values = function(obj) {
        return _.map(obj, _.identity);
    };
    // ��ȡһ����������������ֵΪFunction���͵�key�б�, ����key����������(����ԭ�����е�����)
    _.functions = _.methods = function(obj) {
        var names = [];
        for(var key in obj) {
            if(_.isFunction(obj[key]))
                names.push(key);
        }
        return names.sort();
    };
    // ��һ���������������(����ԭ�����е�����), ���Ƶ�obj����, �������ͬ�������򸲸�
    _.extend = function(obj) {
        // eachѭ�������е�һ����������
        each(slice.call(arguments, 1), function(source) {
            // �������е�ȫ�����Ը��ƻ򸲸ǵ�obj����
            for(var prop in source) {
                obj[prop] = source[prop];
            }
        });
        return obj;
    };
    // ����һ���¶���, ����obj�и���ָ�������Ե��¶�����
    // ��2��������ʼΪָ������Ҫ���Ƶ�������(֧�ֶ���������������)
    _.pick = function(obj) {
        // ����һ������, ��Ÿ��Ƶ�ָ������
        var result = {};
        // �ӵڶ���������ʼ�ϲ�Ϊһ������������б������
        each(_.flatten(slice.call(arguments, 1)), function(key) {
            // ѭ���������б�, ���obj�д��ڸ�����, ���临�Ƶ�result����
            if( key in obj)
                result[key] = obj[key];
        });
        // ���ظ��ƽ��
        return result;
    };
    // ��obj�в����ڻ�ת��ΪBoolean���ͺ�ֵΪfalse������, �Ӳ�����ָ����һ�����������и��Ƶ�obj
    // һ�����ڸ�����ָ��Ĭ��ֵ
    _.defaults = function(obj) {
        // �ӵڶ���������ʼ��ָ���������, ��Щ�����е����Խ������θ��Ƶ�obj������(���obj�����в����ڸ����ԵĻ�)
        each(slice.call(arguments, 1), function(source) {
            // ����ÿ�������е���������
            for(var prop in source) {
                // ���obj�в����ڻ�����ֵת��ΪBoolean���ͺ�ֵΪfalse, �����Ը��Ƶ�obj��
                if(obj[prop] == null)
                    obj[prop] = source[prop];
            }
        });
        return obj;
    };
    // ����һ��obj�ĸ���, ����һ���µĶ���, �ö������obj�е��������Ժ�ֵ��״̬
    // clone������֧����㸴��, ����obj�е�ĳ�����Դ����һ������, ��ö��󲻻ᱻ����
    // ���obj��һ������, ��ᴴ��һ����ͬ���������
    _.clone = function(obj) {
        // ��֧�ַ�����Ͷ������͵�����
        if(!_.isObject(obj))
            return obj;
        // ���Ʋ�������������
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };
    // ִ��һ������, ����obj��Ϊ�������ݸ��ú���, ����ִ����Ϻ����շ���obj����
    // һ���ڴ���һ����������ʱ���ʹ��tap����, ����:
    // _(obj).chain().tap(click).tap(mouseover).tap(mouseout);
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };
    // eq����ֻ��isEqual�����е���, ���ڱȽ��������ݵ�ֵ�Ƿ����
    // �� === ��ͬ����, eq����ע���ݵ�ֵ
    // ������бȽϵ�������������������, �������Ƚ��Ƿ�����ͬһ������, �һ�������Ƚ�(����������Ľṹ�����ݽ��бȽ�)
    function eq(a, b, stack) {
        // ����������������͵�ֵ�Ƿ����
        // ���ڸ�����������, �����������ͬһ������, ����Ϊ�����
        // ������Ƚϵ�ֵ���а���0, ������һ��ֵ�Ƿ�Ϊ-0, ��Ϊ 0 === -0 �ǳ�����
        // �� 1 / 0 == 1 / -0 �ǲ�������(1 / 0ֵΪInfinity, 1 / -0ֵΪ-Infinity, ��Infinity������-Infinity)
        if(a === b)
            return a !== 0 || 1 / a == 1 / b;
        // ������ת��Ϊ�������ͺ����ֵΪfalse, ���ж�����ֵ�����������Ƿ����(��Ϊnull��undefined, false, 0, ���ַ���, �ڷ��ϸ�Ƚ���ֵ����ȵ�)
        if(a == null || b == null)
            return a === b;
        // ������бȽϵ�������һ��Underscore��װ�Ķ���(����_chain���ԵĶ�����Ϊ��Underscore����)
        // �򽫶�������ȡ���������(ͨ��_wrapped����), Ȼ���ٶԱ�������ݽ��бȽ�
        // ���ǵĹ�ϵ������һ��jQuery��װ��DOM����, ���������������DOM����
        if(a._chain)
            a = a._wrapped;
        if(b._chain)
            b = b._wrapped;
        // ��������ṩ���Զ����isEqual����(�˴���isEqual��������Undersocre�����isEqual����, ��Ϊ����һ���Ѿ���Undersocre��������˽��)
        // ��ʹ�ö����Զ����isEqual��������һ��������бȽ�
        if(a.isEqual && _.isFunction(a.isEqual))
            return a.isEqual(b);
        if(b.isEqual && _.isFunction(b.isEqual))
            return b.isEqual(a);
        // ���������ݵ��������ͽ�����֤
        // ��ȡ����a����������(ͨ��Object.prototype.toString����)
        var className = toString.call(a);
        // �������a���������������b��ƥ��, ����Ϊ��������ֵҲ��ƥ��
        if(className != toString.call(b))
            return false;
        // ִ�е��˴�, ����ȷ����Ҫ�Ƚϵ��������ݾ�Ϊ������������, �������������
        // ͨ��switch������ݵ���������, ��Բ�ͬ�������ͽ��в�ͬ�ıȽ�
        // (�˴�������������Ͷ�������, ��Ϊ���ǿ��ܰ��������ε�����, ���ں���������Ƚ�)
        switch (className) {
            case '[object String]':
                // ������Ƚϵ����ַ�������(����a����ͨ��new String()�������ַ���)
                // ��Bת��ΪString��������ƥ��(����ƥ�䲢�ǽ����ϸ���������ͼ��, ��Ϊ���ǲ�������ͬһ�����������)
                // �ڵ��� == ���бȽ�ʱ, ���Զ����ö����toString()����, �����������������͵��ַ���
                return a == String(b);
            case '[object Number]':
                // ͨ��+a��aת��һ��Number, ���a��ת��֮ǰ��ת��֮�����, ����Ϊa��һ��NaN����
                // ��ΪNaN��NaN�ǲ���ȵ�, ��˵�aֵΪNaNʱ, �޷��򵥵�ʹ��a == b����ƥ��, ��������ͬ�ķ������b�Ƿ�ΪNaN(�� b != +b)
                // ��aֵ��һ����NaN������ʱ, ����a�Ƿ�Ϊ0, ��Ϊ��bΪ-0ʱ, 0 === -0�ǳ�����(ʵ�����������߼�������������ͬ������)
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            // ����������û��ʹ��return��break, ��˻����ִ�е���һ��(�������������Ƿ�ΪBoolean����, ��Ϊ��һ������Boolean���ͽ��м��)
            case '[object Boolean]':
                // �����ڻ򲼶�����ת��Ϊ����
                // �������ͽ�ת��Ϊ��ֵ���͵�ʱ���(��Ч�����ڸ�ʽ������תΪNaN)
                // ����������, true��ת��Ϊ1, false��ת��Ϊ0
                // �Ƚ��������ڻ򲼶����ͱ�ת��Ϊ���ֺ��Ƿ����
                return +a == +b;
            case '[object RegExp]':
                // ������ʽ����, ͨ��source���ʱ��ʽ���ַ�����ʽ
                // ����������ʽ���ַ�����ʽ�Ƿ����
                // ����������ʽ��ȫ�������Ƿ���ͬ(����g, i, m)
                // �����ȫ���, ����Ϊ�����������
                return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
        }
        // ��ִ�е���ʱ, ab��������Ӧ��Ϊ������ͬ�Ķ������������
        if( typeof a != 'object' || typeof b != 'object')
            return false;
        // stack(��)����isEqual����eq����ʱ�ڲ����ݵĿ�����, �ں���Ƚ϶�������ݵ��ڲ������е���eq����Ҳ�ᴫ��
        // length��¼�ѵĳ���
        var length = stack.length;
        while(length--) {
            // ������е�ĳ������������aƥ��, ����Ϊ���
            if(stack[length] == a)
                return true;
        }
        // ������a��ӵ�����
        stack.push(a);
        // ����һЩ�ֲ�����
        var size = 0, result = true;
        // ͨ���ݹ����Ƚ϶��������
        if(className == '[object Array]') {
            // ���Ƚϵ�����Ϊ��������
            // size��¼����ĳ���
            // result�Ƚ���������ĳ����Ƿ�һ��, ������Ȳ�һ��, �򷽷�����󽫷���result(��false)
            size = a.length;
            result = size == b.length;
            // �����������ĳ���һ��
            if(result) {
                // ����eq�����������е�Ԫ�ؽ��е����Ƚ�(��������а�����ά��������, eq������������Ƚ�)
                while(size--) {
                    // ��ȷ���������鶼���ڵ�ǰ������Ԫ��ʱ, ����eq�������Ƚ�(�������ݴ��ݸ�eq����)
                    // ���ȽϵĽ���洢��result����, ���resultΪfalse(���ڱȽ��еõ�ĳ��Ԫ�ص����ݲ�һ��), ��ֹͣ����
                    if(!( result = size in a == size in b && eq(a[size], b[size], stack)))
                        break;
                }
            }
        } else {
            // ���Ƚϵ�����Ϊ��������
            // �������������ͬһ�����ʵ��(ͨ��constructor���ԱȽ�), ����Ϊ�����������
            if('constructor' in a != 'constructor' in b || a.constructor != b.constructor)
                return false;
            // ���Ƚ����������е�����
            for(var key in a) {
                if(_.has(a, key)) {
                    // size���ڼ�¼�ȽϹ�����������, ��Ϊ�����������a���������, ���Ƚ�b�����и����Ե�����
                    // ��b�����е�������������a����ʱ, �˴����߼�����, ���������󲢲����
                    size++;
                    // ��������eq����, ���Ƚ����������е�����ֵ
                    // ���ȽϵĽ����¼��result����, ���Ƚϵ�����ȵ�����ʱֹͣ����
                    if(!( result = _.has(b, key) && eq(a[key], b[key], stack)))
                        break;
                }
            }
            // ���Ƚ����, �����Ѿ�����ȷ���ڶ���a�е���������, ����b��Ҳ������ͬ������
            // ����size(�������Գ���)������b�е����������Ƿ������a���
            if(result) {
                // ��������b�е���������
                for(key in b) {
                    // ��size�Ѿ���0ʱ(������a�е����������Ѿ��������), ������b�л�����������, �����b�е����Զ��ڶ���a
                    if(_.has(b, key) && !(size--))
                        break;
                }
                // ������b�е����Զ��ڶ���a, ����Ϊ�����������
                result = !size;
            }
        }
        // ����ִ�����ʱ, �Ӷ����Ƴ���һ������(�ڱȽ϶��������ʱ, �����eq����, ���п��ܴ��ڶ������)
        stack.pop();
        // ���ص�result��¼�����յıȽϽ��
        return result;
    }

    // ���������ݵ�ֵ���бȽ�(֧�ָ�����������), �ڲ�����eq���ⲿ����
    _.isEqual = function(a, b) {
        return eq(a, b, []);
    };
    // ��������Ƿ�Ϊ��ֵ, ����'', false, 0, null, undefined, NaN, ������(���鳤��Ϊ0)�Ϳն���(������û���κ�����)
    _.isEmpty = function(obj) {
        // obj��ת��ΪBoolean���ͺ�ֵΪfalse
        if(obj == null)
            return true;
        // ��������ַ��������Ƿ�Ϊ0
        if(_.isArray(obj) || _.isString(obj))
            return obj.length === 0;
        // ������(ʹ��for inѭ��ʱ������ѭ�������������, �����ԭ�����е�����), ��������һ�����������ڶ������, ��ô�ö�����һ���ն���
        for(var key in obj)
        if(_.has(obj, key))
            return false;
        // �����������;�û��ͨ����֤, ��һ��������
        return true;
    };
    // ��֤�����Ƿ���һ��DOM����
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType == 1);
    };
    // ��֤�����Ƿ���һ����������, ���ȵ������������ṩ��isArray����
    _.isArray = nativeIsArray ||
    function(obj) {
        return toString.call(obj) == '[object Array]';
    };

    // ��֤�����Ƿ���һ�������������͵Ķ���(���ǻ�����������String, Boolean, Number, null, undefined)
    // ���������������ͨ��new���д���, ��Ҳ���ڶ�������
    _.isObject = function(obj) {
        return obj === Object(obj);
    };
    // ���һ�������Ƿ���һ��arguments��������
    _.isArguments = function(obj) {
        return toString.call(obj) == '[object Arguments]';
    };
    // ��֤isArguments����, ������л����޷�������֤arguments���͵�����, �����¶���isArguments����
    if(!_.isArguments(arguments)) {
        // ���ڻ����޷�ͨ��toString��֤arguments���͵�, ��ͨ������arguments���е�callee������������֤
        _.isArguments = function(obj) {
            // callee��arguments��һ������, ָ���arguments�����������������
            return !!(obj && _.has(obj, 'callee'));
        };
    }

    // ��֤�����Ƿ���һ����������
    _.isFunction = function(obj) {
        return toString.call(obj) == '[object Function]';
    };
    // ��֤�����Ƿ���һ���ַ�������
    _.isString = function(obj) {
        return toString.call(obj) == '[object String]';
    };
    // ��֤�����Ƿ���һ����������
    _.isNumber = function(obj) {
        return toString.call(obj) == '[object Number]';
    };
    // ���һ�������Ƿ�Ϊ��Ч��������Ч��Χ(Number����, ֵ�ڸ������ - �������֮��)
    _.isFinite = function(obj) {
        return _.isNumber(obj) && isFinite(obj);
    };
    // ��������Ƿ�ΪNaN����(����������ֻ��NaN��NaN�����)
    _.isNaN = function(obj) {
        return obj !== obj;
    };
    // ��������Ƿ�ʱBoolean����
    _.isBoolean = function(obj) {
        // ֧���������Ͷ�����ʽ��Boolean����
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };
    // ��������Ƿ���һ��Date����
    _.isDate = function(obj) {
        return toString.call(obj) == '[object Date]';
    };
    // ��������Ƿ���һ��������ʽ����
    _.isRegExp = function(obj) {
        return toString.call(obj) == '[object RegExp]';
    };
    // ��������Ƿ���Nullֵ
    _.isNull = function(obj) {
        return obj === null;
    };
    // ��������Ƿ���Undefined(δ�����)ֵ
    _.isUndefined = function(obj) {
        return obj ===
        void 0;
    };
    // ���һ�������Ƿ����ڶ�����, ����ԭ������
    _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    // ���ߺ���
    // -----------------

    // ����_(�»���)������Underscore����, ������Underscore����, һ�����ڱ���������ͻ��淶������ʽ
    // ����:
    // var us = _.noConflict(); // ȡ��_(�»���)����, ����Underscore��������us������
    // console.log(_); // _(�»���)�Ѿ��޷��ٷ���Underscore����, ���ָ�ΪUnderscore����ǰ��ֵ
    _.noConflict = function() {
        // previousUnderscore������¼��Underscore����ǰ_(�»���)��ֵ
        root._ = previousUnderscore;
        return this;
    };
    // �����������ͬ��ֵ, һ�����ڽ�һ�����ݵĻ�ȡ��ʽת��Ϊ������ȡ��ʽ(�ڲ����ڹ�������ʱ��ΪĬ�ϴ���������)
    _.identity = function(value) {
        return value;
    };
    // ʹָ���ĺ�������ִ��n��(�޲���)
    _.times = function(n, iterator, context) {
        for(var i = 0; i < n; i++)
        iterator.call(context, i);
    };
    // ��HTML�ַ����е������ַ�ת��ΪHTMLʵ��, ���� & < > " ' \
    _.escape = function(string) {
        return ('' + string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
    };
    // ָ��һ�����������, ���ظ����Զ�Ӧ��ֵ, ��������Զ�Ӧ����һ������, ���ִ�иú��������ؽ��
    _.result = function(object, property) {
        if(object == null)
            return null;
        // ��ȡ�����ֵ
        var value = object[property];
        // ���ֵ��һ������, ��ִ�в�����, ����ֱ�ӷ���
        return _.isFunction(value) ? value.call(object) : value;
    };
    // ���һϵ���Զ��巽����Underscore������, ������չUnderscore���
    _.mixin = function(obj) {
        // obj��һ������һϵ���Զ��巽���Ķ���, �˴�ͨ��each��������ķ���
        each(_.functions(obj), function(name) {
            // ͨ��addToWrapper�������Զ��巽����ӵ�Underscore�����Ķ�����, ����֧�ֶ���ʽ����
            // ͬʱ��������ӵ� _ ����, ����֧�ֺ���ʽ����
            addToWrapper(name, _[name] = obj[name]);
        });
    };
    // ��ȡһ��ȫ��Ψһ��ʶ, ��ʶ��0��ʼ�ۼ�
    var idCounter = 0;
    // prefix��ʾ��ʶ��ǰ׺, ���û��ָ��ǰ׺��ֱ�ӷ��ر�ʶ, һ�����ڸ������DOM����ΨһID
    _.uniqueId = function(prefix) {
        var id = idCounter++;
        return prefix ? prefix + id : id;
    };
    // ����ģ��Ľ綨����, ��template������ʹ��
    _.templateSettings = {
        // JavaScript��ִ�д���Ľ綨��
        evaluate : /<%([\s\S]+?)%>/g,
        // ֱ����������Ľ綨��
        interpolate : /<%=([\s\S]+?)%>/g,
        // ��Ҫ��HTML���Ϊ�ַ���(���������ת��Ϊ�ַ�����ʽ)�Ľ綨��
        escape : /<%-([\s\S]+?)%>/g
    };

    var noMatch = /.^/;

    // escapes�����¼����Ҫ�����໥��ת������������ַ�����ʽ�Ķ�Ӧ��ϵ, �����߽����໥ת��ʱ��Ϊ����ʹ��
    // ���ȸ����ַ�����ʽ���������ַ�
    var escapes = {
        '\\' : '\\',
        "'" : "'",
        'r' : '\r',
        'n' : '\n',
        't' : '\t',
        'u2028' : '\u2028',
        'u2029' : '\u2029'
    };
    // �������������ַ��ַ���, ���������ַ���Ϊkey��¼�ַ�����ʽ
    for(var p in escapes)
    escapes[escapes[p]] = p;
    // ����ģ������Ҫ�滻���������, ������б��, ������, �س���, ���з�, �Ʊ��, �зָ���, ����ָ���
    // �ڽ��ַ����е��������ת��Ϊ�ַ�����ʽʱʹ��
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    // �ڽ��ַ�����ʽ��������Ž��з�ת(�滻)ʱʹ��
    var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

    // ��ת�ַ����е��������
    // ��ģ�����漰����Ҫִ�е�JavaScriptԴ��, ��Ҫ����������ŷ�ת, ���������HTMLʵ����ַ�����ʽ����, ���׳��﷨����
    var unescape = function(code) {
        return code.replace(unescaper, function(match, escape) {
            return escapes[escape];
        });
    };
    // Underscoreģ���������, ���ڽ�������䵽һ��ģ���ַ�����
    // ģ���������:
    // 1. ��ģ���е��������ת��Ϊ�ַ���
    // 2. ����escape��ʽ��ǩ, �����ݽ���ΪHTMLʵ��
    // 3. ����interpolate��ʽ��ǩ, �������
    // 4. ����evaluate��ʽ��ǩ, ������ִ�е�JavaScript����
    // 5. ����һ��������, �ú����ڵõ����ݺ��ֱ����䵽ģ�岢����������ַ���
    // 6. ���ݲ�������������ַ����������ľ��
    // -------------------
    // ��ģ������, ��ͨ��argments��ȡ2������, �ֱ�Ϊ�������(����Ϊobj)��Underscore����(����Ϊ_)
    _.template = function(text, data, settings) {
        // ģ������, ���û��ָ��������, ��ʹ��templateSettings��ָ����������
        settings = _.defaults(settings || {}, _.templateSettings);

        // ��ʼ��ģ�����Ϊ��ִ��Դ��
        var source = "__p+='" + text.replace(escaper, function(match) {
            // ���������ת��Ϊ�ַ�����ʽ
            return '\\' + escapes[match];
        }).replace(settings.escape || noMatch, function(match, code) {
            // ����escape��ʽ��ǩ <%- %>, �������а�����HTMLͨ��_.escape����ת��ΪHTMLʵ��
            return "'+\n_.escape(" + unescape(code) + ")+\n'";
        }).replace(settings.interpolate || noMatch, function(match, code) {
            // ����interpolate��ʽ��ǩ <%= %>, ��ģ��������Ϊһ�������������ַ�����������, �����Ϊһ���������
            return "'+\n(" + unescape(code) + ")+\n'";
        }).replace(settings.evaluate || noMatch, function(match, code) {
            // ����evaluate��ʽ��ǩ <% %>, evaluate��ǩ�д洢����Ҫִ�е�JavaScript����, ���������ǰ���ַ���ƴ��, �����µ�һ����ΪJavaScript�﷨ִ��, ��������������ٴ���Ϊ�ַ����Ŀ�ʼ, ���evaluate��ǩ�ڵ�JavaScript������ܱ�����ִ��
            return "';\n" + unescape(code) + "\n;__p+='";
        }) + "';\n";
        if(!settings.variable)
            source = 'with(obj||{}){\n' + source + '}\n';
        source = "var __p='';" + "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" + source + "return __p;\n";

        // ����һ������, ��Դ����Ϊ����ִ����, ��obj��Underscore��Ϊ�������ݸ��ú���
        var render = new Function(settings.variable || 'obj', '_', source);
        // ���ָ����ģ����������, ���滻ģ������, �������滻��Ľ��
        if(data)
            return render(data, _);
        // ���û��ָ���������, �򷵻�һ������, �ú������ڽ����յ��������滻��ģ��
        // ����ڳ����л��������ͬģ��, ��ô�ڵ�һ�ε���ʱ���鲻ָ���������, �ڻ�ô����������ú�, ��ֱ�ӵ��û��������Ч��
        var template = function(data) {
            return render.call(this, data, _);
        };
        // ��������Դ���ַ�����ӵ�����������, һ�����ڵ��ԺͲ���
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
        // û��ָ��������ݵ������, ���ش��������
        return template;
    };
    // ֧��Underscore����ķ���������, �ɲο� wrapper.prototype.chain
    _.chain = function(obj) {
        return _(obj).chain();
    };
    // Underscore�����װ��ط���
    // ---------------

    // ����һ����װ��, ��һЩԭʼ���ݽ��а�װ
    // ���е�undersocre����, �ڲ���ͨ��wrapper�������й���ͷ�װ
    // Underscore��wrapper���ڲ���ϵ:
    // -�ڲ��������_, ��Underscore��صķ�����ӵ�_, �����Ϳ���֧�ֺ���ʽ�ĵ���, ��_.bind()
    // -�ڲ�����wrapper��, ��_��ԭ�Ͷ���ָ��wrapper���ԭ��
    // -��Underscore��صķ�����ӵ�wrapperԭ��, ������_����;߱���Underscore�ķ���
    // -��Array.prototype��ط�����ӵ�wrapperԭ��, ������_����;߱���Array.prototype�еķ���
    // -new _()ʱʵ�ʴ�����������һ��wrapper()����, ����ԭʼ����洢��_wrapped����, ����ԭʼֵ��Ϊ��һ���������ö�Ӧ����
    var wrapper = function(obj) {
        // ԭʼ���ݴ���ڰ�װ�����_wrapped������
        this._wrapped = obj;
    };
    // ��Underscore��ԭ�Ͷ���ָ��wrapper��ԭ��, ���ͨ����wrapperԭ������ӷ���, Underscore����Ҳ��߱�ͬ���ķ���
    _.prototype = wrapper.prototype;

    // ����һ������, �����ǰUnderscore������chain()����(��_chain����Ϊtrue), �򷵻�һ������װ��Underscore����, ���򷵻ض�����
    // result���������ڹ��췽����ʱ����Underscore�İ�װ����
    var result = function(obj, chain) {
        return chain ? _(obj).chain() : obj;
    };
    // ��һ���Զ��巽����ӵ�Underscore������(ʵ������ӵ�wrapper��ԭ����, ��Underscore�����ԭ��ָ����wrapper��ԭ��)
    var addToWrapper = function(name, func) {
        // ��wrapperԭ�������һ��name����, �ú�������func����, ��֧���˷������Ĵ���
        wrapper.prototype[name] = function() {
            // ��ȡfunc�����Ĳ���, ������ǰ��ԭʼ������ӵ���һ������
            var args = slice.call(arguments);
            unshift.call(args, this._wrapped);
            // ִ�к��������ؽ��, ��ͨ��result�����Է��������з�װ, �����ǰ������chain()����, �򷵻ط�װ���Underscore����, ���򷵻ض�����
            return result(func.apply(_, args), this._chain);
        };
    };
    // ���ڲ������_(�»���, ��Underscore�������϶���)�еķ������Ƶ�wrapper��ԭ������(��Underscore��ԭ������)
    // ����Ϊ���ڹ������ʽ���õ�Underscore����ʱ, ��Щ����Ҳ������ڲ������Underscore����
    _.mixin(_);

    // ��Array.prototype�е���ط�����ӵ�Underscore������, ����ڷ�װ���Underscore������Ҳ����ֱ�ӵ���Array.prototype�еķ���
    // ��: _([]).push()
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        // ��ȡArray.prototype�ж�Ӧ����������
        var method = ArrayProto[name];
        // ���÷�����ӵ�Underscore������(ʵ������ӵ�wrapper��ԭ�Ͷ���, ����ڴ���Underscore����ʱͬʱ�߱��˸÷���)
        wrapper.prototype[name] = function() {
            // _wrapped�����д洢Underscore�����ԭʼֵ
            var wrapped = this._wrapped;
            // ����Array��Ӧ�ķ��������ؽ��
            method.apply(wrapped, arguments);
            var length = wrapped.length;
            if((name == 'shift' || name == 'splice') && length === 0)
                delete wrapped[0];
            // ��ʹ�Ƕ���Array�еķ���, Underscoreͬ��֧�ַ���������
            return result(wrapped, this._chain);
        };
    });
    // ����ͬ����һ�δ���, �������е�һЩ������ӵ�Underscore����, ��֧���˷���������
    // ����������һ�δ�������ӵĺ���, ������Array������(Ҳ�����Ƿ�װ���Array), concat, join, slice����������һ���µ�Array����(Ҳ�����Ƿ�װ���Array)
    each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        wrapper.prototype[name] = function() {
            return result(method.apply(this._wrapped, arguments), this._chain);
        };
    });
    // ��Underscore���������ʽ��������������
    wrapper.prototype.chain = function() {
        // this._chain������ʾ��ǰ�����Ƿ�ʹ����ʽ����
        // ����֧�ַ���������������, һ���ھ��巽���л᷵��һ��Underscore����, ����ԭʼֵ�����_wrapped������, Ҳ����ͨ��value()������ȡԭʼֵ
        this._chain = true;
        return this;
    };
    // ���ر���װ��Underscore�����ԭʼֵ(�����_wrapped������)
    wrapper.prototype.value = function() {
        return this._wrapped;
    };
}).call(this);
