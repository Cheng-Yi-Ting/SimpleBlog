// 初始化資料庫
var settings = require('../settings'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;
// Set up the connection to the local db
module.exports = new Db(settings.db, new Server(settings.host, 27017, {}), { safe: true });
/*
Node.js mongodb set default safe variable
safe: true
the default value is false which means the driver receives does not
return the information of the success/error of the insert/update/remove
*/
/*
以上代码通过  module.exports  输出了创建的数据库连接，模組只会被加载一次，之後會在其他檔案中都使用這個实例
*/