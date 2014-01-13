/**
 * Created with JetBrains WebStorm.
 * User: wangyanjun
 * Date: 13-5-11
 * Time: 下午10:50
 * To change this template use File | Settings | File Templates.
 */

var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {native_parser:true}));
