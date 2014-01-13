/**
 * Created with JetBrains WebStorm.
 * User: wangyanjun
 * Date: 13-5-11
 * Time: 下午11:31
 * To change this template use File | Settings | File Templates.
 */
var mongodb = require('./mongodb');

function User(user) {
    this.name = user.name;
    this.password = user.password;
};
module.exports = User;

User.prototype.save = function save(callback) {
    // 存入 Mongodb 的文檔
    var user = {
        name: this.name,
        password: this.password
    };
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        // 读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 为 name 属性添加索引
            collection.ensureIndex('name', {unique: true});
            // 插入 user
            collection.insert(user, {safe: true}, function (err, user) {
                mongodb.close();
                callback(err, user);
            });
        });
    });
};

// 返回用户信息
User.get = function get(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        // 读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            // 查找 name 属性 为 username 的用户
            collection.findOne({name: username}, function (err, obj) {
                mongodb.close();
                if (obj) {
                    // 封裝 User 对象
                    var user = new User(obj);
                    callback(err, user);
                } else {
                    callback(err, null);
                }
            });
        });
    });
};
