/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/base', function(S, Base, Node, UrlsInput, IframeType, AjaxType, FlashType) {
  var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader]:';
  /**
   * @name Uploader
   * @class 异步文件上传组件，支持ajax、flash、iframe三种方案
   * @constructor
   * @extends Base
   * @requires UrlsInput
   * @requires IframeType
   * @requires  AjaxType
   * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
   * @param {Button} config.button *，Button按钮的实例
   * @param {Queue} config.queue *，Queue队列的实例
   * @param {String|Array} config.type *，采用的上传方案
   * @param {Object} config.serverConfig *，服务器端配置
   * @param {String} config.urlsInputName *，存储文件路径的隐藏域的name名
   * @param {Boolean} config.isAllowUpload 是否允许上传文件
   * @param {Boolean} config.autoUpload 是否自动上传
   * @example
   * var uploader = new Uploader({button:button,queue:queue,serverConfig:{action:'test.php'}})
   */
  function Uploader(config) {
    var self = this;
    //调用父类构造函数
    Uploader.superclass.constructor.call(self, config);
  }


  S.mix(Uploader, /** @lends Uploader*/{
    /**
     * 上传方式，{AUTO:'auto', IFRAME:'iframe', AJAX:'ajax', FLASH:'flash'}
     */
    type: {AUTO: 'auto', IFRAME: 'iframe', AJAX: 'ajax', FLASH: 'flash'},
    /**
     * 组件支持的事件列表，{ RENDER:'render', SELECT:'select', START:'start', PROGRESS : 'progress', COMPLETE:'complete', SUCCESS:'success', UPLOAD_FILES:'uploadFiles', CANCEL:'cancel', ERROR:'error' }
     *
     */
    event: {
      //运行
      RENDER: 'render',
      //选择完文件后触发
      SELECT: 'select',
      //开始上传后触发
      START: 'start',
      //正在上传中时触发
      PROGRESS: 'progress',
      //上传完成（在上传成功或上传失败后都会触发）
      COMPLETE: 'complete',
      //上传成功后触发
      SUCCESS: 'success',
      //批量上传结束后触发
      UPLOAD_FILES: 'uploadFiles',
      //取消上传后触发
      CANCEL: 'cancel',
      //上传失败后触发
      ERROR: 'error'
    },
    /**
     * 文件上传所有的状态，{ WAITING : 'waiting', START : 'start', PROGRESS : 'progress', SUCCESS : 'success', CANCEL : 'cancel', ERROR : 'error', RESTORE: 'restore' }
     */
    status: {
      WAITING: 'waiting',
      START: 'start',
      PROGRESS: 'progress',
      SUCCESS: 'success',
      CANCEL: 'cancel',
      ERROR: 'error',
      RESTORE: 'restore'
    }
  });
  /**
   * @name Uploader#select
   * @desc  选择完文件后触发
   * @event
   * @param {Array} ev.files 文件完文件后返回的文件数据
   */

  /**
   * @name Uploader#start
   * @desc  开始上传后触发
   * @event
   * @param {Number} ev.index 要上传的文件在队列中的索引值
   * @param {Object} ev.file 文件数据
   */

  /**
   * @name Uploader#progress
   * @desc  正在上传中时触发，这个事件在iframe上传方式中不存在
   * @event
   * @param {Object} ev.file 文件数据
   * @param {Number} ev.loaded  已经加载完成的字节数
   * @param {Number} ev.total  文件总字节数
   */

  /**
   * @name Uploader#complete
   * @desc  上传完成（在上传成功或上传失败后都会触发）
   * @event
   * @param {Number} ev.index 上传中的文件在队列中的索引值
   * @param {Object} ev.file 文件数据
   * @param {Object} ev.result 服务器端返回的数据
   */

  /**
   * @name Uploader#success
   * @desc  上传成功后触发
   * @event
   * @param {Number} ev.index 上传中的文件在队列中的索引值
   * @param {Object} ev.file 文件数据
   * @param {Object} ev.result 服务器端返回的数据
   */

  /**
   * @name Uploader#error
   * @desc  上传失败后触发
   * @event
   * @param {Number} ev.index 上传中的文件在队列中的索引值
   * @param {Object} ev.file 文件数据
   * @param {Object} ev.result 服务器端返回的数据
   */

  /**
   * @name Uploader#cancel
   * @desc  取消上传后触发
   * @event
   * @param {Number} ev.index 上传中的文件在队列中的索引值
   */

  /**
   * @name Uploader#uploadFiles
   * @desc  批量上传结束后触发
   * @event
   */
  //继承于Base，属性getter和setter委托于Base处理
  S.extend(Uploader, Base, /** @lends Uploader.prototype*/{
    /**
     * 运行组件，实例化类后必须调用render()才真正运行组件逻辑
     * @return {Uploader}
     */
    render: function() {
      return self;
    },
    /**
     * 上传指定队列索引的文件
     * @param {Number} index 文件对应的在上传队列数组内的索引值
     * @example
     * //上传队列中的第一个文件，uploader为Uploader的实例
     * uploader.upload(0)
     */
    upload: function(index) {

    },
    /**
     * 取消文件上传，当index参数不存在时取消当前正在上传的文件的上传。cancel并不会停止其他文件的上传（对应方法是stop）
     * @param {Number} index 队列数组索引
     * @return {Uploader}
     */
    cancel: function(index) {

      return self;
    },
    /**
     * 停止上传动作
     * @return {Uploader}
     */
    stop: function() {

      return self;
    },
    /**
     * 批量上传队列中的指定状态下的文件
     * @param {String} status 文件上传状态名
     * @return {Uploader}
     * @example
     * //上传队列中所有等待的文件
     * uploader.uploadFiles("waiting")
     */
    uploadFiles: function(status) {

      return self;
    },
    /**
     * 上传队列中的指定状态下的文件
     * @param {String} status 文件上传状态名
     * @return {Uploader}
     */
    _uploaderStatusFile: function(status) {

      return self;
    },
    /**
     * 是否支持ajax方案上传
     * @return {Boolean}
     */
    isSupportAjax: function() {

      return isSupport;
    },
    /**
     * 是否支持flash方案上传
     * @return {Boolean}
     */
    isSupportFlash: function() {

      return S.isArray(fpv) && fpv.length > 0;
    },
    /**
     * 获取上传方式
     * @param {String} type 上传方式（根据type返回对应的上传类，比如iframe返回IframeType）
     */
    _getType: function(type) {

      return UploadType;
    },
    /**
     * 运行Button上传按钮组件
     * @return {Button}
     */
    _renderButton: function() {

      return button;
    },
    /**
     * 运行Queue队列组件
     * @return {Queue} 队列实例
     */
    _renderQueue: function() {

      return queue;
    },
    /**
     * 选择完文件后
     * @param {Object} ev 事件对象
     */
    _select: function(ev) {

    },
    /**
     * 向上传按钮容器内增加用于存储文件路径的input
     */
    _renderUrlsInput: function() {

    },
    /**
     * 当上传完毕后返回结果集的处理
     */
    _uploadCompleteHanlder: function(ev) {

    },
    /**
     * 取消上传后调用的方法
     */
    _uploadStopHanlder: function() {

    },
    /**
     * 如果存在批量上传，则继续上传
     */
    _continueUpload: function() {

    },
    /**
     * 上传进度监听器
     */
    _uploadProgressHandler: function(ev) {

    },
    /**
     * 上传成功后执行的回调函数
     * @param {Object} data 服务器端返回的数据
     */
    _success: function(data) {

    },
    /**
     * 检查是否有已经存在的图片恢复到队列中
     */
    _restore: function() {

    }
  }, {ATTRS: /** @lends Uploader.prototype*/{
      /**
       * Button按钮的实例
       * @type Button
       * @default {}
       */
      button: {value: {}},
      /**
       * Queue队列的实例
       * @type Queue
       * @default {}
       */
      queue: {value: {}},
      /**
       * 采用的上传方案，当值是数组时，比如“type” : ["flash","ajax","iframe"]，按顺序获取浏览器支持的方式，该配置会优先使用flash上传方式，如果浏览器不支持flash，会降级为ajax，如果还不支持ajax，会降级为iframe；当值是字符串时，比如“type” : “ajax”，表示只使用ajax上传方式。这种方式比较极端，在不支持ajax上传方式的浏览器会不可用；当“type” : “auto”，auto是一种特例，等价于["ajax","iframe"]。
       * @type String|Array
       * @default "auto"
       */
      type: {value: Uploader.type.AUTO},
      /**
       * 服务器端配置。action：服务器处理上传的路径；data： post给服务器的参数，通常需要传递用户名、token等信息
       * @type Object
       * @default  {action:EMPTY, data:{}, dataType:'json'}
       */
      serverConfig: {value: {action: EMPTY, data: {}, dataType: 'json'}},
      /**
       * 是否允许上传文件
       * @type Boolean
       * @default true
       */
      isAllowUpload: {value: true},
      /**
       * 是否自动上传
       * @type Boolean
       * @default true
       */
      autoUpload: {value: true},
      /**
       * 存储文件路径的隐藏域的name名
       * @type String
       * @default ""
       */
      urlsInputName: {value: EMPTY},
      /**
       *  当前上传的文件对应的在数组内的索引值，如果没有文件正在上传，值为空
       *  @type Number
       *  @default ""
       */
      curUploadIndex: {value: EMPTY},
      /**
       * 上传方式实例
       * @type UploaderType
       * @default {}
       */
      uploadType: {value: {}},
      /**
       * UrlsInput实例
       * @type UrlsInput
       * @default ""
       */
      urlsInput: {value: EMPTY},
      /**
       * 存在批量上传文件时，指定的文件状态
       * @type String
       * @default ""
       */
      uploadFilesStatus: {value: EMPTY}
    }});

  return Uploader;
}, {requires: ['base', 'node', './urlsInput', './type/iframe', './type/ajax', './type/flash', 'flash']});