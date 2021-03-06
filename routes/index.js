var model = require('./interviewModel');
var crypto = require("crypto");
var mail = require('./mail');
var _ = require("underscore");
var requirejs = require('requirejs');
var cnst = requirejs('public/js/share/const');

var interviewTemplate = _.template('<h3>실시간 코딩 인터뷰 페이지 생성 완료</h3>' +
    '<p>실시간 코딩 인터뷰 페이지가 생성되었습니다.</p>' +
    '<h5>초대 페이지 접속 url</h5>' +
    '<p>&nbsp; <a href="http://<%= locationHost %>/#/invite/?id=<%= _id %>&type=<%= adminKey %>" trget="_blank">http://<%= locationHost %>/#/invite/?id=<%= _id %>&type=<%= adminKey %></a></p>' +
    '<h5>인터뷰 페이지 접속 url</h5>' +
    '<p>&nbsp; <a href="http://<%= locationHost %>/#/interview/?id=<%= _id %>&type=<%= adminKey %>" trget="_blank">http://<%= locationHost %>/#/interview/?id=<%= _id %>&type=<%= adminKey %></a></p>');

var inviteTemplate = _.template('<h3><%=content %></h3>' +
    '<h5>인터뷰 페이지 접속 url</h5>' +
    '<p>&nbsp; <a href="http://<%= locationHost %>/#/interview/?id=<%= id %>&type=<%= key %>" trget="_blank">http://<%= locationHost %>/#/interview/?id=<%= id %>&type=<%= key %></a></p>');

// 코딩 인터뷰 페이지
exports.interview = function(req, res) {
  var id = req.body.id,
      key = req.body.type;
  model.find({_id:id}, function (err, docs) {
    if (err) return next(err);
    var type,
        hData = docs[0],
        hResult = {};
    if (hData.adminKey === key) {
      type = cnst.MEM_ADMIN;
    } else if (hData.interviewerKey === key) {
      type = cnst.MEM_INTERVIEWER;
    } else if (hData.applicantKey === key) {
      type = cnst.MEM_APPLICANT;
    }

    if (type !== undefined) {
      hResult = { id: hData._id, content: hData.content, answer: hData.answer, memo: hData.memo, type: type, state: hData.state };
    }
    res.send(hResult);
  });
};

// 초대 페이지
exports.invite = function(req, res) {
  var id = req.body.id,
      key = req.body.type;
  model.find({_id:id}, function (err, docs) {
    if (err) return next(err);
    var hData = docs[0],
        hResult = {};
    if (hData.adminKey === key) {
      hResult = { id: hData._id, adminKey: hData.adminKey, interviewerKey: hData.interviewerKey, applicantKey: hData.applicantKey };
    }

    res.send(hResult);
  });
};

// 초대 메일 발송
exports.sendInviteMail = function(req, res) {
  var email = req.body.mail,
      content = req.body.content,
      hData = {
        id : req.body.id,
        locationHost:req.body.locationHost,
        key : req.body.key,
        content : content
      };

  mail.sendMail(email, content, inviteTemplate(hData));
  res.send();
};

// 키 생성
var getKey = function(str) {
  var sha1 = crypto.createHash("sha1");
  sha1.update(str, "utf8");
  return sha1.digest("hex");
};

// 인터뷰 페이지 생성
exports.createInterview = function(req, res) {
  var email = req.body.mail,
      time = (new Date()).getTime(),
      locationHost = req.body.locationHost,
      hData = {
        state: 'START',
        adminKey: getKey(time+'admin'),
        interviewerKey: getKey(time+'interviewer'),
        applicantKey: getKey(time+'applicant')
      };

  model.create(hData, function(err, hResult){
    hResult.locationHost = locationHost;
    mail.sendMail(email, '코딩 인터뷰 페이지를 생성했습니다.', interviewTemplate(hResult));
    res.send(hResult);
  });
};

// 문제 저장
exports.saveQuestion = function(data, callback) {
  var resultState,
      updateData  = {content:data.content};
  model.find({_id:data.id}, function (err, docs) {
    var state = docs[0].state;
    if (state === 'START') {
      updateData['state'] = resultState = 'TEST';
    }
    model.update({_id:data.id}, updateData, null, function(err){
      callback(resultState);
    });
  });
};

// 답변 저장
exports.saveAnswer = function(data, callback) {
  var id = data.id,
      answer = data.answer;
  model.update({_id:id}, {answer:answer}, null, function(err){
    callback();
  });
};

exports.addLine = function(data, callback) {
  model.find({_id:data.id}, function (err, docs) {
    var memo = docs[0].memo || [];
    memo.splice(data.startRow, 0, undefined);
    model.update({_id:data.id}, {memo:memo}, null, function(err){
      callback('addedLine');
    });
  });
};

exports.removeLines = function(data, callback) {
  model.find({_id:data.id}, function (err, docs) {
    var memo = docs[0].memo || [];
    memo.splice(data.startRow, data.lineLen);
    model.update({_id:data.id}, {memo:memo}, null, function(err){
      callback('removedLines');
    });
  });
};

// 메모 추가, 수정, 삭제
exports.updateMemo = function(data, callback) {
  model.find({_id:data.id}, function (err, docs) {
    var memo = docs[0].memo || [];
    var result;
    if (data.updateType === 'insert') {
      if (!memo[data.row]) memo[data.row] = [];
      data.memoData.memoId = 'memo-' + (new Date().getTime());
      memo[data.row].push(data.memoData);
      result = {id:data.id, row:data.row, updateType:data.updateType, memo:memo[data.row]};
    } else {
      var aMemoData = memo[data.row];
      if (!aMemoData) {
        throw "데이터가 없습니다.";
      }

      var index;
      for(var i=0; i<aMemoData.length; i++) {
        if (aMemoData[i].memoId === data.memoData.memoId) {
          index = i;
          break;
        }
      }

      if (index === undefined) {
        return;
      }

      if (data.updateType === 'update') {
        memo[data.row][index] = data.memoData;
      } else if (data.updateType === 'delete') {
        memo[data.row].splice(index, 1);
      }
      result = {id:data.id, row:data.row, updateType:data.updateType, memo:memo[data.row]};
    }

    model.update({_id:data.id}, {memo:memo}, null, function(err){
      callback(result);
    });
  });
};

// 인터뷰 상태 변경
exports.changeInterviewState = function(id, state, callback) {
  model.update({_id:id}, {state:state}, null, function(err){
    callback();
  });
};
