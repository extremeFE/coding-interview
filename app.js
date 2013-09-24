
/**
 * Module dependencies.
 */

var express = require('express')
  , socketio = require('socket.io')
  , routes = require('./routes')
  , mail = require('./routes/mail')
  , http = require('http')
  , path = require('path')
  , requirejs = require('requirejs')
  , _ = require('underscore')
  , cnst = requirejs('public/js/share/const');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/interview', routes.interview);
app.post('/createInterview', routes.createInterview);
app.post('/invite', routes.invite);
app.post('/sendInviteMail', routes.sendInviteMail);

var server = http.createServer(app),
    io = socketio.listen(server),
    users = {};

io.sockets.on('connection', function (socket) {
  socket.on('checkUserList', function(data) {
    if( !users[data.id] ){
      users[data.id] = [];
    }
    io.sockets.emit('updateUserList', {id:data.id, users:users[data.id]});
  });

  socket.on('addUser', function(data) {
    socket.chatData = data;
    socket.index = users.length;
    if (!_.findWhere(users[data.id], {nickname: data.nickname})) {
      users[data.id].push({type:data.type, nickname:data.nickname});
    }
    io.sockets.emit('updateUserList', {id:data.id, users:users[data.id]});
  });

  socket.on('sendChat', function(data) {
    //id별로 보낼 수 있게 처리 필요
    io.sockets.emit('updateChat', {id:data.id, nickname: socket.chatData.nickname, type: socket.chatData.type, chat: data.chat});
  });

  socket.on('sendMemo', function(data) {
    routes.updateMemo(data, function(result){
      io.sockets.emit('updateMemo', result);
    });
  });

  socket.on('saveQuestion', function(data) {
    routes.saveQuestion(data, function(state) {
      io.sockets.emit('updateQuestion', {id:data.id, content:data.content, state: state});
    });
  });

  socket.on('saveAnswer', function(data) {
    routes.saveAnswer(data, function(){
      io.sockets.emit('updateAnswer', data);
    });

    if (!data.memoData) { return; }

    data.memoData.id = data.id;
    routes[data.memoData.updateType](data.memoData, function(emitType){
      io.sockets.emit(emitType, data.memoData);
    });
  });

  socket.on('finishCoding', function(data) {
    routes.changeInterviewState(data.id, 'ESTIMATION', function() {
      io.sockets.emit('startEstimation', {id:data.id});
    });
  });

  socket.on('finishInterview', function(data) {
    routes.changeInterviewState(data.id, 'END', function() {
      io.sockets.emit('endInterview', {id:data.id});
    });
  });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


