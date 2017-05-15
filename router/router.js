//引入db和md5文件
var formidable = require("formidable");
var db = require('../models/db.js');
var md5 = require('../models/md5.js');
var path = require("path");
var fs = require("fs");

var svgCaptcha = require('svg-captcha');

var User = require('../models/User.js');
var Log = require('../models/Log.js');
var Mood = require('../models/Mood.js');

//注册业务
// exports.doRegist = function (req, res, next) {
//   //得到用户填写的东西
//   var form = new formidable.IncomingForm();
//   form.parse(req, function (err, fields, files) {
//     //得到表单之后做的事情
//     var user = fields.user;
//     var name = fields.name;
//     var pass = fields.pass;
//     var email = fields.email;
//     var avatar = fields.avatar || "moren.jpg";
//     var sex = fields.sex;
//     var born = fields.born;
//     var city = fields.city;
//     var hobby = fields.hobby;
//     var label = fields.label;
//     var sign = fields.sign;
//
//     //查询数据库中是不是有这个人
//     db.find("users", {"user": user}, function (err, result) {
//       if (err) {
//         res.send("-3"); //服务器错误
//         return;
//       }
//       if (result.length !== 0) {
//         res.send("-1"); //被占用
//         return;
//       }
//       //设置md5加密
//       pass = md5(md5(pass) + "考拉");
//       //现在可以证明，用户名没有被占用
//       db.insertOne("users", {
//         "user": user,
//         "name": name,
//         "pass": pass,
//         "email": email,
//         "avatar": avatar,
//         "sex": sex,
//         "born": born,
//         "city": city,
//         "hobby": hobby,
//         "label": label,
//         "sign": sign
//       }, function (err, result) {
//         if (err) {
//           res.send("-3"); //服务器错误
//           return;
//         }
//
//         res.send("1"); //注册成功，写入session
//       })
//     })
//   });
// };
// 使用mongoose进行注册业务
exports.doRegist = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {

    // 先判断upload/avatar文件夹是否存在，不存在就创建
    var avatarDir = fs.existsSync("./upload/avatar");

    if (!avatarDir) {
      console.log('创建upload/avatar文件夹');
      fs.mkdirSync("./upload/avatar");
    }

    //得到表单之后做的事情
    var user = fields.user;
    var name = fields.name;
    var pass = fields.pass;
    var email = fields.email;
    var avatar = fields.avatar ? '/upload/avatar/' + user + '.jpg' : "/upload/avatar/moren.jpg";
    var sex = fields.sex;
    var born = fields.born;
    var city = fields.city;
    var hobby = fields.hobby;
    var label = fields.label;
    var sign = fields.sign;




    //查询数据库中是不是有这个人
    User.find({"user": user}, function (err, result) {
      if (err) {
        res.send("-3"); //服务器错误
        return;
      }
      if (result.length !== 0) {
        res.send("-1"); //被占用
        return;
      }
      //设置md5加密
      pass = md5(md5(pass) + "考拉");
      //现在可以证明，用户名没有被占用
      User.create({
        user: user,
        name: name,
        pass: pass,
        email: email,
        avatar: avatar,
        sex: sex,
        born: born,
        city: city,
        hobby: hobby,
        label: label,
        sign: sign,
        visits: 0
      }, function (err, result) {
        if (err) {
          res.send("-3"); //服务器错误
          return;
        }
        if (fields.avatar) {
          var oldpath = path.normalize(__dirname + "/.." + fields.avatar);
          var newName = user + ".jpg";
          var newpath = path.normalize(__dirname + "/../upload/avatar") + "/" + newName;
          fs.rename(oldpath, newpath);
        }
        console.log('注册成功');
        req.session.login = user;
        res.json({result: "1", info: {user: user, name: name, avatar: avatar}}); // 注册成功
      })
    })
  });
};


// 获取城市列表
exports.getCitys = function (req, res, next) {
  db.find("citys", {}, function (err, result) {
    if (err) {
      res.send("-1"); //服务器错误
      return;
    }
    res.json(result[0].citys);
  });
};
// 生成验证码
exports.getCaptcha = function (req, res, next) {
  var captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;

  res.set('Content-Type', 'image/svg+xml');
  res.status(200).send(captcha.data);
};

// 校验验证码
exports.checkCaptcha = function (req, res, next) {
  var captcha = req.session.captcha.toLocaleLowerCase();
  res.status(200).json({result: captcha});
};

// 查找数据库中是否有这个用户
// exports.findUser = function (req, res, next) {
//   var user = req.params["user"];
//   //查询数据库中是不是有这个人
//   db.find("users", {"user": user}, function (err, result) {
//     if (err) {
//       res.send("-3"); //服务器错误
//       return;
//     }
//     if (result.length !== 0) {
//       res.send("-1"); //被占用
//     } else {
//       res.send("1");
//     }
//   });
// };
// 使用mongoose查找数据库中是否有这个用户
exports.findUser = function (req, res, next) {
  var user = req.params["user"];
  //查询数据库中是不是有这个人
  User.find({"user": user}, function (err, result) {
    if (err) {
      res.send("-3"); //服务器错误
      return;
    }
    if (result.length !== 0) {
      res.send("-1"); //被占用
    } else {
      res.send("1");
    }
  })
};

