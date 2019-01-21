var mongodb = require('./db');
/* 代码实现了两个接口， 
User.prototype.save:对象实例的方法，用于将用户对象的数据保存到数据库中
User.get:对象构造函数的方法，用于从数据 库中查找指定的用户。
 */
/**
 * 集合`users`的文档`User`构造函数
 * @param {Object} user: 包含用户信息的一个对象
 */
// constructor
// User是一個構造函數，可以用new這個關鍵字 new 出一個 instance 來。
function User(user) {
    this.name = user.name;
    this.password = user.password;
};

module.exports = User;

/*
 * 保存一个用户到数据库
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */
// 只要把 save 這個 function 指定在 User.prototype 上面，所有 User 的 instance 都可以共享這個方法。
User.prototype.save = function save(callback) {
    // 存入 Mongodb 的文档
    var user = {
        name: this.name,
        password: this.password,
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
            // 写入 user 文档 
            collection.insert(user, { safe: true }, function (err, user) {
                mongodb.close();
                callback(err, user);
            });
        });
    });
};

/*
 * 查询在集合`users`是否存在一个制定用户名的用户
 * @param {String} username: 需要查询的用户的名字
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */
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
            // 查找 name 属性为 username 的文档
            collection.findOne({ name: username }, function (err, doc) {
                mongodb.close();
                if (doc) {
                    /*
                    e.g:doc
                    { _id: 5c4479a85909af0fb4d20530,
                     name: '123',
                    password: 'ICy5YqxZB1uWSwcVLSNLcA==' }
                    */
                    // 封装文档为 User 对象 
                    var user = new User(doc);
                    // e.g:user:User { name: '123', password: 'ICy5YqxZB1uWSwcVLSNLcA==' }
                    callback(err, user);
                } else {
                    callback(err, null);
                }
            });
        });
    });
};

