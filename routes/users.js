var express = require('express');
var router = express.Router();

/* GET users listing. */
// 瀏覽 http://l27.0.0.1:3000/users 時觸發
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
