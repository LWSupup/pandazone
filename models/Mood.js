/**
 * Created by auven on 2017/5/4.
 */
var mongoose = require('mongoose');
var db = require("./dbs.js");

var commentSchema = new mongoose.Schema({
  user: String,
  name: String,
  avatar: String,
  time: Date,
  content: String
});

var thumbsUpSchema = new mongoose.Schema({
  user: String,
  name: String
});

var moodSchema = new mongoose.Schema({
  type      :   {type : String, default: 'mood'},
  time      :   {type : Date},
  user      :   {type : String},
  name      :   {type : String},
  avatar    :   {type : String},
  body      :   { text: String, img: [String] },
  comments   :   [commentSchema],
  thumbsUp  :   [thumbsUpSchema]
});

// 评论
moodSchema.statics.pinglun = function (obj, callback) {
  this.model('Mood').findOne({_id: obj.moodId}, function (err, mood) {
    if (!mood) {
      return;
    }
    mood.comments.push(obj.body);
    mood.save(callback);
  })
};

// 删除评论
moodSchema.statics.dlPinglun = function (obj, callback) {
  this.model('Mood').update({_id: obj.moodId}, {$pull: {comments: obj.comment}}, callback);
};

// 点赞
moodSchema.statics.thumbsUp = function (obj, callback) {
  this.model('Mood').findOne({_id: obj.moodId}, function (err, mood) {
    if (!mood) {
      return;
    }
    var flag = true;
    for (var i = 0; i < mood.thumbsUp.length; i++) {
      if (mood.thumbsUp[i].user === obj.body.user) {
        flag = false;
        break;
      }
    }
    if (flag) {
      mood.thumbsUp.push(obj.body);
    }
    mood.save(callback);
  })
};

// 取消点赞
moodSchema.statics.cancelThumbsUp = function (obj, callback) {
  this.model('Mood').update({_id: obj.moodId}, {$pull: {thumbsUp: {user: obj.body.user}}}, callback);
};

var moodModel = db.model('Mood', moodSchema);
module.exports = moodModel;
