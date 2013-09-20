var model = require('./interviewModel');
var crypto = require("crypto");
var mail = require('./mail');
var _ = require("underscore");
var requirejs = require('requirejs');
var cnst = requirejs('public/js/share/const');

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
    if (err) return next(err);
    var type;
    var hData = docs[0];
console.log('admin:', cnst);
    if (hData.adminKey === key) {
      type = cnst.MEM_ADMIN;
    } else if (hData.interviewerKey === key) {
      type = cnst.MEM_INTERVIEWER;
    } else {
      type = cnst.MEM_APPLICANT;
    }

    res.send({ id: hData._id, content: hData.content, answer: hData.answer, memo: hData.memo, type: type, state: hData.state });
  });
};

var getKey = function(str) {
  var sha1 = crypto.createHash("sha1");
  sha1.update(str, "utf8");
  return sha1.digest("hex");
};

exports.createInterview = function(req, res) {
  var email = req.body.mail;
  var time = new Date().getTime();
  var hData = {
    state: 'START',
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

exports.saveAnswer = function(data, callback) {
  var id = data.id;
  var answer = data.answer;
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

exports.updateMemo = function(data, callback) {
  model.find({_id:data.id}, function (err, docs) {
    var memo = docs[0].memo || [];
    var result;
    if (data.updateType === 'insert') {
      if (!memo[data.row]) memo[data.row] = [];
      data.memoData.memoId = 'memo-' + (new Date().getTime());
      memo[data.row].push(data.memoData);
      result = {row:data.row, updateType:data.updateType, memo:memo[data.row]};
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
      result = {row:data.row, updateType:data.updateType, memo:memo[data.row]};
    }

    model.update({_id:data.id}, {memo:memo}, null, function(err){
      callback(result);
    });
  });
};

exports.changeInterviewState = function(id, state, callback) {
  model.update({_id:id}, {state:state}, null, function(err){
    callback();
  });
};