// 上传图片
exports.uploadTemp = function (req, res, next) {
  // 先判断upload/avatar文件夹是否存在，不存在就创建
  var uploadDir = fs.existsSync("./upload");
  var tempDir = fs.existsSync("./upload/temp");

  if (!uploadDir) {
    console.log('创建upload文件夹');
    fs.mkdirSync("./upload");
  }

  if (!tempDir) {
    console.log('创建upload/avatar文件夹');
    fs.mkdirSync("./upload/temp");
  }


  var form = new formidable.IncomingForm();
  form.uploadDir = path.normalize(__dirname + "/../upload/temp");
  form.parse(req, function (err, fields, files) {
    // console.log(files);
    var oldpath = files.avatar.path;
    var newName = new Date().getTime() + ".jpg";
    var newpath = path.normalize(__dirname + "/../upload/temp") + "/" + newName;
    fs.rename(oldpath, newpath, function (err) {
      if (err) {
        res.send("失败");
        return;
      }
      res.send({'id': 101, 'path': '/upload/temp/' + newName});
    });
  });
};

// 登录
exports.dologin = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    //得到表单之后做的事情
    var user = fields.user;
    var pass = fields.pass;

    //设置md5加密
    pass = md5(md5(pass) + "考拉");
    User.find({"user": user, "pass": pass}, 'name avatar visits', function (err, result) {
      if (err) {
        res.json({result: "-3"}); // 服务器错误
        return;
      }
      if (result.length !== 0) {
        // 设置session
        req.session.login = {
          user: user,
          name: result[0].name,
          avatar: result[0].avatar
        };
        res.json({
          result: "1",
          login: {user: user, name: result[0].name, avatar: result[0].avatar, visits: result[0].visits}
        }); // 登录成功
      } else {
        res.json({result: "-1"}); // 登录失败，密码错误
      }
    })
  });
};

// 找回密码之验证邮箱
exports.checkEmail = function (req, res, next) {
  var user = req.params["user"];
  var email = req.params["email"];
  //查询数据库中是不是有这个人
  User.find({"user": user, "email": email}, function (err, result) {
    if (err) {
      res.send("-3"); //服务器错误
      return;
    }
    if (result.length !== 0) {
      res.send("1"); // 验证成功
    } else {
      res.send("-1"); // 验证失败，邮箱错误
    }
  })
};

// 检查登录状态
exports.checkLogin = function (req, res, next) {
  var user = req.query.user;

  var login = req.session.login || '';
  if (login !== '') {

    User.find({"user": login.user}, 'name avatar visits', function (err, result) {
      if (err) {
        res.json({result: "-3"}); // 服务器错误
        return;
      }
      var isLoginUser = true;
      if (user !== '' && user !== login.user) {
        User.find({"user": user}, 'name avatar visits', function (err, result1) {
          if (result1.length === 0) {
            res.json({result: "-2"}); // 没有这个用户
          } else {
            isLoginUser = false;

            res.json({
              result: "1",
              login: {user: login.user, name: result[0].name, avatar: result[0].avatar, visits: result[0].visits},
              user: {user: user, name: result1[0].name, avatar: result1[0].avatar, visits: result1[0].visits},
              isLoginUser: isLoginUser
            });
          }
        });
      } else {
        res.json({
          result: "1",
          login: {user: login.user, name: result[0].name, avatar: result[0].avatar, visits: result[0].visits},
          isLoginUser: isLoginUser
        });
      }
    });
  } else {
    res.json({result: '-1'});
  }
};

exports.exit = function (req, res, next) {
  req.session.login = '';
  req.session.user = '';
  res.send('1');
};

// 设置显示的用户
exports.setUser = function (req, res, next) {
  var user = req.params["user"];
  //查询数据库中是不是有这个人
  User.find({"user": user}, function (err, result) {
    if (err) {
      res.json({result: "-3"}); //服务器错误
      return;
    }
    if (result.length !== 0) {
      req.session.user = user;
      res.json({result: "1"}); // 验证成功
    } else {
      res.json({result: "-1"}); // 验证失败，邮箱错误
    }
  })
};

