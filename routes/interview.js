var model = require('./interviewModel');
var crypto = require("crypto");
var mail = require('./mail');
var _ = require("underscore");

var interviewTemplate = '<h3>실시간 코딩 인터뷰 페이지 생성 완료</h3>' +
    '<p>실시간 코딩 인터뷰 페이지가 생성되었습니다.</p>' +
    '<h5>관리자 접속 url</h5>' +
    '<p>&nbsp; <a href="http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.adminKey %>" trget="_blank">http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.adminKey %></a></p>' +
    '<h5>면접관 접속 url</h5>' +
    '<p>&nbsp; <a href="http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.interviewerKey %>" trget="_blank">http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.interviewerKey %></a></p>' +
    '<h5>지원자 접속 url</h5>' +
    '<p>&nbsp; <a href="http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.applicantKey %>" trget="_blank">http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.applicantKey %></a></p>';

exports.interview = function(req, res) {
  var id = req.body.id;
  var key = req.body.type;
  model.find({_id:id}, function (err, docs) {
    var type;
    var hData = docs[0];

    if (hData.adminKey === key) {
      type = 'ADMIN';
    } else if (hData.interviewerKey === key) {
      type = 'INTERVIEWER';
    } else {
      type = 'APPLICANT';
    }
    
    if (err) return next(err);
    res.send({ id: hData._id, content: hData.content, type: type });
  });
};

var getKey = function(str) {
  var sha1 = crypto.createHash("sha1");
  sha1.update(str, "utf8");
  return sha1.digest("hex");
};

exports.create = function(req, res) {
  var email = req.body.mail;
  var time = new Date().getTime();
  var hData = {
    adminKey: getKey(time+'admin'),
    interviewerKey: getKey(time+'interviewer'),
    applicantKey: getKey(time+'applicant')
  };

  model.create(hData, function(err, hResult){
    var content = _.template(interviewTemplate, {interview: hResult});
    mail.sendMail(email, content)
    res.send(hResult);
  });
};

exports.saveQuestion = function(req, res) {
  var id = req.body.id;
//  var type = req.body.type;
  var content = req.body.content;
  model.update({_id:id}, {content:content}, null, function(err){
    res.send('success');
  });
};