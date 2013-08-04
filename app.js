
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

var server = http.createServer(app);
var io = socketio.listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('saveQuestion', function(data){
    routes.saveQuestion(data, function() {
      io.sockets.emit('updateQuestion', data.content);
    });
  });

  socket.on('saveAnswer', function(data){
    routes.saveAnswer(data, function(){
      io.sockets.emit('updateAnswer', data);
    });
  });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


