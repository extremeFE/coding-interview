
/**
 * Module dependencies.
 */

var express = require('express')
  , socketio = require('socket.io')
  , routes = require('./routes')
  , mail = require('./routes/mail')
  , http = require('http')
  , path = require('path');

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
//app.post('/saveQuestion', routes.saveQuestion);

var server = http.createServer(app),
    io = socketio.listen(server),
    usernames = {},
    typeCounts = {ADMIN:0, INTERVIEWER:0, APPLICANT:0},
    names = {ADMIN:'관리자', INTERVIEWER:'면접관', APPLICANT:'지원자'};

io.sockets.on('connection', function (socket) {
  socket.on('addUser', function(data) {
    var typeCount = typeCounts[data.type] + 1;
    typeCounts[data.type] = typeCount;
    var username = names[data.type] + (typeCount===1 ? '' : typeCount);
    socket.username = username
    usernames[username] = username;
  });

  socket.on('sendChat', function(data) {
    io.sockets.emit('updateChat', {username: socket.username, chat: data.chat});
  });

  socket.on('sendMemo', function(data) {
    routes.updateMemo(data, function(result){
      io.sockets.emit('updateMemo', result);
    });
  });

  socket.on('saveQuestion', function(data){
    routes.saveQuestion(data, function() {
      io.sockets.emit('updateQuestion', data.content);
    });
  });

  socket.on('saveAnswer', function(data){
    routes.saveAnswer(data, function(){
      io.sockets.emit('updateAnswer', data);
    });

    if (!data.memoData) { return; }

    data.memoData.id = data.id;
    routes[data.memoData.updateType](data.memoData, function(emitType){
      io.sockets.emit(emitType, data.memoData);
    });
  });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


