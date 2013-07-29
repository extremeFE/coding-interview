
/*
 * GET home page.
 */

var model = require('./questionModel');
var crypto = require("crypto");
var mail = require('./mail');
var _ = require("underscore");

var interviewTemplate = '<h3>실시간 코딩 인터뷰 페이지 생성 완료</h3>' +
    '<p>실시간 코딩 인터뷰 페이지가 생성되었습니다.</p>' +
    '<p>입력하신 메일 주소로 아래와 같은 접속 url 정보를 전달했습니다.</p>' +
    '<p>면접관과 지원자의 접속 url은 해당 페이지에서 당사자에게 바로 전달할 수 있습니다.</p>' +
    '<h5>관리자 접속 url</h5>' +
    '<p>&nbsp; <a href="http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.adminKey %>" trget="_blank">http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.adminKey %></a></p>' +
    '<h5>면접관 접속 url</h5>' +
    '<p>&nbsp; <a href="http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.interviewerKey %>" trget="_blank">http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.interviewerKey %></a></p>' +
    '<p>' +
    '&nbsp; 면접관에게 발송' +
    '<input id="email" type="text" class="input-small" placeholder="Email을 입력하세요." style="width:200px;margin-bottom:0px;">' +
    '<button id="create" type="button" class="btn">메일 발송</button>' +
    '</p>' +
    '<h5>지원자 접속 url</h5>' +
    '<p>&nbsp; <a href="http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.interviewerKey %>" trget="_blank">http://localhost:3000/#/interview/?id=<%= interview._id %>&type=<%= interview.interviewerKey %></a></p>' +
    '<p>' +
    '&nbsp; 지원자에게 발송' +
    '<input id="email" type="text" class="input-small" placeholder="Email을 입력하세요." style="width:200px;margin-bottom:0px;">' +
    '<button id="create" type="button" class="btn">메일 발송</button>' +
    '</p>';

exports.interview = function(req, res) {
  model.find(function (err, docs) {
    if (err) return next(err);
    res.send({ id: docs[0]._id, content: docs[0].content });
  });
};

var getKey = function(str) {
  var sha1 = crypto.createHash("sha1");
  sha1.update(str, "utf8");
  return sha1.digest("base64");
};

exports.create = function(req, res){
  var email = req.body.mail;
  var time = new Date().getTime();
  var hData = {
    adminKey: getKey(time+'admin'),
    interviewerKey: getKey(time+'interviewer'),
    applicantKey: getKey(time+'applicant'),
    content:'<p>문제 영역 입니다.</p>'
  };

  return model.create(hData, function(err, hResult){
    var content = _.template(interviewTemplate, {interview: hResult});
    mail.sendMail(email, content)
    res.send(hResult);
  });
};