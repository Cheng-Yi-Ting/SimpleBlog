var express = require('express');
var router = express.Router();
//md5加密中間件
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

//主頁路由
router.get('/', function (req, res, next) {
  //查詢所有的posts
  // 是读取所有用户的微博，传递给页面  posts   属性
  Post.get(null, function (err, posts) {
    if (err) {
      posts = [];
    }
    res.render('index', {
      title: '首頁',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//註冊頁路由
router.get("/reg", checkNotLogin);
router.get('/reg', function (req, res, next) {
  res.render('reg', { title: '用戶註冊' });
});

router.post("/reg", checkNotLogin);
router.post('/reg', function (req, res, next) {
  /*
  e.g:req.body
  [Object: null prototype] {
  username: 'abc123',
  password: 'abc123',
  'password-repeat': 'abc123' }
  */
  if (req.body['password-repeat'] != req.body['password']) {
    req.flash('error', '兩次輸入的密碼不一致');
    return res.redirect('/reg');
  }

  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  //  User  是用户对象
  // req.body  就是  POST  请求信息解析过后的对象，例如我们要访问用户传递的 password  域的值，只需访问  req.body['password']  即可。 

  var newUser = new User({
    name: req.body.username,
    password: password,
  });

  //檢查用戶是否已經存在
  // User.get   的功能是通过用户名获取已知用户，在这里我们判断用户名是否已经存在。 User.save  可以将用户对象的修改写入数据库。
  User.get(newUser.name, function (err, user) {
    if (user) {
      err = '用戶已經存在!';
    }
    if (err) {
      // req.flash   是  Express 提供的一个工具，通过它保存的变量只会在用户当前和下一次的请求中被访问，之后会被清除，通过它我们可以很方便地实现页面的通知和错误信息显示功能。
      req.flash('error', err);
      // res.redirect  是重定向功能，通过它会向用户返回一个 303 See Other 状态，通知浏览器转向相应页面。 
      return res.redirect('/reg');
    }
    newUser.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      // req.session.user = newUser  向会话对象写入了当前用户的信息，之後会通过它判断用户是否已经登录。登入和登出是透過req.session.user变量的标记
      // e.g:newUser:User { name: '213', password: 'l51HKoSAS59ke8GFqHeotQ==' }
      req.session.user = newUser;
      req.flash('success', '註冊成功！');
      res.redirect('/');

    });
  });

});

//登錄頁路由
router.get("/login", checkNotLogin);
router.get('/login', function (req, res, next) {
  res.render("login", {
    title: "用戶登入",
  });
});

router.post("/login", checkNotLogin);
router.post('/login', function (req, res, next) {
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function (err, user) {
    if (!user) {
      req.flash('error', '用戶不存在');
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', '用戶口令錯誤');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登入成功');
    res.redirect('/');
  });
});


//登出頁路由
router.get("/logout", checkLogin);
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  req.flash('success', '登出成功');
  res.redirect('/');
});

//發言路由
// 过  req.session.user  获取当前用户信息，从  req.body.post  获取用户发表的内容，建立  Post  对象，调用  save()  方法存储信息，最后将用户重定向到用户页面。
router.post("/post", checkLogin);
router.post('/post', function (req, res, next) {
  var currentUser = req.session.user;
  var post = new Post(currentUser.name, req.body.post);
  post.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '發表成功');
    res.redirect('/u/' + currentUser.name);
  });
});

//獲得用戶說說，用户页面的功能是展示用户发表的所有内容
// 首先检查用户是否存在，如果存在则从数据库中获取该用户的微博，最后通过  posts  属性传递给  user  视图。views / user.ejs 的内容如下：
// req.params : 这是一个数组对象，命名过的参数会以键值对的形式存放。 比如你有一个路由/user/:name, name属性会存放在req.params.name. 这个对象默认为 {}.
router.get('/u/:user', function (req, res, next) {
  User.get(req.params.user, function (err, user) {
    if (!user) {
      req.flash('error', '用戶不存在');
      return res.redirect('/');
    }
    Post.get(user.name, function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
      });
    });
  });
});




function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登入');
    return res.redirect('/login');
  }
  next();
}
function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
}



module.exports = router;