// 新建说说
exports.newMood = function (req, res, next) {

  // 先判断upload/moodImg文件夹是否存在，不存在就创建
  var avatarDir = fs.existsSync("./upload/moodImg");

  if (!avatarDir) {
    console.log('创建upload/moodImg文件夹');
    fs.mkdirSync("./upload/moodImg");
  }

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {

    var time = new Date();
    var user = req.session.login.user;
    var name = req.session.login.name;
    var avatar = req.session.login.avatar;
    var moodText = fields.moodText;
    var moodImg = fields.moodImg;
    if (moodImg.length) {
      console.log('有图片');
      for (var i = 0; i < moodImg.length; i++) {
        console.log(moodImg[i]);
        var oldpath = path.normalize(__dirname + "/.." + moodImg[i]);
        var newName = time.getTime() + '(' + i + ')' + ".jpg";
        console.log(newName);
        var newpath = path.normalize(__dirname + "/../upload/moodImg") + "/" + newName;
        fs.renameSync(oldpath, newpath);
        moodImg[i] = "/upload/moodImg/" + newName;
      }
    }



    Mood.create({
      time: time,
      user: user,
      name: name,
      avatar: avatar,
      body: {
        text: moodText,
        img: moodImg
      }
    }, function (err, mood) {
      if (err) {
        res.json({result: "-3"}); //服务器错误
        return;
      }
      Log.create({
        type: 'mood',
        time: time,
        user: user,
        name: name,
        avatar: avatar,
        body: mood._id
      }, function (err1, log) {
        if (err1) {
          res.json({result: "-3"}); //服务器错误
          return;
        }
        console.log('发表成功');
        res.json({result: '1'});
      });
    })

  });

};

// 删除说说
exports.dlMood = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var id = fields.id;

    Mood.remove({_id: id}, function (err) {
      if (err) {
        res.json({result: "-3"}); //删除失败
        return;
      }
      Log.remove({body: id}, function (err1) {
        if (err1) {
          res.json({result: "-3"}); //删除失败
          return;
        }
        console.log('删除成功');
        res.json({result: '1'});
      })
    });
  });
};

// 添加说说评论
exports.addMoodComment = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var moodId = fields.moodId;
    var user = req.session.login.user;
    var name = req.session.login.name;
    var avatar = req.session.login.avatar;
    var content = fields.content;

    var pinglun = {
      moodId: moodId,
      body: {
        user: user,
        name: name,
        time: new Date(),
        avatar: avatar,
        content: content
      }
    };

    Mood.pinglun(pinglun, function (err) {
      if (err) {
        res.json({result: "-3"}); //服务器错误
        return;
      }
      console.log('评论成功');
      res.json({result: '1'});
    });
  });
};

// 删除说说评论
exports.dlMoodComment = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var moodId = fields.moodId;
    var comment = fields.comment;

    var pinglun = {
      moodId: moodId,
      comment: comment
    };

    Mood.dlPinglun(pinglun, function (err) {
      if (err) {
        res.json({result: "-3"}); //服务器错误
        return;
      }
      console.log('删除评论成功');
      res.json({result: '1'});
    });
  });
};

// 点赞
exports.thumbsUp = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var moodId = fields.moodId;
    var status = fields.status;
    var user = req.session.login.user;
    var name = req.session.login.name;
    var thumbsUp = {
      moodId: moodId,
      body: {
        user: user,
        name: name
      }
    };

    if (status) {
      Mood.cancelThumbsUp(thumbsUp, function (err) {
        if (err) {
          res.json({result: "-3"}); //服务器错误
          return;
        }
        console.log('取消点赞成功');
        res.json({result: '1'});
      });
    } else {
      Mood.thumbsUp(thumbsUp, function (err) {
        if (err) {
          res.json({result: "-3"}); //服务器错误
          return;
        }
        console.log('点赞成功');
        res.json({result: '1'});
      });
    }
  });
};

// 获取空间动态
exports.getStatus = function (req, res, next) {
  var query = req.query; // 有user、all（是否显示所有好友的）、type

  console.log(query);

  var obj = {
    user: [query.user],
    type: query.type,
    page: query.page-1,
    pageSize: query.pageSize
  };

  var status = [];

  if (query.all === 'true') {
    console.log(query.all);

    User.find({user: query.user}, 'friends', function (err, data) {
      if (err) {
        res.send('-3'); // 查询数据库出错
        return;
      }

      for (var i = 0; i < data[0].friends.length; i++) {
        obj.user.push(data[0].friends[i].user);
      }
      // obj.user.push.apply(obj.user, data.friends); // 合并数组

      // console.log(data[0].friends);

      Log.getTotal(obj, function (err, total) {
        Log.getStatus(obj, function (err, logs) {
          // res.send(logs);

          (function iterator(i) {
            //遍历结束
            if (i === logs.length) {
              console.log('遍历完成');
              res.json({
                result: '1',
                status: status,
                total: total.length
              });
              return;
            }
            if (logs[i].type === 'mood') {
              Mood.findById(logs[i].body, function (err, mood) {
                status.push(mood);
                iterator(i + 1);
              })
            }
          })(0);
        })
      });
    })
  }
};

exports.newLog = function (req, res, next) {
  Log.create({
    type: 'album',
    time: (new Date()).getTime(),
    user: 'gyt',
    name: '高玉婷',
    avatar: 'aksdjkasdas',
    body: '590b4af6b5002c025778586b'
  },function (err, log) {
    res.send('插入成功');
  })
};
