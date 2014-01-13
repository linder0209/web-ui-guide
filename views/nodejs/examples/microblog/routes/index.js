/*
 * GET home page.
 */
//crypto 是 Node.js 的一个核心模块，功能是加密并生成各种散列
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');

exports.index = function (req, res) {
    res.render('index', {
        title: '首页'
    });
};
exports.reg = function (req, res) {
    res.render('reg', {
        title: '用户注册'
    });
};

exports.submitReg = function (req, res) {
    //检验用户两次输入的口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
        return res.redirect('/reg');
    }
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
        name: req.body.username,
        password: password
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
        if (user)
            err = 'Username already exists.';
        if (err) {
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        newUser.save(function (err) {
            if (err) {
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            res.redirect('/');
        });
    });
};

exports.login = function (req, res) {
    res.render('login', {
        title: '用户登入'
    });
};

exports.submitLogin = function (req, res) {
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.get(req.body.username, function (err, user) {
        if (!user) {
            return res.redirect('/login');
        }
        if (user.password != password) {
            return res.redirect('/login');
        }
        req.session.user = user;
        res.redirect('/');
    });
};

exports.logout = function (req, res) {
    req.session.user = null;
    res.redirect('/');
};

//发表微博
exports.post = function (req, res) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.post);
    post.save(function(err) {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/u/' + currentUser.name);
    });
};

exports.user = function(req, res) {
    User.get(req.params.user, function(err, user) {
        if (!user) {
            return res.redirect('/');
        }
        Post.get(user.name, function(err, posts) {
            if (err) {
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts
            });
        });
    });
};
